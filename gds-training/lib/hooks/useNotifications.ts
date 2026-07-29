"use client";

import { useEffect, useState, useRef } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { playNotificationChime } from "@/lib/utils/sound";

export interface Notification {
    id: string;
    type: "new_review" | "new_chat" | "new_enrollment" | "certificate_issued";
    message: string;
    link: string;
    read: boolean;
    createdAt: string;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const prevUnreadRef = useRef<number>(0);

    useEffect(() => {
        const notifRef = ref(db, "notifications");
        const unsub = onValue(notifRef, (snap) => {
            const data = snap.val();
            if (data) {
                const list = Object.entries(data)
                    .map(([id, val]: [string, any]) => ({ id, ...val } as Notification))
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 50); // keep last 50
                setNotifications(list);
                const count = list.filter((n) => !n.read).length;

                // Play chime if unread count increased
                if (count > prevUnreadRef.current && prevUnreadRef.current !== 0) {
                    playNotificationChime();
                }
                prevUnreadRef.current = count;
                setUnreadCount(count);
            } else {
                setNotifications([]);
                setUnreadCount(0);
            }
        });
        return () => unsub();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await update(ref(db, `notifications/${id}`), { read: true });
        } catch (e) {
            console.error("Failed to mark notification as read:", e);
        }
    };

    const markAllAsRead = async () => {
        const updates: Record<string, boolean> = {};
        notifications.forEach((n) => {
            if (!n.read) updates[`notifications/${n.id}/read`] = true;
        });
        if (Object.keys(updates).length > 0) {
            try {
                await update(ref(db), updates);
            } catch (e) {
                console.error("Failed to mark all as read:", e);
            }
        }
    };

    return { notifications, unreadCount, markAsRead, markAllAsRead };
}
