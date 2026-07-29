"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { Award, Printer, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Certificate {
    id: string;
    certificateNumber: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    courseId: string;
    courseName: string;
    issueDate: string;
    completionDate: string;
    grade: string;
    instructorName: string;
    issuedBy: string;
    issuedAt: string;
}

export default function CertificatePage() {
    const params = useParams();
    const certId = params?.id as string;
    const [cert, setCert] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [instituteName, setInstituteName] = useState("GDS Training & Aviation Academy");

    useEffect(() => {
        if (!certId) return;
        setLoading(true);
        setNotFound(false);

        const decodedSearch = decodeURIComponent(certId).trim();
        const searchLower = decodedSearch.toLowerCase();
        const searchClean = searchLower.replace(/[^a-z0-9]/g, "");

        // 1. Try direct fetch first by node key
        const singleCertRef = ref(db, `certificates/${decodedSearch}`);
        get(singleCertRef)
            .then((snap) => {
                if (snap.exists()) {
                    setCert(snap.val());
                    setLoading(false);
                    return;
                }

                // 2. If not found by node key, search across all certificates using STRICT matching
                const allCertsRef = ref(db, "certificates");
                return get(allCertsRef).then((allSnap) => {
                    if (allSnap.exists()) {
                        const data = allSnap.val();
                        const list = Object.values(data) as Certificate[];
                        const matched = list.find((c) => {
                            if (!c) return false;
                            const certNumLower = (c.certificateNumber || "").trim().toLowerCase();
                            const certNumClean = certNumLower.replace(/[^a-z0-9]/g, "");
                            const certIdLower = (c.id || "").trim().toLowerCase();

                            // Exact ID match
                            if (certIdLower === searchLower) return true;

                            // Exact Certificate Number match
                            if (certNumLower === searchLower) return true;

                            // Exact clean alphanumeric match (without hyphens/spaces)
                            if (certNumClean === searchClean) return true;

                            // Exact numeric digits match (e.g. user entered "814920")
                            const certDigits = certNumLower.replace(/\D/g, "");
                            const searchDigits = searchLower.replace(/\D/g, "");
                            if (searchDigits.length >= 4 && certDigits === searchDigits) return true;

                            return false;
                        });

                        if (matched) {
                            setCert(matched);
                        } else {
                            setNotFound(true);
                        }
                    } else {
                        setNotFound(true);
                    }
                    setLoading(false);
                });
            })
            .catch(() => {
                setNotFound(true);
                setLoading(false);
            });

        // Fetch dynamic institute name from Firebase profile node
        const profileRef = ref(db, "profile");
        get(profileRef)
            .then((snap) => {
                if (snap.exists() && snap.val()?.instituteName) {
                    setInstituteName(snap.val().instituteName);
                }
            })
            .catch(() => {});

        // Fallback fetch via public API
        fetch("/api/public/profile")
            .then((res) => res.json())
            .then((data) => {
                if (data?.instituteName) {
                    setInstituteName(data.instituteName);
                }
            })
            .catch(() => {});
    }, [certId]);

    const handlePrint = () => {
        if (typeof window !== "undefined") {
            window.print();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
            </div>
        );
    }

    if (notFound || !cert) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
                <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-rose-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Certificate Not Found</h1>
                <p className="text-slate-500 text-sm mt-1 max-w-sm">
                    No certificate matched "{certId}". Please check the certificate number and try again.
                </p>
                <Link
                    href="/"
                    className="mt-6 inline-flex items-center gap-2 bg-[#1D4ED8] text-white font-bold px-5 py-2.5 rounded-xl text-sm"
                >
                    <ArrowLeft className="h-4 w-4" /> Go to Homepage
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 flex flex-col items-center justify-center print:p-0 print:bg-white">
            {/* Congratulations & Verified Banner (Hidden on Print) */}
            <div className="w-full max-w-4xl mb-4 bg-emerald-950/90 border border-emerald-600/60 rounded-2xl p-4 text-emerald-100 flex items-center justify-between shadow-xl print:hidden">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base">🎉 Congratulations! Certificate Verified</h3>
                        <p className="text-xs text-emerald-300">
                            Official E-Certificate <strong className="text-white font-mono">{cert.certificateNumber}</strong> issued to <strong>{cert.studentName}</strong> is authentic and valid.
                        </p>
                    </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900 text-emerald-300 border border-emerald-700 text-xs font-bold shrink-0">
                    <ShieldCheck className="h-4 w-4" /> Verified Authentic
                </span>
            </div>

            {/* Top Toolbar (Hidden on Print) */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-6 print:hidden">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Home
                </Link>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg transition-all active:scale-95"
                    >
                        <Printer className="h-4 w-4" /> Save as PDF / Print
                    </button>
                </div>
            </div>

            {/* Certificate Box */}
            <div
                className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-14 relative overflow-hidden border-8 border-amber-400 print:shadow-none print:border-8 print:p-10 print:max-w-none print:w-full print:h-full"
                style={{
                    backgroundImage: "radial-gradient(circle at center, rgba(251, 191, 36, 0.03) 0%, transparent 70%)"
                }}
            >
                {/* Outer Decorative Frame */}
                <div className="absolute inset-3 border-2 border-amber-300 border-dashed pointer-events-none rounded-xl" />

                {/* Corner Accents */}
                <div className="absolute top-6 left-6 text-amber-500 text-2xl font-serif">❖</div>
                <div className="absolute top-6 right-6 text-amber-500 text-2xl font-serif">❖</div>
                <div className="absolute bottom-6 left-6 text-amber-500 text-2xl font-serif">❖</div>
                <div className="absolute bottom-6 right-6 text-amber-500 text-2xl font-serif">❖</div>

                {/* Header */}
                <div className="text-center space-y-2 relative z-10 pt-4">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 border-2 border-amber-400 mb-2">
                        <Award className="h-9 w-9" />
                    </div>
                    <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber-700">
                        {instituteName}
                    </p>
                    <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight uppercase">
                        Certificate of Completion
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full mt-3" />
                </div>

                {/* Subtitle */}
                <div className="text-center mt-8 text-slate-600 text-sm font-medium">
                    This is to proudly certify that
                </div>

                {/* Student Name */}
                <div className="text-center mt-4 mb-6">
                    <h2 className="text-3xl sm:text-5xl font-serif font-bold text-amber-800 underline decoration-amber-300 decoration-2 underline-offset-8">
                        {cert.studentName}
                    </h2>
                </div>

                {/* Course Statement */}
                <div className="text-center max-w-2xl mx-auto text-slate-700 text-sm sm:text-base leading-relaxed">
                    has successfully completed the comprehensive professional training program in
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 mb-2 font-serif">
                        "{cert.courseName}"
                    </div>
                    demonstrating practical proficiency and operational expertise with high honors.
                </div>

                {/* Grade Badge */}
                <div className="flex justify-center mt-6">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle2 className="h-4 w-4 text-amber-600" />
                        {cert.grade}
                    </span>
                </div>

                {/* Footer Signatures & Seal */}
                <div className="mt-14 pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-6 items-end text-center relative z-10">
                    {/* Left: Issue Details */}
                    <div className="text-left space-y-1">
                        <p className="text-xs text-slate-400 font-medium">Date of Issuance</p>
                        <p className="text-sm font-bold text-slate-800">{cert.issueDate}</p>
                        <p className="text-[11px] text-slate-400 pt-2 font-mono">
                            ID: <span className="font-bold text-slate-600">{cert.certificateNumber}</span>
                        </p>
                    </div>

                    {/* Middle: Official Seal Badge */}
                    <div className="hidden sm:flex flex-col items-center">
                        <div className="h-20 w-20 rounded-full border-4 border-amber-400 bg-amber-50 flex flex-col items-center justify-center p-1 text-center shadow-inner">
                            <span className="text-[9px] font-bold text-amber-800 tracking-tighter uppercase">Official</span>
                            <Award className="h-6 w-6 text-amber-600 my-0.5" />
                            <span className="text-[9px] font-bold text-amber-800 tracking-tighter uppercase">Verified</span>
                        </div>
                    </div>

                    {/* Right: Signature */}
                    <div className="text-right space-y-1">
                        <div className="font-serif italic text-lg font-bold text-amber-800 pb-1">
                            {cert.instructorName}
                        </div>
                        <div className="border-t border-slate-300 pt-1 text-xs font-bold text-slate-700">
                            Instructor & Lead Trainer
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold">{instituteName}</p>
                    </div>
                </div>

                {/* Print watermark styling */}
                <style jsx global>{`
                    @media print {
                        body {
                            background: white !important;
                            color: black !important;
                        }
                        @page {
                            size: landscape;
                            margin: 0;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}
