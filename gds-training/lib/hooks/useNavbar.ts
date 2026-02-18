"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { get, onValue, push, ref, remove, set, update } from "firebase/database";
import { getFirebaseDatabase } from "@/lib/firebase";

export type NavbarItem = {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
};

const DEFAULT_NAVBAR: NavbarItem[] = [
  { id: "default-home", label: "Home", url: "/", order: 1, isActive: true },
  { id: "default-courses", label: "Courses", url: "/courses", order: 2, isActive: true },
  { id: "default-blog", label: "Blog", url: "/blog", order: 3, isActive: true },
  { id: "default-portfolio", label: "Portfolio", url: "/portfolio", order: 4, isActive: true },
  { id: "default-about", label: "About", url: "/about", order: 5, isActive: true },
  { id: "default-contact", label: "Contact", url: "/contact", order: 6, isActive: true }
];

const mapObjectToArray = (input: unknown): NavbarItem[] => {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input as NavbarItem[];
  }

  return Object.entries(input as Record<string, Omit<NavbarItem, "id">>).map(([id, value]) => ({
    id,
    label: value?.label || "",
    url: value?.url || "/",
    order: Number(value?.order) || 0,
    isActive: Boolean(value?.isActive)
  }));
};

export const useNavbar = () => {
  const [items, setItems] = useState<NavbarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const db = getFirebaseDatabase();
    if (!db) {
      setItems(DEFAULT_NAVBAR);
      setLoading(false);
      setError("Firebase database unavailable");
      return;
    }

    const navbarRef = ref(db, "navbar");
    const unsubscribe = onValue(
      navbarRef,
      (snapshot) => {
        const parsed = mapObjectToArray(snapshot.val());
        setItems(parsed.length ? parsed.sort((a, b) => a.order - b.order) : DEFAULT_NAVBAR);
        setLoading(false);
      },
      () => {
        setError("Failed to sync navigation data");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addItem = useCallback(async (input: Omit<NavbarItem, "id">) => {
    const db = getFirebaseDatabase();
    if (!db) {
      throw new Error("Database unavailable");
    }

    const navbarRef = ref(db, "navbar");
    const snapshot = await get(navbarRef);
    const items = mapObjectToArray(snapshot.val());
    const nextOrder = input.order || items.length + 1;

    const newRef = push(navbarRef);
    await set(newRef, {
      label: input.label,
      url: input.url,
      order: nextOrder,
      isActive: input.isActive
    });
  }, []);

  const updateItem = useCallback(async (id: string, patch: Partial<Omit<NavbarItem, "id">>) => {
    const db = getFirebaseDatabase();
    if (!db) {
      throw new Error("Database unavailable");
    }

    await update(ref(db, `navbar/${id}`), patch);
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    const db = getFirebaseDatabase();
    if (!db) {
      throw new Error("Database unavailable");
    }

    await remove(ref(db, `navbar/${id}`));
  }, []);

  return useMemo(
    () => ({
      items,
      loading,
      error,
      addItem,
      updateItem,
      deleteItem
    }),
    [items, loading, error, addItem, updateItem, deleteItem]
  );
};
