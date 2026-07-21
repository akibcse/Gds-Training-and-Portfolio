"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams, useRouter } from "next/navigation";
import { getCourseBySlug, Course } from "@/lib/getData";
import { ref, push, set } from "firebase/database";
import { db } from "@/lib/firebase";
// Note: In a real implementation we would also use firebase/storage for the screenshot.
import { CheckCircle, UploadCloud, AlertCircle, Copy, Check, Info, Lock } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { slug } = useParams();
  const { user, profile, isLoading: authLoading } = useAuthStore();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  
  const [paymentMethod, setPaymentMethod] = useState("manual_bkash");
  const [phone, setPhone] = useState("");
  const [txnId, setTxnId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadCourse() {
      if (typeof slug === "string") {
        const data = await getCourseBySlug(slug);
        setCourse(data);
      }
      setLoadingCourse(false);
    }
    loadCourse();
  }, [slug]);

  if (authLoading || loadingCourse || !user) {
    return <div className="min-h-screen bg-[#F8FAFC] flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1D4ED8]"></div></div>;
  }

  if (!course) {
    return <div className="min-h-screen flex justify-center items-center">Course not found.</div>;
  }

  const discountPrice = course.discountPrice || 5000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnId || !phone) {
      setError("Transaction ID and Mobile Number are required.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const submissionRef = push(ref(db, 'payment_submissions'));
      const newSubmission = {
        id: submissionRef.key,
        studentId: user.uid,
        studentName: profile?.displayName || "Student",
        studentEmail: user.email,
        studentPhone: phone,
        courseId: course.slug,
        courseName: course.title,
        amount: discountPrice,
        transactionId: txnId,
        paymentMethod: "Manual bKash",
        status: "Pending",
        submittedAt: new Date().toISOString(),
        screenshotUrl: "" // omitted storage upload for brevity in this mockup
      };

      await set(submissionRef, newSubmission);
      setSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);

    } catch (err: any) {
      setError("Failed to submit payment. " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-slate-100">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Submitted!</h2>
          <p className="text-slate-600 mb-6">Your transaction ID <span className="font-bold">{txnId}</span> is now pending review.</p>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm text-left mb-6">
            Verification usually takes 1-24 hours. You will receive an email and WhatsApp notification once approved.
          </div>
          <p className="text-sm text-slate-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A]">Secure Checkout</h1>
          <p className="text-slate-500 mt-1">Complete your enrollment for {course.title}</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Main Form Area */}
          <div className="md:col-span-3 space-y-6">
            
            {/* Payment Method Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">1. Select Payment Method</h2>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPaymentMethod("manual_bkash")}
                  className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'manual_bkash' ? 'border-[#E2136E] bg-pink-50 text-[#E2136E]' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="font-extrabold text-xl tracking-tight">bKash</span>
                  <span className="text-xs font-semibold">Manual Transfer</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod("nagad")}
                  className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'nagad' ? 'border-[#F26522] bg-orange-50 text-[#F26522]' : 'border-slate-200 hover:border-slate-300 opacity-50 cursor-not-allowed'}`}
                  disabled
                >
                  <span className="font-extrabold text-xl tracking-tight">Nagad</span>
                  <span className="text-xs font-semibold">Coming Soon</span>
                </button>
              </div>
            </div>

            {/* bKash Instructions */}
            {paymentMethod === "manual_bkash" && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">2. Make Payment</h2>
                
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-[#1D4ED8] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900 mb-3">
                        Please send exactly <strong className="text-lg text-[#E2136E]">৳{discountPrice.toLocaleString()}</strong> using the bKash "Send Money" or "Payment" option to the number below.
                      </p>
                      <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-semibold">bKash Personal / Send Money</p>
                          <p className="font-bold text-xl tracking-wider text-[#0F172A]">01521438546</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText("01521438546");
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors flex items-center gap-1 text-xs font-semibold" 
                          title="Copy Number"
                        >
                          {copied ? (
                            <>
                              <Check className="h-5 w-5 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-blue-700 mt-3 font-medium">Account Name: Aviation Academy Pro</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex gap-2 items-center">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Your Mobile Number (bKash Number)</label>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#E2136E] focus:border-[#E2136E] outline-none"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">bKash Transaction ID (TrxID)</label>
                    <input 
                      type="text" 
                      required
                      value={txnId}
                      onChange={(e) => setTxnId(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#E2136E] focus:border-[#E2136E] outline-none font-mono uppercase"
                      placeholder="8ABCDEF123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Upload Screenshot (Optional)</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                      <UploadCloud className="h-8 w-8 text-slate-400 mx-auto mb-2 group-hover:text-[#1D4ED8]" />
                      <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-[#E2136E] hover:bg-[#c90f5f] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-pink-500/30 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Verifying..." : "Submit Payment for Verification"}
                  </button>
                </form>

              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Order Summary</h2>
              
              <div className="flex gap-4 mb-6">
                <div className="h-16 w-20 shrink-0 bg-slate-100 rounded border border-slate-200 overflow-hidden">
                  {course.thumbnail && <img src={course.thumbnail} className="w-full h-full object-cover" alt="course thumbnail" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A] line-clamp-2 leading-tight">{course.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{course.instructorName || "Instructor"}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600 border-t border-slate-100 pt-4 mb-4">
                <div className="flex justify-between">
                  <span>Original Price</span>
                  <span className="line-through">৳{course.price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#0F172A] font-medium">
                  <span>Discount</span>
                  <span>- ৳{((course.price || 0) - discountPrice).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-between items-center mb-6">
                <span className="font-bold text-slate-800">Total</span>
                <span className="text-2xl font-bold text-[#E2136E]">৳{discountPrice.toLocaleString()}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 flex gap-2">
                <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                <span>Payments are secured. Your course access will be granted automatically upon verification.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
