import ProfileSettings from "@/components/ProfileSettings";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function StudentSettingsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Dashboard Header */}
      <div className="bg-[#0F172A] pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            <div className="flex items-center gap-6">
              <div>
                <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors mb-2">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Profile Settings</h1>
                <p className="mt-2 text-[#94A3B8] font-medium max-w-xl">
                  Manage your account information, profile photo, and password.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-16 pb-12 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileSettings />
      </div>
    </div>
  );
}
