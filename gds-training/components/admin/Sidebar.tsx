"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Menu,
    Settings,
    BookOpen,
    FileText,
    Briefcase,
    Users,
    Globe,
    User,
    ChevronRight,
    LogOut,
    Image,
    Sliders,
    Shield,
    GraduationCap,
    Star,
    MessageCircle,
    Award,
    X
} from "lucide-react";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";

const SIDEBAR_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: "Enrolled Students", icon: GraduationCap, href: "/admin/payments" },
    { label: "E-Certificates", icon: Award, href: "/admin/certificates" },
    { label: "User Management", icon: Shield, href: "/admin/users" },
    { label: "Hero Slider", icon: Sliders, href: "/admin/slider" },
    { label: "Image Gallery", icon: Image, href: "/admin/gallery" },
    { label: "Courses", icon: BookOpen, href: "/admin/courses" },
    { label: "Blogs", icon: FileText, href: "/admin/blogs" },
    { label: "Portfolio", icon: Briefcase, href: "/admin/portfolio" },
    { label: "Navigation", icon: Menu, href: "/admin/navigation" },
    { label: "Footer", icon: FileText, href: "/admin/footer" },
    { label: "Public Profile", icon: Globe, href: "/admin/profile" },
    { label: "About", icon: User, href: "/admin/about" },
    { label: "Leads CRM", icon: Users, href: "/admin/leads" },
    { label: "SEO Manager", icon: Globe, href: "/admin/seo" },
    { label: "Settings", icon: Settings, href: "/admin/settings" },
];

interface SidebarProps {
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [pendingReviews, setPendingReviews] = useState(0);
    const [unreadChats, setUnreadChats] = useState(0);

    // Listen for pending reviews count
    useEffect(() => {
        const reviewsRef = ref(db, "reviews");
        const unsub = onValue(reviewsRef, (snap) => {
            const data = snap.val();
            if (data) {
                const pending = Object.values(data).filter((r: any) => r.status === "pending").length;
                setPendingReviews(pending);
            } else {
                setPendingReviews(0);
            }
        });
        return () => unsub();
    }, []);

    // Listen for unread chat messages
    useEffect(() => {
        const chatsRef = ref(db, "chats");
        const unsub = onValue(chatsRef, (snap) => {
            const data = snap.val();
            if (data) {
                const total = Object.values(data).reduce(
                    (sum: number, chat: any) => sum + (chat.unreadByAdmin || 0),
                    0
                );
                setUnreadChats(total as number);
            } else {
                setUnreadChats(0);
            }
        });
        return () => unsub();
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        if (mobileOpen && onMobileClose) {
            onMobileClose();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const EXTRA_ITEMS = [
        {
            label: "Reviews",
            icon: Star,
            href: "/admin/reviews",
            badge: pendingReviews > 0 ? pendingReviews : undefined,
            badgeColor: "bg-amber-500"
        },
        {
            label: "Live Chat",
            icon: MessageCircle,
            href: "/admin/chat",
            badge: unreadChats > 0 ? unreadChats : undefined,
            badgeColor: "bg-emerald-500"
        },
    ];

    const allItems = [
        ...SIDEBAR_ITEMS.slice(0, 2),
        { label: "Reviews", icon: Star, href: "/admin/reviews", badge: pendingReviews || undefined, badgeColor: "bg-amber-500" },
        { label: "Live Chat", icon: MessageCircle, href: "/admin/chat", badge: unreadChats || undefined, badgeColor: "bg-emerald-500" },
        ...SIDEBAR_ITEMS.slice(2),
    ];

    const sidebarContent = (
        <div className="flex h-full flex-col overflow-y-auto">
            {/* Brand */}
            <div className="flex h-16 items-center justify-between px-4 md:px-6 border-b border-aviation-50">
                <Link href="/admin/dashboard" className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aviation-600 text-white font-bold shrink-0">
                        G
                    </div>
                    {!isCollapsed && (
                        <span className="text-lg font-bold text-ink tracking-tight">
                            GDS CMS
                        </span>
                    )}
                </Link>
                {/* Mobile close button */}
                <button
                    onClick={onMobileClose}
                    className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg text-ink/60 hover:bg-aviation-50"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-0.5 px-3 py-4">
                {allItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all group relative ${
                                isActive
                                    ? "bg-aviation-50 text-aviation-700"
                                    : "text-ink/60 hover:bg-aviation-50 hover:text-aviation-600"
                            }`}
                        >
                            <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-aviation-600" : "text-ink/40 group-hover:text-aviation-600"}`} />
                            {!isCollapsed && (
                                <span className="text-sm font-medium tracking-wide flex-1">{item.label}</span>
                            )}
                            {/* Badge */}
                            {!isCollapsed && (item as any).badge && (
                                <span className={`ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full ${(item as any).badgeColor || "bg-aviation-500"} text-white text-xs font-bold px-1`}>
                                    {(item as any).badge}
                                </span>
                            )}
                            {isCollapsed && (item as any).badge && (
                                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {(item as any).badge}
                                </span>
                            )}
                            {!isCollapsed && isActive && !(item as any).badge && (
                                <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-aviation-50 p-4 space-y-1">
                {/* Collapse toggle — desktop only */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex w-full items-center gap-3 rounded-lg px-3 py-2 text-ink/60 hover:bg-aviation-50 hover:text-aviation-600 transition-all"
                >
                    <Menu className="h-5 w-5" />
                    {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
                </button>

                <Link
                    href="/"
                    target="_blank"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-ink/60 hover:bg-aviation-50 hover:text-aviation-600 transition-all text-sm font-medium"
                >
                    <Globe className="h-5 w-5" />
                    {!isCollapsed && <span>View Site</span>}
                </Link>

                <Link
                    href="/admin/login"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-500 hover:bg-red-50 transition-all"
                >
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                </Link>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex fixed left-0 top-0 z-[60] h-screen flex-col transition-all duration-300 ease-in-out border-r border-aviation-100 bg-white ${
                    isCollapsed ? "w-20" : "w-64"
                }`}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Drawer Overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                    onClick={onMobileClose}
                />
            )}

            {/* Mobile Drawer */}
            <aside
                className={`md:hidden fixed left-0 top-0 z-[70] h-screen w-72 bg-white border-r border-aviation-100 shadow-2xl transition-transform duration-300 ease-in-out ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
