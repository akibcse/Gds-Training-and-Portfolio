"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ref, onValue, push, set, update, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import {
    MessageCircle,
    Send,
    Search,
    User,
    Loader2,
    CheckCheck,
    Clock,
    ArrowLeft,
    UserPlus,
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

interface Chat {
    studentId: string;
    studentName: string;
    studentEmail: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadByAdmin: number;
    messages?: Record<string, Message>;
}

function AdminChatContent() {
    const { user, profile } = useAuthStore();
    const searchParams = useSearchParams();

    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [reply, setReply] = useState("");
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState("");
    const [initializing, setInitializing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Handle URL params: studentId, name, email (from Users page "Chat" button)
    useEffect(() => {
        const studentIdParam = searchParams?.get("studentId");
        const nameParam = searchParams?.get("name");
        const emailParam = searchParams?.get("email");

        if (!studentIdParam) return;

        // Check if chat already exists in loaded chats
        const existingChat = chats.find(c => c.studentId === studentIdParam);
        if (existingChat) {
            setSelectedChat(existingChat);
            return;
        }

        // Check Firebase directly (in case chats haven't loaded yet)
        setInitializing(true);
        const chatRef = ref(db, `chats/${studentIdParam}`);
        get(chatRef).then((snap) => {
            if (snap.exists()) {
                setSelectedChat(snap.val() as Chat);
            } else {
                // Create a placeholder chat thread for admin to initiate
                const placeholder: Chat = {
                    studentId: studentIdParam,
                    studentName: nameParam || "Student",
                    studentEmail: emailParam || "",
                    lastMessage: "",
                    lastMessageAt: "",
                    unreadByAdmin: 0,
                };
                setSelectedChat(placeholder);
            }
        }).catch(() => {
            const placeholder: Chat = {
                studentId: studentIdParam,
                studentName: nameParam || "Student",
                studentEmail: emailParam || "",
                lastMessage: "",
                lastMessageAt: "",
                unreadByAdmin: 0,
            };
            setSelectedChat(placeholder);
        }).finally(() => setInitializing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Re-check when chats load (match URL param to loaded chat)
    useEffect(() => {
        const studentIdParam = searchParams?.get("studentId");
        if (!studentIdParam || !chats.length) return;
        const existingChat = chats.find(c => c.studentId === studentIdParam);
        if (existingChat && selectedChat?.studentId === studentIdParam) {
            setSelectedChat(existingChat);
        }
    }, [chats, searchParams, selectedChat?.studentId]);

    // Load all chat threads
    useEffect(() => {
        const chatsRef = ref(db, "chats");
        const unsub = onValue(chatsRef, (snap) => {
            const data = snap.val();
            if (data) {
                const list = Object.values(data)
                    .sort((a: any, b: any) =>
                        new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
                    ) as Chat[];
                setChats(list);
            } else {
                setChats([]);
            }
        });
        return () => unsub();
    }, []);

    // Load messages for selected chat
    useEffect(() => {
        if (!selectedChat) return;
        const messagesRef = ref(db, `chats/${selectedChat.studentId}/messages`);
        const unsub = onValue(messagesRef, (snap) => {
            const data = snap.val();
            if (data) {
                const list = Object.entries(data)
                    .map(([id, val]: [string, any]) => ({ id, ...val } as Message))
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                setMessages(list);
                // Mark student messages as read
                const updates: Record<string, any> = {};
                list.forEach((m) => {
                    if (m.senderRole === "student" && !m.read) {
                        updates[`chats/${selectedChat.studentId}/messages/${m.id}/read`] = true;
                    }
                });
                if (Object.keys(updates).length > 0) {
                    updates[`chats/${selectedChat.studentId}/unreadByAdmin`] = 0;
                    update(ref(db), updates).catch(() => {});
                }
            } else {
                setMessages([]);
            }
        });
        return () => unsub();
    }, [selectedChat]);

    // Scroll to bottom on new messages
    useEffect(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }, [messages]);

    const handleSend = async () => {
        if (!reply.trim() || sending || !selectedChat || !user) return;
        setSending(true);
        const msgText = reply.trim();
        setReply("");

        try {
            const now = new Date().toISOString();
            const adminName = profile?.displayName || "Admin Support";

            // Ensure the chat thread exists in Firebase (for admin-initiated chats)
            const chatNodeRef = ref(db, `chats/${selectedChat.studentId}`);
            const chatSnap = await get(chatNodeRef);
            if (!chatSnap.exists()) {
                await set(chatNodeRef, {
                    studentId: selectedChat.studentId,
                    studentName: selectedChat.studentName,
                    studentEmail: selectedChat.studentEmail,
                    lastMessage: "",
                    lastMessageAt: "",
                    unreadByAdmin: 0,
                });
            }

            const msgRef = push(ref(db, `chats/${selectedChat.studentId}/messages`));
            await set(msgRef, {
                id: msgRef.key,
                text: msgText,
                senderId: user.uid,
                senderName: adminName,
                senderRole: "admin",
                timestamp: now,
                read: false,
            });

            await update(ref(db, `chats/${selectedChat.studentId}`), {
                lastMessage: msgText,
                lastMessageAt: now,
            });

            // Push notification to student
            if (!selectedChat.studentId.startsWith("custom_")) {
                const studentNotifRef = push(ref(db, `student_notifications/${selectedChat.studentId}`));
                await set(studentNotifRef, {
                    id: studentNotifRef.key,
                    studentId: selectedChat.studentId,
                    type: "chat_reply",
                    message: `Admin Support: ${msgText.slice(0, 60)}${msgText.length > 60 ? "..." : ""}`,
                    link: "/dashboard",
                    read: false,
                    createdAt: now,
                });
            }
        } catch (err) {
            console.error("Failed to send reply:", err);
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

    const getTimeAgo = (ts: string) => {
        if (!ts) return "";
        const diff = Date.now() - new Date(ts).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return new Date(ts).toLocaleDateString();
    };

    const getTime = (ts: string) =>
        new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const filteredChats = chats.filter(
        (c) =>
            c.studentName?.toLowerCase().includes(search.toLowerCase()) ||
            c.studentEmail?.toLowerCase().includes(search.toLowerCase())
    );

    const totalUnread = chats.reduce((sum, c) => sum + (c.unreadByAdmin || 0), 0);

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight flex items-center gap-3">
                        <MessageCircle className="h-7 w-7 text-aviation-600" />
                        Live Chat Support
                    </h1>
                    <p className="mt-1 text-ink/50 text-sm">
                        Respond to student queries or start new conversations. Use the <strong>Users</strong> page to chat any student.
                    </p>
                </div>
                {totalUnread > 0 && (
                    <span className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm px-4 py-2 rounded-xl">
                        <MessageCircle className="h-4 w-4" />
                        {totalUnread} unread {totalUnread === 1 ? "message" : "messages"}
                    </span>
                )}
            </div>

            {/* Chat Interface */}
            <div className="bg-white rounded-2xl border border-aviation-100 shadow-soft overflow-hidden flex"
                style={{ height: "calc(100vh - 240px)", minHeight: "500px" }}>

                {/* Sidebar: Chat List */}
                <div className={`${selectedChat ? "hidden md:flex" : "flex"} w-full md:w-72 lg:w-80 flex-col border-r border-aviation-100 bg-aviation-50/30 shrink-0`}>
                    {/* Search */}
                    <div className="p-3 border-b border-aviation-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-white border border-aviation-100 rounded-xl text-sm outline-none focus:border-aviation-300"
                            />
                        </div>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredChats.length === 0 ? (
                            <div className="p-8 text-center text-ink/40">
                                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                <p className="text-sm font-medium">No conversations yet</p>
                                <p className="text-xs mt-1 text-ink/30">Go to <strong>User Management</strong> to start a chat with any student.</p>
                            </div>
                        ) : (
                            filteredChats.map((chat) => (
                                <button
                                    key={chat.studentId}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-aviation-50 transition-colors ${
                                        selectedChat?.studentId === chat.studentId
                                            ? "bg-aviation-50"
                                            : "hover:bg-white"
                                    }`}
                                >
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-aviation-600 to-cyan-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                        {(chat.studentName || "S").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-ink text-sm truncate">{chat.studentName || "Student"}</p>
                                            <span className="text-[11px] text-ink/40 shrink-0 ml-2">
                                                {getTimeAgo(chat.lastMessageAt)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-ink/50 truncate mt-0.5">
                                            {chat.lastMessage || "No messages yet"}
                                        </p>
                                    </div>
                                    {chat.unreadByAdmin > 0 && (
                                        <span className="shrink-0 h-5 min-w-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                                            {chat.unreadByAdmin}
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                {selectedChat ? (
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Chat Header */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-aviation-100 bg-white shrink-0">
                            <button
                                onClick={() => setSelectedChat(null)}
                                className="md:hidden text-ink/60 hover:text-ink"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-aviation-600 to-cyan-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                {(selectedChat.studentName || "S").charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-ink text-sm truncate">{selectedChat.studentName}</p>
                                <p className="text-xs text-ink/50 truncate">{selectedChat.studentEmail || "No email"}</p>
                            </div>
                            {/* Show "New Conversation" badge if no messages yet */}
                            {messages.length === 0 && (
                                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-aviation-600 bg-aviation-50 border border-aviation-200 px-2.5 py-1 rounded-full">
                                    <UserPlus className="h-3.5 w-3.5" />
                                    New Conversation
                                </span>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/50">
                            {initializing ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-aviation-400" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-12 text-center">
                                    <div className="h-14 w-14 rounded-2xl bg-aviation-50 flex items-center justify-center">
                                        <MessageCircle className="h-7 w-7 text-aviation-300" />
                                    </div>
                                    <p className="text-sm text-ink/60 font-semibold mt-2">Start the conversation</p>
                                    <p className="text-xs text-ink/30 max-w-xs">
                                        Send a message to <strong>{selectedChat.studentName}</strong>. They'll receive a notification when you reply.
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isAdmin = msg.senderRole === "admin";
                                    return (
                                        <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[75%] flex flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}>
                                                {!isAdmin && (
                                                    <span className="text-[11px] text-ink/40 px-1">{msg.senderName}</span>
                                                )}
                                                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                                                    isAdmin
                                                        ? "bg-aviation-600 text-white rounded-br-sm"
                                                        : "bg-white border border-aviation-100 text-ink rounded-bl-sm shadow-sm"
                                                }`}>
                                                    {msg.text}
                                                </div>
                                                <div className={`flex items-center gap-1 px-1 ${isAdmin ? "flex-row-reverse" : ""}`}>
                                                    <span className="text-[11px] text-slate-400">{getTime(msg.timestamp)}</span>
                                                    {isAdmin && (
                                                        msg.read
                                                            ? <CheckCheck className="h-3 w-3 text-aviation-400" />
                                                            : <Clock className="h-3 w-3 text-slate-300" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Input */}
                        <div className="shrink-0 border-t border-aviation-100 bg-white p-3 flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={`Message ${selectedChat.studentName}...`}
                                rows={2}
                                className="flex-1 resize-none rounded-xl border border-aviation-100 px-3.5 py-2.5 text-sm outline-none focus:border-aviation-400 focus:ring-2 focus:ring-aviation-500/10 transition-all max-h-32 overflow-y-auto"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!reply.trim() || sending}
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
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-4 text-center p-8">
                        <div className="h-16 w-16 rounded-2xl bg-aviation-50 flex items-center justify-center">
                            <MessageCircle className="h-8 w-8 text-aviation-400" />
                        </div>
                        <div>
                            <p className="font-bold text-ink">Select a Conversation</p>
                            <p className="text-sm text-ink/40 mt-1">
                                Choose a student from the list, or go to <strong>User Management</strong> to start a new chat.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminChatPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-aviation-400" />
            </div>
        }>
            <AdminChatContent />
        </Suspense>
    );
}
