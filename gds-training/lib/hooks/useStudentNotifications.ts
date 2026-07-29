"use client";

import { useEffect, useState, useRef } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { playNotificationChime } from "@/lib/utils/sound";

export interface StudentNotification {
    id: string;
    studentId: string;
    type: "certificate_issued" | "chat_reply" | "payment_approved" | "payment_rejected" | "general";
    message: string;
    link: string;
    read: boolean;
    createdAt: string;
}

export function useStudentNotifications(studentId: string | undefined) {
    const [notifications, setNotifications] = useState<StudentNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const prevUnreadRef = useRef<number>(0);

    useEffect(() => {
        if (!studentId) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const notifRef = ref(db, `student_notifications/${studentId}`);
        const unsub = onValue(notifRef, (snap) => {
            const data = snap.val();
            if (data) {
                const list = Object.entries(data)
                    .map(([id, val]: [string, any]) => ({ id, ...val } as StudentNotification))
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 30);
                setNotifications(list);
                const count = list.filter((n) => !n.read).length;

                // Play audio chime if count increased
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
    }, [studentId]);

    const markAsRead = async (id: string) => {
        if (!studentId) return;
        try {
            await update(ref(db, `student_notifications/${studentId}/${id}`), { read: true });
        } catch (e) {
            console.error("Failed to mark student notification as read:", e);
        }
    };

    const markAllAsRead = async () => {
        if (!studentId) return;
        const updates: Record<string, boolean> = {};
        notifications.forEach((n) => {
            if (!n.read) updates[`student_notifications/${studentId}/${n.id}/read`] = true;
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
