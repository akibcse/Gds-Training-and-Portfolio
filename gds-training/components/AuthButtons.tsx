"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, LayoutDashboard, User } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import StudentNotificationBell from "./StudentNotificationBell";

export default function AuthButtons() {
  const { user, profile, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!mounted || isLoading) {
    return <div className="h-9 w-20 bg-slate-100 animate-pulse rounded-full"></div>;
  }

  if (user && profile) {
    return (
      <div className="flex items-center gap-2">
        <StudentNotificationBell />
        {profile.role === "admin" && (
          <Link href="/admin/dashboard" className="hidden md:flex text-xs font-bold text-slate-500 hover:text-[#1D4ED8] transition-colors items-center gap-1">
            <LayoutDashboard className="h-4 w-4" /> Admin
          </Link>
        )}
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-[#0F172A] rounded-full px-3 py-1.5 transition-colors border border-slate-200"
        >
          {profile.photoURL ? (
            <img src={profile.photoURL} alt="Profile" className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-3 w-3 text-blue-600" />
            </div>
          )}
          <span className="text-xs font-bold truncate max-w-[80px]">{profile.displayName || "Student"}</span>
        </Link>
        <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Logout">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-[#1D4ED8] transition-colors">
        Log In
      </Link>
      <Link href="/signup" className="hidden md:inline-flex rounded-full bg-[#1D4ED8] hover:bg-blue-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors">
        Sign Up
      </Link>
    </div>
  );
}
