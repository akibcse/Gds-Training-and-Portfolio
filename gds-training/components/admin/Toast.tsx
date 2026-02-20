"use client";

import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
    message: string;
    type: ToastType;
    duration?: number;
    onClose: () => void;
}

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const config = {
        success: {
            icon: CheckCircle2,
            bg: "bg-green-50",
            text: "text-green-800",
            border: "border-green-100",
            iconColor: "text-green-500"
        },
        error: {
            icon: AlertCircle,
            bg: "bg-red-50",
            text: "text-red-800",
            border: "border-red-100",
            iconColor: "text-red-500"
        },
        info: {
            icon: Info,
            bg: "bg-aviation-50",
            text: "text-aviation-800",
            border: "border-aviation-100",
            iconColor: "text-aviation-500"
        }
    };

    const { icon: Icon, bg, text, border, iconColor } = config[type];

    return (
        <div
            className={`fixed bottom-8 right-8 z-[200] flex items-center gap-3 rounded-2xl border ${border} ${bg} ${text} p-4 shadow-xl transition-all duration-300 transform ${isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
                }`}
        >
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-white/50 ${iconColor}`}>
                <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold pr-4">{message}</p>
            <button
                onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
                className="ml-auto rounded-lg p-1 hover:bg-black/5 transition-colors"
            >
                <X className="h-4 w-4 opacity-40" />
            </button>
        </div>
    );
}

export function useToast() {
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const showToast = (message: string, type: ToastType = "success") => {
        setToast({ message, type });
    };

    const hideToast = () => setToast(null);

    return { toast, showToast, hideToast };
}
