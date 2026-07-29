"use client";

import { useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { Search, Award, CheckCircle2, XCircle, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";

interface CertificateResult {
  id: string;
  certificateNumber: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  grade: string;
  instructorName: string;
}

export default function CertificateVerifier() {
  const [certNumber, setCertNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertificateResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = certNumber.trim();
    if (!query) return;

    setLoading(true);
    setError("");
    setResult(null);
    setSearched(true);

    try {
      const certsRef = ref(db, "certificates");
      const snap = await get(certsRef);
      if (snap.exists()) {
        const data = snap.val();
        const found = Object.values(data).find(
          (c: any) =>
            c.certificateNumber &&
            c.certificateNumber.toLowerCase() === query.toLowerCase()
        ) as CertificateResult | undefined;

        if (found) {
          setResult(found);
        } else {
          setError("No valid certificate found with this Certificate Number.");
        }
      } else {
        setError("No valid certificate found with this Certificate Number.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to verify certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-aviation-100 bg-white p-6 md:p-8 shadow-soft">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <Award className="h-6 w-6" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-ink">Verify E-Certificate</h2>
        <p className="text-sm text-ink/70">
          Enter the unique Certificate Number (e.g. <span className="font-mono font-semibold text-amber-700">GDS-CERT-123456</span>) to verify authenticity.
        </p>

        <form onSubmit={handleVerify} className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
            <input
              type="text"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              placeholder="Enter Certificate Number..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 focus:ring-2 focus:ring-aviation-500/10 transition-all font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !certNumber.trim()}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-6 py-3 rounded-2xl text-sm shadow-md transition-all disabled:opacity-60 shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              "Verify Now"
            )}
          </button>
        </form>

        {/* Verification Result */}
        {searched && (
          <div className="mt-6 text-left">
            {result ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Officially Verified E-Certificate
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {result.certificateNumber}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Student Name</p>
                    <p className="font-bold text-slate-900">{result.studentName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Course</p>
                    <p className="font-bold text-slate-900">{result.courseName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Issue Date</p>
                    <p className="font-semibold text-slate-800">{result.issueDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Grade / Status</p>
                    <p className="font-semibold text-emerald-700">{result.grade}</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href={`/certificates/${result.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 underline"
                  >
                    View Official Certificate <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 flex items-start gap-3 text-rose-800">
                <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
