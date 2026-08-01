"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, LayoutDashboard, User, LogIn, UserPlus } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import StudentNotificationBell from "./StudentNotificationBell";

type AuthButtonsProps = {
  isMobile?: boolean;
  onItemClick?: () => void;
};

export default function AuthButtons({ isMobile = false, onItemClick }: AuthButtonsProps) {
  const { user, profile, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    if (onItemClick) onItemClick();
    await signOut(auth);
  };

  if (!mounted || isLoading) {
    return (
      <div 
        className={
          isMobile 
            ? "w-full h-10 bg-slate-100 animate-pulse rounded-xl" 
            : "h-9 w-20 bg-slate-100 animate-pulse rounded-full"
        } 
      />
    );
  }

  if (user && profile) {
    if (isMobile) {
      return (
        <div className="flex flex-col gap-2 w-full pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between px-1 py-1">
            <Link 
              href="/dashboard"
              onClick={onItemClick}
              className="flex items-center gap-2.5 text-[#0F172A]"
            >
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-sm" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-bold truncate max-w-[160px]">{(profile as any)?.fullName || profile.displayName || profile.email?.split("@")[0] || "User"}</span>
                <span className="text-xs text-slate-500 capitalize">{profile.role || "student"}</span>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <StudentNotificationBell />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            {profile.role === "admin" && (
              <Link 
                href="/admin/dashboard" 
                onClick={onItemClick}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-blue-600" /> Admin Dashboard
              </Link>
            )}
            <Link 
              href="/dashboard"
              onClick={onItemClick}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <User className="h-4 w-4 text-blue-600" /> Dashboard
            </Link>
            <button 
              onClick={handleLogout} 
              className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50/60 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              <LogOut className="h-4 w-4 text-red-500" /> Logout
            </button>
          </div>
        </div>
      );
    }

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
          <span className="text-xs font-bold truncate max-w-[80px]">{(profile as any)?.fullName || profile.displayName || profile.email?.split("@")[0] || "User"}</span>
        </Link>
        <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Logout">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex items-center gap-2.5 w-full pt-3 border-t border-slate-100">
        <Link 
          href="/login" 
          onClick={onItemClick}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm"
        >
          <LogIn className="h-4 w-4 text-slate-500" /> Log In
        </Link>
        <Link 
          href="/signup" 
          onClick={onItemClick}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition"
        >
          <UserPlus className="h-4 w-4 text-white" /> Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-[#1D4ED8] transition-colors">
        Log In
      </Link>
      <Link href="/signup" className="rounded-full bg-[#1D4ED8] hover:bg-blue-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors">
        Sign Up
      </Link>
    </div>
  );
}
