"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase";

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setReady(true);
      setUser(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!user && pathname !== "/admin/login") {
      router.replace("/admin/login");
      return;
    }

    if (user && pathname === "/admin/login") {
      router.replace("/admin/dashboard");
    }
  }, [pathname, ready, router, user]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!ready || !user) {
    return <div className="p-8 text-center text-sm text-ink/70">Checking admin session...</div>;
  }

  return <>{children}</>;
}
