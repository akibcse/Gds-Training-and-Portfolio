"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <h2 className="mb-4 text-2xl font-bold text-red-600">Something went wrong in the Admin Dashboard!</h2>
            <p className="mb-6 text-gray-600">
                {error.message || "An unexpected error occurred."}
            </p>
            <button
                onClick={() => reset()}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Try again
            </button>
        </div>
    );
}
