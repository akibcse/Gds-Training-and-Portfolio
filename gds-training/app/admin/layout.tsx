"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <AdminGuard>
            <div className="min-h-screen bg-aviation-50/30">
                <Sidebar
                    mobileOpen={mobileSidebarOpen}
                    onMobileClose={() => setMobileSidebarOpen(false)}
                />
                {/* Main content — on desktop offset by sidebar width */}
                <div className="md:pl-64 transition-all duration-300 ease-in-out">
                    <Header onMenuToggle={() => setMobileSidebarOpen(true)} />
                    <main className="p-4 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AdminGuard>
    );
}
