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
    LogOut
} from "lucide-react";
import { useState } from "react";

const SIDEBAR_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: "Navigation", icon: Menu, href: "/admin/navigation" },
    { label: "Footer", icon: FileText, href: "/admin/footer" },
    { label: "Courses", icon: BookOpen, href: "/admin/courses" },
    { label: "Blogs", icon: FileText, href: "/admin/blogs" },
    { label: "Portfolio", icon: Briefcase, href: "/admin/portfolio" },
    { label: "About", icon: User, href: "/admin/about" },
    { label: "Leads CRM", icon: Users, href: "/admin/leads" },
    { label: "SEO Manager", icon: Globe, href: "/admin/seo" },
    { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-aviation-100 bg-white ${isCollapsed ? "w-20" : "w-64"}`}>
            <div className="flex h-full flex-col overflow-y-auto">
                {/* Brand */}
                <div className="flex h-16 items-center px-6">
                    <Link href="/admin/dashboard" className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aviation-600 text-white font-bold">
                            G
                        </div>
                        {!isCollapsed && (
                            <span className="text-lg font-bold text-ink tracking-tight">
                                GDS CMS
                            </span>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-4 py-4">
                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all group ${isActive
                                        ? "bg-aviation-50 text-aviation-700"
                                        : "text-ink/60 hover:bg-aviation-50 hover:text-aviation-600"
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 ${isActive ? "text-aviation-600" : "text-ink/40 group-hover:text-aviation-600"}`} />
                                {!isCollapsed && (
                                    <span className="text-sm font-medium tracking-wide">{item.label}</span>
                                )}
                                {!isCollapsed && isActive && (
                                    <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-aviation-50 p-4">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-ink/60 hover:bg-aviation-50 hover:text-aviation-600 transition-all"
                    >
                        <Menu className="h-5 w-5" />
                        {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
                    </button>

                    <Link
                        href="/admin/login"
                        className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                        {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                    </Link>
                </div>
            </div>
        </aside>
    );
}
