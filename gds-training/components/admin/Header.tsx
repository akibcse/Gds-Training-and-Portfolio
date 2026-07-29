"use client";

import { Bell, Search, User, Menu, X, Star, MessageCircle, GraduationCap, Check, CheckCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderProps {
    onMenuToggle?: () => void;
}

const NOTIF_ICONS: Record<string, any> = {
    new_review: Star,
    new_chat: MessageCircle,
    new_enrollment: GraduationCap,
};

const NOTIF_COLORS: Record<string, string> = {
    new_review: "bg-amber-100 text-amber-600",
    new_chat: "bg-emerald-100 text-emerald-600",
    new_enrollment: "bg-aviation-100 text-aviation-600",
};

export default function Header({ onMenuToggle }: HeaderProps) {
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const router = useRouter();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotifClick = async (notif: any) => {
        if (!notif.read) {
            await markAsRead(notif.id);
        }
        setNotifOpen(false);
        router.push(notif.link);
    };

    const getTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-aviation-100 bg-white/90 px-4 md:px-8 backdrop-blur gap-4">
            {/* Left side: Hamburger (mobile) + Search */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Hamburger - mobile only */}
                <button
                    onClick={onMenuToggle}
                    className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-aviation-100 text-ink/60 hover:bg-aviation-50 hover:text-aviation-600 transition-colors shrink-0"
                    aria-label="Open navigation menu"
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Search */}
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
                    <input
                        type="text"
                        placeholder="Search CMS..."
                        className="h-10 w-48 md:w-64 rounded-xl border border-aviation-100 bg-aviation-50/50 pl-10 pr-4 text-sm focus:border-aviation-300 focus:outline-none focus:ring-4 focus:ring-aviation-500/10 transition-all"
                    />
                </div>
            </div>

            {/* Right side: Notifications + User */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="relative rounded-xl p-2 text-ink/60 hover:bg-aviation-50 transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 rounded-full bg-red-500 border-2 border-white text-white text-[10px] font-bold flex items-center justify-center px-1">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {notifOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-aviation-100 shadow-2xl overflow-hidden z-50">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-aviation-50 bg-aviation-50/50">
                                <h3 className="font-bold text-ink text-sm">
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
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

                            {/* Notification List */}
                            <div className="max-h-80 overflow-y-auto divide-y divide-aviation-50">
                                {notifications.length === 0 ? (
                                    <div className="py-12 text-center text-ink/40">
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
                                                className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-aviation-50/50 transition-colors ${!notif.read ? "bg-aviation-50/30" : ""}`}
                                            >
                                                <div className={`rounded-xl p-2 shrink-0 ${colorClass}`}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm leading-snug ${!notif.read ? "font-semibold text-ink" : "text-ink/70"}`}>
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-ink/40 mt-0.5">
                                                        {getTimeAgo(notif.createdAt)}
                                                    </p>
                                                </div>
                                                {!notif.read && (
                                                    <span className="mt-1 h-2 w-2 rounded-full bg-aviation-500 shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-aviation-50 p-2">
                                <Link
                                    href="/admin/dashboard"
                                    onClick={() => setNotifOpen(false)}
                                    className="block w-full text-center py-2 text-xs font-semibold text-aviation-600 hover:text-aviation-700 hover:bg-aviation-50 rounded-xl transition-colors"
                                >
                                    View Dashboard
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Avatar */}
                <div className="flex items-center gap-2 md:gap-3 border-l border-aviation-100 pl-3 md:pl-4">
                    <div className="text-right hidden lg:block">
                        <p className="text-sm font-semibold text-ink leading-none">Admin User</p>
                        <p className="text-xs text-ink/50 mt-1">Super Admin</p>
                    </div>
                    <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-aviation-100 text-aviation-700 font-bold border-2 border-white shadow-soft">
                        <User className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                </div>
            </div>
        </header>
    );
}
