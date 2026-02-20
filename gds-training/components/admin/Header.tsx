"use client";

import { Bell, Search, User } from "lucide-react";

export default function Header() {
    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-aviation-100 bg-white/80 px-8 backdrop-blur">
            <div className="flex items-center gap-4">
                {/* Breadcrumbs or Search could go here */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
                    <input
                        type="text"
                        placeholder="Search CMS..."
                        className="h-10 w-64 rounded-xl border border-aviation-100 bg-aviation-50/50 pl-10 pr-4 text-sm focus:border-aviation-300 focus:outline-none focus:ring-4 focus:ring-aviation-500/10 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative rounded-xl p-2 text-ink/60 hover:bg-aviation-50 transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cta-500 border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-3 border-l border-aviation-100 pl-4 ml-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-ink leading-none">Admin User</p>
                        <p className="text-xs text-ink/50 mt-1">Super Admin</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aviation-100 text-aviation-700 font-bold border-2 border-white shadow-soft">
                        <User className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </header>
    );
}
