"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function ClientInit() {
  const init = useAuthStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return null;
}
