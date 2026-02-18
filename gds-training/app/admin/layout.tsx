"use client";

import { signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import AuthGuard from "@/components/admin/AuthGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getFirebaseAuth } from "@/lib/firebase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  const handleLogout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }

    await signOut(auth);
    router.replace("/admin/login");
  };

  return (
    <AuthGuard>
      {isLoginPage ? (
        children
      ) : (
        <div className="min-h-screen bg-slate-50 md:flex">
          <AdminSidebar />
          <div className="flex-1">
            <header className="flex items-center justify-between border-b border-aviation-100 bg-white px-4 py-3 md:px-6">
              <h1 className="text-base font-semibold text-ink md:text-lg">GDS Training Admin</h1>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-aviation-200 px-3 py-1.5 text-sm text-ink transition hover:bg-aviation-50"
              >
                Logout
              </button>
            </header>
            <main>{children}</main>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
