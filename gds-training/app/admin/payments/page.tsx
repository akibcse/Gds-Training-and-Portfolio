"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { 
    CheckCircle, 
    XCircle, 
    Search, 
    Clock, 
    GraduationCap, 
    Users, 
    DollarSign, 
    CreditCard,
    Mail,
    Phone,
    BookOpen
} from "lucide-react";

export default function AdminPaymentsPage() {
  const { user, profile, isLoading } = useAuthStore();
  const router = useRouter();
  
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("Approved"); // Default to Enrolled Students
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      const submissionsRef = ref(db, 'payment_submissions');
      const unsubscribe = onValue(submissionsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const arr = Object.values(data).sort((a: any, b: any) => 
            new Date(b.submittedAt || Date.now()).getTime() - new Date(a.submittedAt || Date.now()).getTime()
          );
          setSubmissions(arr);
        } else {
          setSubmissions([]);
        }
        setLoadingData(false);
      }, (error) => {
        console.error("Firebase fetch error:", error);
        setLoadingData(false);
      });

      return () => unsubscribe();
    } else {
      setLoadingData(false);
    }
  }, [user]);

  if (isLoading || loadingData) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-aviation-600"></div>
      </div>
    );
  }

  const handleApprove = async (sub: any) => {
    if (!confirm(`Are you sure you want to approve enrollment and payment for ${sub.studentName}?`)) return;
    
    try {
      const updates: any = {};
      updates[`payment_submissions/${sub.id}/status`] = "Approved";
      updates[`payment_submissions/${sub.id}/approvedBy`] = profile?.email || user?.email || "Admin";
      updates[`payment_submissions/${sub.id}/approvedAt`] = new Date().toISOString();
      
      // Also create/update enrollment record
      const enrollmentId = `${sub.studentId}_${sub.courseId}`;
      updates[`enrollments/${enrollmentId}`] = {
        studentId: sub.studentId,
        studentName: sub.studentName,
        studentEmail: sub.studentEmail,
        studentPhone: sub.studentPhone,
        courseId: sub.courseId,
        courseName: sub.courseName,
        transactionId: sub.transactionId,
        amount: sub.amount,
        accessGranted: true,
        paymentVerified: true,
        enrolledAt: new Date().toISOString()
      };

      await update(ref(db), updates);
    } catch (err: any) {
      alert("Failed to approve enrollment: " + err.message);
    }
  };

  const handleReject = async (sub: any) => {
    const reason = prompt("Enter reason for rejection (e.g. Invalid TrxID):");
    if (!reason) return;

    try {
      const updates: any = {};
      updates[`payment_submissions/${sub.id}/status`] = "Rejected";
      updates[`payment_submissions/${sub.id}/rejectionReason`] = reason;
      updates[`payment_submissions/${sub.id}/rejectedBy`] = profile?.email || user?.email || "Admin";

      await update(ref(db), updates);
    } catch (err: any) {
      alert("Failed to reject payment: " + err.message);
    }
  };

  // Stats Calculations
  const approvedList = submissions.filter(s => s.status === "Approved");
  const pendingList = submissions.filter(s => s.status === "Pending");
  const totalRevenue = approvedList.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

  // Filtering list based on tab & search
  const filteredSubmissions = submissions.filter(sub => {
    // Tab Filter
    let tabMatch = true;
    if (activeTab === "Approved") tabMatch = sub.status === "Approved";
    else if (activeTab === "Pending") tabMatch = sub.status === "Pending";
    else if (activeTab === "Rejected") tabMatch = sub.status === "Rejected";

    // Search Query Filter
    let searchMatch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (sub.studentName || "").toLowerCase();
      const email = (sub.studentEmail || "").toLowerCase();
      const phone = (sub.studentPhone || "").toLowerCase();
      const course = (sub.courseName || "").toLowerCase();
      const trx = (sub.transactionId || "").toLowerCase();
      searchMatch = name.includes(q) || email.includes(q) || phone.includes(q) || course.includes(q) || trx.includes(q);
    }

    return tabMatch && searchMatch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink tracking-tight flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-aviation-600" />
            Enrolled Students & Payments
          </h1>
          <p className="mt-1 text-ink/50">
            View student enrollment records, manage manual bKash transactions, and approve course access.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-aviation-100 bg-white p-6 shadow-soft flex items-center gap-4">
          <div className="rounded-xl p-3.5 bg-emerald-500 text-white shadow-lg shadow-emerald-200">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink/40">Total Enrolled Students</p>
            <h3 className="text-2xl font-bold text-ink">{approvedList.length}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-aviation-100 bg-white p-6 shadow-soft flex items-center gap-4">
          <div className="rounded-xl p-3.5 bg-amber-500 text-white shadow-lg shadow-amber-200">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink/40">Pending Verification</p>
            <h3 className="text-2xl font-bold text-ink">{pendingList.length}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-aviation-100 bg-white p-6 shadow-soft flex items-center gap-4">
          <div className="rounded-xl p-3.5 bg-blue-600 text-white shadow-lg shadow-blue-200">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink/40">Total Course Revenue</p>
            <h3 className="text-2xl font-bold text-ink">৳{totalRevenue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-xl shadow-soft border border-aviation-100 p-1.5 w-full sm:w-auto">
          {[
            { id: "Approved", label: `Enrolled Students (${approvedList.length})` },
            { id: "Pending", label: `Pending Approvals (${pendingList.length})` },
            { id: "All", label: `All Submissions (${submissions.length})` },
            { id: "Rejected", label: "Rejected" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? "bg-aviation-600 text-white shadow-sm" 
                  : "text-ink/60 hover:text-aviation-600 hover:bg-aviation-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
          <input
            type="text"
            placeholder="Search student, email, phone, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-aviation-100 rounded-xl text-sm outline-none focus:border-aviation-600 focus:ring-2 focus:ring-aviation-600/20 shadow-soft transition-all"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-aviation-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-aviation-50/50 border-b border-aviation-100">
                <th className="px-6 py-4 text-xs font-bold text-ink/60 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-ink/60 uppercase tracking-wider">Enrolled Student Info</th>
                <th className="px-6 py-4 text-xs font-bold text-ink/60 uppercase tracking-wider">Course Enrolled</th>
                <th className="px-6 py-4 text-xs font-bold text-ink/60 uppercase tracking-wider">TrxID / Method</th>
                <th className="px-6 py-4 text-xs font-bold text-ink/60 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-ink/60 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aviation-50">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-ink/40">
                    <div className="flex flex-col items-center gap-2">
                      <GraduationCap className="h-10 w-10 text-ink/20" />
                      <p className="font-semibold">No records found for "{activeTab}" filter.</p>
                      {searchQuery && <p className="text-xs text-ink/40">Try resetting your search query.</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-aviation-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-ink">
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-xs text-ink/40">
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-aviation-50 text-aviation-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {(sub.studentName || "S").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-ink">{sub.studentName || "Student"}</div>
                          <div className="flex items-center gap-1.5 text-xs text-ink/50 mt-0.5">
                            <Mail className="h-3 w-3 shrink-0" /> {sub.studentEmail}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-ink/50 mt-0.5">
                            <Phone className="h-3 w-3 shrink-0" /> {sub.studentPhone || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-ink">
                        <BookOpen className="h-4 w-4 text-aviation-600 shrink-0" />
                        <span className="line-clamp-1" title={sub.courseName}>{sub.courseName}</span>
                      </div>
                      <div className="text-sm font-bold text-[#E2136E] mt-1">
                        ৳{(Number(sub.amount) || 0).toLocaleString()}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-50 text-[#E2136E] border border-pink-100 text-xs font-mono font-bold uppercase">
                        {sub.transactionId || "N/A"}
                      </div>
                      <div className="text-xs text-ink/50 mt-1 font-medium">{sub.paymentMethod || "bKash"}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {sub.status === "Approved" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                          <CheckCircle className="h-3.5 w-3.5" /> Enrolled
                        </span>
                      )}
                      {sub.status === "Pending" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                          <Clock className="h-3.5 w-3.5" /> Pending
                        </span>
                      )}
                      {sub.status === "Rejected" && (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 w-fit">
                            <XCircle className="h-3.5 w-3.5" /> Rejected
                          </span>
                          {sub.rejectionReason && (
                            <span className="text-[10px] text-rose-600 max-w-[140px] leading-tight">Reason: {sub.rejectionReason}</span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {sub.status === "Pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleApprove(sub)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all shadow-sm active:scale-95"
                          >
                            <CheckCircle className="h-4 w-4" /> Approve
                          </button>
                          <button 
                            onClick={() => handleReject(sub)}
                            className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all active:scale-95"
                          >
                            <XCircle className="h-4 w-4" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-ink/40 text-xs italic">
                          {sub.status === 'Approved' ? `Verified by ${sub.approvedBy || 'Admin'}` : `Rejected by ${sub.rejectedBy || 'Admin'}`}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
