"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle, 
  PlayCircle, 
  LogOut, 
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Video
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { ref, onValue } from "firebase/database";

export default function StudentDashboard() {
  const { user, profile, isLoading } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [purchases, setPurchases] = useState<any[]>([]);
  const [demoBookings, setDemoBookings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, mounted, router]);

  useEffect(() => {
    if (user?.email) {
      const userEmail = user.email.toLowerCase();

      // 1. Fetch Payment Submissions / Paid Course Purchases
      const paymentsRef = ref(db, 'payment_submissions');
      const unsubscribePayments = onValue(paymentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const userSubs = Object.values(data).filter((sub: any) => 
            (sub.studentId && sub.studentId === user.uid) || 
            (sub.studentEmail && sub.studentEmail.toLowerCase() === userEmail)
          ).sort((a: any, b: any) => 
            new Date(b.submittedAt || Date.now()).getTime() - new Date(a.submittedAt || Date.now()).getTime()
          );
          setPurchases(userSubs);
        } else {
          setPurchases([]);
        }
      });

      // 2. Fetch Demo Class Bookings / Leads
      const leadsRef = ref(db, 'cms/leads');
      const unsubscribeLeads = onValue(leadsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const userDemos = Object.values(data).filter((lead: any) => 
            lead.email && lead.email.toLowerCase() === userEmail
          ).sort((a: any, b: any) => 
            new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime()
          );
          setDemoBookings(userDemos);
        } else {
          setDemoBookings([]);
        }
        setLoadingData(false);
      }, () => {
        setLoadingData(false);
      });

      return () => {
        unsubscribePayments();
        unsubscribeLeads();
      };
    } else {
      setLoadingData(false);
    }
  }, [user]);

  if (!mounted || isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1D4ED8]"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Dashboard Header */}
      <div className="bg-[#0F172A] pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            <div className="flex items-center gap-5">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="h-20 w-20 rounded-full object-cover border-4 border-[#1D4ED8]" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-blue-900 border-4 border-[#1D4ED8] flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase() || "S"}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">Welcome, {profile?.displayName || "Student"}!</h1>
                <p className="text-slate-400 mt-1">{profile?.email || user.email}</p>
                <div className="mt-2 inline-block bg-blue-900/50 text-blue-300 border border-blue-800 rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
                  {profile?.role || "Student"} Account
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-20 space-y-8">
        
        {profile?.role === "admin" && (
          <div className="bg-gradient-to-r from-blue-600 to-[#1D4ED8] rounded-xl p-6 shadow-lg flex items-center justify-between text-white">
            <div>
              <h2 className="text-xl font-bold">Admin Controls</h2>
              <p className="text-blue-100 text-sm mt-1">Manage manual bKash payments, demo bookings, and student enrollments.</p>
            </div>
            <Link href="/admin/payments" className="bg-white text-[#1D4ED8] font-bold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              Enrolled Students Center
            </Link>
          </div>
        )}

        {/* SECTION 1: Paid Course Purchases */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5 flex items-center justify-between bg-slate-50">
            <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#1D4ED8]" /> Paid Course Enrollments ({purchases.length})
            </h2>
            <Link href="/courses" className="text-sm font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1">
              Browse All Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {loadingData ? (
              <div className="p-8 text-center text-slate-400">Loading your course enrollments...</div>
            ) : purchases.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">No Course Enrollments Found</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                  You haven't submitted payment for any paid course yet. Explore our courses to start learning GDS and Air Ticketing.
                </p>
                <Link 
                  href="/courses" 
                  className="inline-flex items-center gap-2 bg-[#1D4ED8] text-white font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-blue-800 transition-colors text-sm"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              purchases.map((purchase) => (
                <div key={purchase.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center">
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-800">{purchase.courseName}</h3>
                      <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                        TrxID: {purchase.transactionId}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
                      <span>Submitted: {new Date(purchase.submittedAt || Date.now()).toLocaleDateString()}</span>
                      <span>Amount: <strong className="text-[#E2136E]">৳{(Number(purchase.amount) || 0).toLocaleString()}</strong></span>
                      <span>Payment Method: {purchase.paymentMethod || "bKash"}</span>
                    </div>
                    
                    {purchase.rejectionReason && (
                      <div className="mt-3 bg-rose-50 text-rose-700 rounded-lg px-3 py-2 text-xs font-medium border border-rose-100">
                        <strong>Rejection Reason:</strong> {purchase.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                    
                    {purchase.status === "Pending" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-sm font-semibold">
                        <Clock className="h-4 w-4" /> Pending Approval
                      </span>
                    )}
                    {purchase.status === "Approved" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold">
                        <CheckCircle className="h-4 w-4" /> Approved & Enrolled
                      </span>
                    )}
                    {purchase.status === "Rejected" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-sm font-semibold">
                        <XCircle className="h-4 w-4" /> Payment Rejected
                      </span>
                    )}

                    {purchase.status === "Approved" ? (
                      <Link 
                        href={`/courses/${purchase.courseId}/learn`}
                        className="mt-2 w-full md:w-auto text-center bg-[#1D4ED8] hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <PlayCircle className="h-4 w-4" /> Start Learning
                      </Link>
                    ) : purchase.status === "Rejected" ? (
                      <Link 
                        href={`/checkout/${purchase.courseId}`}
                        className="mt-2 w-full md:w-auto text-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm"
                      >
                        Re-submit Payment
                      </Link>
                    ) : (
                      <div className="mt-2 w-full md:w-auto text-center bg-slate-100 text-slate-500 px-4 py-1.5 rounded-lg text-xs font-semibold border border-slate-200">
                        Verification in Progress (1-24 hrs)
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECTION 2: Demo Class Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5 flex items-center justify-between bg-slate-50">
            <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
              <Video className="h-5 w-5 text-cyan-600" /> My Demo Class Bookings ({demoBookings.length})
            </h2>
            <Link href="/#lead-form" className="text-sm font-semibold text-cyan-600 hover:underline flex items-center gap-1">
              Book Another Demo Class <Sparkles className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {loadingData ? (
              <div className="p-8 text-center text-slate-400">Loading demo class bookings...</div>
            ) : demoBookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p className="text-sm">You haven't booked any free demo class yet.</p>
                <Link href="/#lead-form" className="inline-block mt-3 text-xs font-bold text-cyan-600 hover:underline">
                  Click here to Book a Free Demo Class on Homepage
                </Link>
              </div>
            ) : (
              demoBookings.map((demo) => (
                <div key={demo.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{demo.course || "Free Demo Class"}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Booked: {new Date(demo.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                      <span>Phone: {demo.phone}</span>
                    </div>
                  </div>

                  <div>
                    {demo.status === "New" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                        <Clock className="h-3.5 w-3.5" /> Booking Received (Advisor Scheduling)
                      </span>
                    )}
                    {demo.status === "Contacted" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                        <ShieldCheck className="h-3.5 w-3.5" /> Advisor Contacted You
                      </span>
                    )}
                    {demo.status === "Converted" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        <CheckCircle className="h-3.5 w-3.5" /> Demo Completed / Enrolled
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
