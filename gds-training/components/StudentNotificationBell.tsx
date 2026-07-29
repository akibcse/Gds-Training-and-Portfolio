"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Award, MessageCircle, CheckCircle, XCircle, CheckCheck } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudentNotifications } from "@/lib/hooks/useStudentNotifications";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NOTIF_ICONS: Record<string, any> = {
    certificate_issued: Award,
    chat_reply: MessageCircle,
    payment_approved: CheckCircle,
    payment_rejected: XCircle,
};

const NOTIF_COLORS: Record<string, string> = {
    certificate_issued: "bg-amber-100 text-amber-600",
    chat_reply: "bg-emerald-100 text-emerald-600",
    payment_approved: "bg-blue-100 text-blue-600",
    payment_rejected: "bg-rose-100 text-rose-600",
};

export default function StudentNotificationBell() {
    const { user } = useAuthStore();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useStudentNotifications(user?.uid);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    const handleNotifClick = async (notif: any) => {
        if (!notif.read) {
            await markAsRead(notif.id);
        }
        setOpen(false);
        if (notif.link) {
            router.push(notif.link);
        }
    };

    const getTimeAgo = (dateStr: string) => {
        if (!dateStr) return "";
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="relative rounded-full p-2 text-ink/70 hover:bg-aviation-50 hover:text-ink transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 min-w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 border border-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-white rounded-2xl border border-aviation-100 shadow-2xl overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-aviation-50 bg-slate-50/50">
                        <h3 className="font-bold text-ink text-sm flex items-center gap-2">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="h-5 min-w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                                    {unreadCount}
                                </span>
                            )}
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1 text-xs font-semibold text-aviation-600 hover:text-aviation-700 transition-colors"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-aviation-50">
                        {notifications.length === 0 ? (
                            <div className="py-10 text-center text-ink/40">
                                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm font-medium">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const Icon = NOTIF_ICONS[notif.type] || Bell;
                                const colorClass = NOTIF_COLORS[notif.type] || "bg-aviation-100 text-aviation-600";
                                return (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleNotifClick(notif)}
                                        className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-aviation-50/50 transition-colors ${
                                            !notif.read ? "bg-aviation-50/40" : ""
                                        }`}
                                    >
                                        <div className={`rounded-xl p-2 shrink-0 ${colorClass}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs sm:text-sm leading-snug ${!notif.read ? "font-semibold text-ink" : "text-ink/70"}`}>
                                                {notif.message}
                                            </p>
                                            <p className="text-[11px] text-ink/40 mt-1">
                                                {getTimeAgo(notif.createdAt)}
                                            </p>
                                        </div>
                                        {!notif.read && (
                                            <span className="mt-1 h-2 w-2 rounded-full bg-aviation-600 shrink-0" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
