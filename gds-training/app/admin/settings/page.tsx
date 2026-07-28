"use client";

import ProfileSettings from "@/components/ProfileSettings";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink tracking-tight flex items-center gap-3">
            <Settings className="h-8 w-8 text-aviation-600" /> Account Settings
          </h1>
          <p className="mt-1 text-ink/50">Manage your admin profile, update your email, and change your password.</p>
        </div>
      </div>

      <div className="-mx-6 sm:mx-0">
        <ProfileSettings />
      </div>
    </div>
  );
}
