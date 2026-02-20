"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
    isLoading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger",
    isLoading = false
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const typeConfig = {
        danger: {
            icon: AlertTriangle,
            iconClass: "bg-red-50 text-red-600",
            buttonClass: "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20",
        },
        warning: {
            icon: AlertTriangle,
            iconClass: "bg-amber-50 text-amber-600",
            buttonClass: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20",
        },
        info: {
            icon: AlertTriangle,
            iconClass: "bg-aviation-50 text-aviation-600",
            buttonClass: "bg-aviation-600 hover:bg-aviation-700 text-white shadow-aviation-500/20",
        }
    };

    const { icon: Icon, iconClass, buttonClass } = typeConfig[type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-md scale-100 transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
                <div className="flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-ink/40 hover:bg-aviation-50 hover:text-ink/60 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-4">
                    <h3 className="text-xl font-bold text-ink tracking-tight">{title}</h3>
                    <p className="mt-2 text-sm text-ink/60 leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-aviation-100 py-3 text-sm font-semibold text-ink hover:bg-aviation-50 transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 rounded-xl py-3 text-sm font-semibold shadow-lg transition-all active:scale-95 disabled:opacity-50 ${buttonClass}`}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
