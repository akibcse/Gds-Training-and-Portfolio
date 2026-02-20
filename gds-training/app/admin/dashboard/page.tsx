"use client";

import { useEffect, useState } from "react";
import {
    BookOpen,
    FileText,
    Briefcase,
    Users,
    Menu,
    List,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import Link from "next/link";

interface Stats {
    courses: number;
    blogs: number;
    portfolio: number;
    leads: number;
    activeNavbar: number;
    activeFooter: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [
                    coursesRes,
                    blogsRes,
                    portfolioRes,
                    leadsRes,
                    navbarRes,
                    footerRes
                ] = await Promise.all([
                    fetch("/api/admin/courses"),
                    fetch("/api/admin/blogs"),
                    fetch("/api/admin/portfolio"),
                    fetch("/api/admin/leads"),
                    fetch("/api/admin/navbar"),
                    fetch("/api/admin/footer")
                ]);

                const [
                    courses,
                    blogs,
                    portfolio,
                    leads,
                    navbar,
                    footer
                ] = await Promise.all([
                    coursesRes.json(),
                    blogsRes.json(),
                    portfolioRes.json(),
                    leadsRes.json(),
                    navbarRes.json(),
                    footerRes.json()
                ]);

                setStats({
                    courses: Array.isArray(courses) ? courses.length : 0,
                    blogs: Array.isArray(blogs) ? blogs.length : 0,
                    portfolio: Array.isArray(portfolio) ? portfolio.length : 0,
                    leads: Array.isArray(leads) ? leads.length : 0,
                    activeNavbar: Array.isArray(navbar) ? navbar.filter((n: any) => n.isActive).length : 0,
                    activeFooter: Array.isArray(footer) ? footer.filter((f: any) => f.isActive).length : 0,
                });
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const statCards = [
        { label: "Total Courses", value: stats?.courses ?? 0, icon: BookOpen, color: "bg-blue-500", trend: "+2 this month", trendUp: true, href: "/admin/courses" },
        { label: "Total Blogs", value: stats?.blogs ?? 0, icon: FileText, color: "bg-purple-500", trend: "+5 this month", trendUp: true, href: "/admin/blogs" },
        { label: "Portfolio Projects", value: stats?.portfolio ?? 0, icon: Briefcase, color: "bg-amber-500", trend: "Maintained", trendUp: true, href: "/admin/portfolio" },
        { label: "Total Leads", value: stats?.leads ?? 0, icon: Users, color: "bg-emerald-500", trend: "+12% vs last week", trendUp: true, href: "/admin/leads" },
        { label: "Active Nav Items", value: stats?.activeNavbar ?? 0, icon: Menu, color: "bg-aviation-600", trend: "Balanced", trendUp: true, href: "/admin/navigation" },
        { label: "Footer Sections", value: stats?.activeFooter ?? 0, icon: List, color: "bg-indigo-500", trend: "Optimized", trendUp: true, href: "/admin/footer" },
    ];

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 w-48 bg-aviation-100 rounded-xl"></div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-32 bg-white rounded-2xl border border-aviation-50"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-ink tracking-tight">CMS Dashboard</h1>
                <p className="mt-2 text-ink/50">Welcome back! Here's what's happening with your CMS content.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {statCards.map((stat, i) => (
                    <Link
                        key={i}
                        href={stat.href}
                        className="group relative overflow-hidden rounded-2xl border border-aviation-100 bg-white p-6 shadow-soft transition-all hover:shadow-lg active:scale-95"
                    >
                        <div className="flex items-center justify-between">
                            <div className={`rounded-xl p-3 text-white ${stat.color} shadow-lg shadow-${stat.color.split('-')[1]}-200/50`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${stat.trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {stat.trend}
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-ink/50">{stat.label}</p>
                            <h3 className="mt-1 text-3xl font-bold text-ink">{stat.value}</h3>
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-16 w-16 opacity-5 transition-transform group-hover:scale-125">
                            <stat.icon className="h-full w-full" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions or Recent Leads could go here */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-aviation-100 bg-white p-6 shadow-soft">
                    <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-aviation-600" />
                        CMS Performance
                    </h2>
                    <div className="mt-8 flex h-48 items-center justify-center rounded-xl bg-aviation-50/50 border border-dashed border-aviation-100">
                        <p className="text-sm text-ink/40 font-medium">Chart visualization will be implemented here.</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-aviation-100 bg-white p-6 shadow-soft">
                    <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                        <Users className="h-5 w-5 text-aviation-600" />
                        Recent Activity
                    </h2>
                    <div className="mt-6 space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-aviation-50 pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-aviation-50 flex items-center justify-center text-aviation-600 font-bold">
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-ink">Action Item {i + 1}</p>
                                        <p className="text-xs text-ink/40">Updated CMS content • 2 hours ago</p>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-aviation-600 hover:underline">View</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
