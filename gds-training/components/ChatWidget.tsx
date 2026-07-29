"use client";

import { useState, useEffect, useRef } from "react";
import { ref, push, set, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import {
    MessageCircle,
    X,
    Send,
    ChevronDown,
    Headphones,
    Loader2,
} from "lucide-react";

interface Message {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    senderRole: "student" | "admin";
    timestamp: string;
    read: boolean;
}

export default function ChatWidget() {
    const { user, profile } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [unread, setUnread] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const studentId = user?.uid || "";
    const chatPath = `chats/${studentId}`;

    // Subscribe to messages
    useEffect(() => {
        if (!user || profile?.role === "admin") return;
        const messagesRef = ref(db, `${chatPath}/messages`);
        const unsub = onValue(messagesRef, (snap) => {
            const data = snap.val();
            if (data) {
                const list = Object.entries(data)
                    .map(([id, val]: [string, any]) => ({ id, ...val } as Message))
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                setMessages(list);

                // If widget is open, mark all unread admin messages as read immediately
                const unreadAdminMsgs = list.filter((m) => m.senderRole === "admin" && !m.read);
                if (open && unreadAdminMsgs.length > 0) {
                    const updates: Record<string, boolean> = {};
                    unreadAdminMsgs.forEach((m) => {
                        updates[`${chatPath}/messages/${m.id}/read`] = true;
                    });
                    update(ref(db), updates).catch(() => {});
                    setUnread(0);
                } else if (!open) {
                    setUnread(unreadAdminMsgs.length);
                }
            } else {
                setMessages([]);
            }
        });
        return () => unsub();
    }, [user, profile?.role, chatPath, open]);


    // Scroll to bottom
    useEffect(() => {
        if (!user || profile?.role === "admin") return;
        if (open) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [messages, open, user, profile?.role]);

    // Don't render for non-logged-in users or admins (CHECKED HERE AFTER ALL HOOKS ARE DECLARED)
    if (!user || profile?.role === "admin") return null;

    const handleSend = async () => {
        if (!text.trim() || sending || !user) return;
        setSending(true);
        const msgText = text.trim();
        setText("");

        try {
            const now = new Date().toISOString();
            const studentName = profile?.displayName || user.email?.split("@")[0] || "Student";

            // Add message
            const msgRef = push(ref(db, `${chatPath}/messages`));
            await set(msgRef, {
                id: msgRef.key,
                text: msgText,
                senderId: user.uid,
                senderName: studentName,
                senderRole: "student",
                timestamp: now,
                read: false,
            });

            // Update chat metadata
            await update(ref(db, chatPath), {
                studentId: user.uid,
                studentName,
                studentEmail: user.email || "",
                lastMessage: msgText,
                lastMessageAt: now,
                unreadByAdmin: (messages.filter((m) => m.senderRole === "student" && !m.read).length || 0) + 1,
            });

            // Create admin notification
            const notifRef = push(ref(db, "notifications"));
            await set(notifRef, {
                id: notifRef.key,
                type: "new_chat",
                message: `${studentName}: ${msgText.slice(0, 60)}${msgText.length > 60 ? "..." : ""}`,
                link: "/admin/chat",
                read: false,
                createdAt: now,
            });
        } catch (err) {
            console.error("Failed to send message:", err);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getTime = (ts: string) => {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
            {/* Chat Window */}
            {open && (
                <div className="w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-aviation-100 overflow-hidden flex flex-col"
                    style={{ height: "480px", maxHeight: "calc(100vh - 10rem)" }}>

                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-aviation-700 to-aviation-600 px-4 py-3 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                                <Headphones className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm leading-none">GDS Support</p>
                                <p className="text-aviation-200 text-xs mt-0.5 flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
                                    Online · Typically replies in minutes
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-white/70 hover:text-white transition-colors"
                        >
                            <ChevronDown className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/50">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center gap-2 py-8 text-center">
                                <div className="h-12 w-12 rounded-full bg-aviation-100 flex items-center justify-center">
                                    <MessageCircle className="h-6 w-6 text-aviation-600" />
                                </div>
                                <p className="text-sm font-semibold text-slate-700">How can we help you?</p>
                                <p className="text-xs text-slate-400">Send a message and our team will reply shortly.</p>
                            </div>
                        )}

                        {messages.map((msg) => {
                            const isMe = msg.senderRole === "student";
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                                        <div
                                            className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                                                isMe
                                                    ? "bg-aviation-600 text-white rounded-br-sm"
                                                    : "bg-white border border-aviation-100 text-ink rounded-bl-sm shadow-sm"
                                            }`}
                                        >
                                            {msg.text}
                                        </div>
                                        <span className="text-[11px] text-slate-400 px-1">
                                            {getTime(msg.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="shrink-0 border-t border-aviation-100 bg-white p-3 flex items-end gap-2">
                        <textarea
                            ref={inputRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            rows={1}
                            className="flex-1 resize-none rounded-xl border border-aviation-100 px-3.5 py-2.5 text-sm outline-none focus:border-aviation-400 focus:ring-2 focus:ring-aviation-500/10 transition-all max-h-24 overflow-y-auto"
                            style={{ lineHeight: "1.5" }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!text.trim() || sending}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-aviation-600 text-white hover:bg-aviation-700 disabled:opacity-50 transition-colors"
                        >
                            {sending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative flex h-14 w-14 items-center justify-center rounded-full bg-aviation-600 hover:bg-aviation-700 text-white shadow-lg hover:shadow-aviation-600/40 transition-all hover:scale-105 active:scale-95"
                aria-label="Open support chat"
            >
                {open ? (
                    <X className="h-6 w-6" />
                ) : (
                    <MessageCircle className="h-6 w-6" />
                )}
                {!open && unread > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-red-500 border-2 border-white text-white text-[10px] font-bold flex items-center justify-center px-1">
                        {unread}
                    </span>
                )}
            </button>
        </div>
    );
}
