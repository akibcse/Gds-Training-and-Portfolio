"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, profile, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.replace("/login");
            } else if (profile && profile.role !== "admin") {
                router.replace("/dashboard");
            }
        }
    }, [user, profile, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-aviation-50/30">
                <Loader2 className="h-8 w-8 animate-spin text-aviation-600" />
            </div>
        );
    }

    if (!user || (profile && profile.role !== "admin")) {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}
