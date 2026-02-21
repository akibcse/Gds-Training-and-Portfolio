"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { get, onValue, push, ref, remove, set, update } from "firebase/database";
import { getFirebaseDatabase } from "@/lib/firebase";

export type FooterSection = {
  id: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
};

const DEFAULT_FOOTER: FooterSection[] = [
  {
    id: "default-about",
    title: "About",
    content:
      "Certified GDS Instructor portfolio for Air Ticketing Course in Bangladesh, practical GDS Training in Dhaka, Sabre, Galileo, and airline reservation mentoring.",
    order: 1,
    isActive: true
  },
  {
    id: "default-links",
    title: "Quick Links",
    content:
      "<ul class=\"mt-2 space-y-2 text-sm text-ink/80\"><li><a href=\"/\">Home</a></li><li><a href=\"/courses\">All Courses</a></li><li><a href=\"/about\">About</a></li><li><a href=\"/contact\">Contact</a></li></ul>",
    order: 2,
    isActive: true
  },
  {
    id: "default-lead",
    title: "Lead Desk",
    content:
      "<p class=\"mt-2 text-sm text-ink/80\">Email: <a class=\"underline\" href=\"mailto:roadyakib@gmail.com\">roadyakib@gmail.com</a></p><p class=\"text-sm text-ink/80\">Phone: 01521438546</p>",
    order: 3,
    isActive: true
  }
];

const mapObjectToArray = (input: unknown): FooterSection[] => {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input as FooterSection[];
  }

  return Object.entries(input as Record<string, Omit<FooterSection, "id">>).map(([id, value]) => ({
    id,
    title: value?.title || "",
    content: value?.content || "",
    order: Number(value?.order) || 0,
    isActive: Boolean(value?.isActive)
  }));
};

export const useFooter = () => {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const db = getFirebaseDatabase();
    if (!db) {
      setSections(DEFAULT_FOOTER);
      setLoading(false);
      setError("Firebase database unavailable");
      return;
    }

    const footerRef = ref(db, "footer");
    const unsubscribe = onValue(
      footerRef,
      (snapshot) => {
        const parsed = mapObjectToArray(snapshot.val());
        setSections(parsed.length ? parsed.sort((a, b) => a.order - b.order) : DEFAULT_FOOTER);
        setLoading(false);
      },
      () => {
        setError("Failed to sync footer data");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addSection = useCallback(async (input: Omit<FooterSection, "id">) => {
    const db = getFirebaseDatabase();
    if (!db) {
      throw new Error("Database unavailable");
    }

    const footerRef = ref(db, "footer");
    const snapshot = await get(footerRef);
    const sections = mapObjectToArray(snapshot.val());
    const nextOrder = input.order || sections.length + 1;

    const newRef = push(footerRef);
    await set(newRef, {
      title: input.title,
      content: input.content,
      order: nextOrder,
      isActive: input.isActive
    });
  }, []);

  const updateSection = useCallback(async (id: string, patch: Partial<Omit<FooterSection, "id">>) => {
    const db = getFirebaseDatabase();
    if (!db) {
      throw new Error("Database unavailable");
    }

    await update(ref(db, `footer/${id}`), patch);
  }, []);

  const deleteSection = useCallback(async (id: string) => {
    const db = getFirebaseDatabase();
    if (!db) {
      throw new Error("Database unavailable");
    }

    await remove(ref(db, `footer/${id}`));
  }, []);

  return useMemo(
    () => ({
      sections,
      loading,
      error,
      addSection,
      updateSection,
      deleteSection
    }),
    [sections, loading, error, addSection, updateSection, deleteSection]
  );
};
