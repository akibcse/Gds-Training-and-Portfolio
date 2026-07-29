"use client";

import { useState, useEffect } from "react";
import { ref, onValue, set, push, update, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { getCourses, Course } from "@/lib/getData";
import {
    Award,
    Plus,
    Search,
    User,
    BookOpen,
    Calendar,
    CheckCircle,
    ExternalLink,
    Trash2,
    Shield,
    X,
    Sparkles,
} from "lucide-react";
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

export default function AdminCertificatesPage() {
    const { user, profile } = useAuthStore();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
    const [coursesList, setCoursesList] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [selectedStudentType, setSelectedStudentType] = useState<"enrolled" | "custom">("enrolled");
    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [customStudentName, setCustomStudentName] = useState("");
    const [customStudentEmail, setCustomStudentEmail] = useState("");

    const [selectedCourseType, setSelectedCourseType] = useState<"existing" | "custom">("existing");
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [customCourseTitle, setCustomCourseTitle] = useState("");

    const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
    const [grade, setGrade] = useState("Passed with Distinction");
    const [instructorName, setInstructorName] = useState("Md. Akib Hasan");

    // Load certificates, enrolled students, and courses
    useEffect(() => {
        // Load courses
        getCourses().then(setCoursesList).catch(console.error);

        // Load certificates
        const certsRef = ref(db, "certificates");
        const unsubCerts = onValue(certsRef, (snap) => {
            const data = snap.val();
            if (data) {
                const list = Object.values(data).sort(
                    (a: any, b: any) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
                ) as Certificate[];
                setCertificates(list);
            } else {
                setCertificates([]);
            }
            setLoading(false);
        });

        // Load enrolled students from payment_submissions
        const paymentsRef = ref(db, "payment_submissions");
        const unsubPayments = onValue(paymentsRef, (snap) => {
            const data = snap.val();
            if (data) {
                const approved = Object.values(data).filter((s: any) => s.status === "Approved");
                setEnrolledStudents(approved);
            } else {
                setEnrolledStudents([]);
            }
        });

        return () => {
            unsubCerts();
            unsubPayments();
        };
    }, []);

    const handleIssueCertificate = async (e: React.FormEvent) => {
        e.preventDefault();

        let sId = "";
        let sName = "";
        let sEmail = "";

        if (selectedStudentType === "enrolled") {
            const found = enrolledStudents.find((s) => s.id === selectedStudent || s.studentId === selectedStudent);
            if (!found) {
                alert("Please select an enrolled student");
                return;
            }
            sId = found.studentId || found.id;
            sName = found.studentName;
            sEmail = found.studentEmail;
        } else {
            if (!customStudentName.trim()) {
                alert("Please enter student name");
                return;
            }
            sId = `custom_${Date.now()}`;
            sName = customStudentName.trim();
            sEmail = customStudentEmail.trim();
        }

        let cId = "";
        let cName = "";

        if (selectedCourseType === "existing") {
            const found = coursesList.find((c) => c.id === selectedCourse || c.slug === selectedCourse);
            if (!found) {
                alert("Please select a course");
                return;
            }
            cId = found.id || found.slug;
            cName = found.title;
        } else {
            if (!customCourseTitle.trim()) {
                alert("Please enter custom course title");
                return;
            }
            cId = `custom_course_${Date.now()}`;
            cName = customCourseTitle.trim();
        }

        setSubmitting(true);

        try {
            const certNum = `GDS-CERT-${Math.floor(100000 + Math.random() * 900000)}`;
            const certId = `cert_${Date.now()}`;

            const certData: Certificate = {
                id: certId,
                certificateNumber: certNum,
                studentId: sId,
                studentName: sName,
                studentEmail: sEmail,
                courseId: cId,
                courseName: cName,
                issueDate,
                completionDate: issueDate,
                grade: grade || "Verified Completion",
                instructorName: instructorName || "Md. Akib Hasan",
                issuedBy: profile?.email || user?.email || "Admin",
                issuedAt: new Date().toISOString(),
            };

            // 1. Save certificate
            await set(ref(db, `certificates/${certId}`), certData);

            // 2. Notify student
            if (sId && !sId.startsWith("custom_")) {
                const notifRef = push(ref(db, `student_notifications/${sId}`));
                await set(notifRef, {
                    id: notifRef.key,
                    studentId: sId,
                    type: "certificate_issued",
                    message: `Congratulations! Your certificate for "${cName}" has been issued.`,
                    link: `/certificates/${certId}`,
                    read: false,
                    createdAt: new Date().toISOString(),
                });
            }

            // 3. Notify admin log
            const adminNotifRef = push(ref(db, "notifications"));
            await set(adminNotifRef, {
                id: adminNotifRef.key,
                type: "certificate_issued",
                message: `Issued certificate ${certNum} to ${sName} for ${cName}`,
                link: `/certificates/${certId}`,
                read: false,
                createdAt: new Date().toISOString(),
            });

            setModalOpen(false);
            // Reset form
            setSelectedStudent("");
            setCustomStudentName("");
            setCustomStudentEmail("");
            setSelectedCourse("");
            setCustomCourseTitle("");
        } catch (err: any) {
            alert("Failed to issue certificate: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRevoke = async (cert: Certificate) => {
        if (!confirm(`Are you sure you want to revoke certificate ${cert.certificateNumber} for ${cert.studentName}?`)) return;
        try {
            await remove(ref(db, `certificates/${cert.id}`));
        } catch (err: any) {
            alert("Failed to revoke certificate: " + err.message);
        }
    };

    const filtered = certificates.filter(
        (c) =>
            c.studentName.toLowerCase().includes(search.toLowerCase()) ||
            c.certificateNumber.toLowerCase().includes(search.toLowerCase()) ||
            c.courseName.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-10 w-48 bg-aviation-100 rounded-xl" />
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-white rounded-2xl border border-aviation-50" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight flex items-center gap-3">
                        <Award className="h-8 w-8 text-amber-500" />
                        E-Certificates Management
                    </h1>
                    <p className="mt-1 text-ink/50 text-sm">
                        Issue verified course completion certificates for standard or custom courses.
                    </p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 bg-aviation-600 hover:bg-aviation-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-soft text-sm transition-all active:scale-95 shrink-0"
                >
                    <Plus className="h-4 w-4" />
                    Issue New Certificate
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-aviation-100 shadow-soft flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-lg shadow-amber-200">
                        <Award className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-ink/40">Total Certificates Issued</p>
                        <h3 className="text-2xl font-bold text-ink">{certificates.length}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-aviation-100 shadow-soft flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-200">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-ink/40">Enrolled Students</p>
                        <h3 className="text-2xl font-bold text-ink">{enrolledStudents.length}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-aviation-100 shadow-soft flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-aviation-600 text-white flex items-center justify-center font-bold shadow-lg shadow-aviation-200">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-ink/40">Available Courses</p>
                        <h3 className="text-2xl font-bold text-ink">{coursesList.length}</h3>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
                <input
                    type="text"
                    placeholder="Search student, certificate #, course..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-aviation-100 rounded-xl text-sm outline-none focus:border-aviation-300 bg-white shadow-soft"
                />
            </div>

            {/* Certificates Table */}
            <div className="bg-white rounded-2xl border border-aviation-100 shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-aviation-50/50 border-b border-aviation-100">
                                <th className="px-6 py-4 text-xs font-bold text-ink/60 uppercase">Certificate #</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink/60 uppercase">Student Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink/60 uppercase">Course Title</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink/60 uppercase">Issue Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink/60 uppercase">Grade / Level</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink/60 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-aviation-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-ink/40">
                                        <Award className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                        <p className="font-semibold">No certificates issued yet</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((cert) => (
                                    <tr key={cert.id} className="hover:bg-aviation-50/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-mono font-bold text-xs border border-amber-200">
                                                <Award className="h-3.5 w-3.5" />
                                                {cert.certificateNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-ink text-sm">{cert.studentName}</p>
                                            <p className="text-xs text-ink/50">{cert.studentEmail || "N/A"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-ink text-sm">{cert.courseName}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-ink/60 whitespace-nowrap">
                                            {cert.issueDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                                                <CheckCircle className="h-3 w-3" />
                                                {cert.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/certificates/${cert.id}`}
                                                    target="_blank"
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-aviation-50 text-aviation-700 hover:bg-aviation-100 text-xs font-bold transition-colors"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    View & Print
                                                </Link>
                                                <button
                                                    onClick={() => handleRevoke(cert)}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Revoke Certificate"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Issue Certificate Modal */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-5 overflow-y-auto max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-aviation-50 pb-3">
                            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                                <Award className="h-5 w-5 text-amber-500" />
                                Issue New E-Certificate
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-ink/40 hover:text-ink">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleIssueCertificate} className="space-y-4">
                            {/* Student Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-ink mb-1.5">
                                    Student Selection <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4 mb-2">
                                    <label className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
                                        <input
                                            type="radio"
                                            name="studentType"
                                            checked={selectedStudentType === "enrolled"}
                                            onChange={() => setSelectedStudentType("enrolled")}
                                        />
                                        Select Enrolled Student ({enrolledStudents.length})
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
                                        <input
                                            type="radio"
                                            name="studentType"
                                            checked={selectedStudentType === "custom"}
                                            onChange={() => setSelectedStudentType("custom")}
                                        />
                                        Custom Student Details
                                    </label>
                                </div>

                                {selectedStudentType === "enrolled" ? (
                                    <select
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-aviation-100 bg-white text-sm outline-none focus:border-aviation-600"
                                        required
                                    >
                                        <option value="">-- Choose Enrolled Student --</option>
                                        {enrolledStudents.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.studentName} ({s.studentEmail}) - {s.courseName}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Student Full Name *"
                                            value={customStudentName}
                                            onChange={(e) => setCustomStudentName(e.target.value)}
                                            className="px-3.5 py-2.5 rounded-xl border border-aviation-100 text-sm outline-none focus:border-aviation-600"
                                            required
                                        />
                                        <input
                                            type="email"
                                            placeholder="Student Email (optional)"
                                            value={customStudentEmail}
                                            onChange={(e) => setCustomStudentEmail(e.target.value)}
                                            className="px-3.5 py-2.5 rounded-xl border border-aviation-100 text-sm outline-none focus:border-aviation-600"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Course Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-ink mb-1.5">
                                    Course Title <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4 mb-2">
                                    <label className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
                                        <input
                                            type="radio"
                                            name="courseType"
                                            checked={selectedCourseType === "existing"}
                                            onChange={() => setSelectedCourseType("existing")}
                                        />
                                        Select Existing Course
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
                                        <input
                                            type="radio"
                                            name="courseType"
                                            checked={selectedCourseType === "custom"}
                                            onChange={() => setSelectedCourseType("custom")}
                                        />
                                        Custom Course Title
                                    </label>
                                </div>

                                {selectedCourseType === "existing" ? (
                                    <select
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-aviation-100 bg-white text-sm outline-none focus:border-aviation-600"
                                        required
                                    >
                                        <option value="">-- Choose Course --</option>
                                        {coursesList.map((c) => (
                                            <option key={c.id || c.slug} value={c.id || c.slug}>
                                                {c.title}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="e.g. Master GDS Air Ticketing & Sabre Certification"
                                        value={customCourseTitle}
                                        onChange={(e) => setCustomCourseTitle(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-aviation-100 text-sm outline-none focus:border-aviation-600"
                                        required
                                    />
                                )}
                            </div>

                            {/* Issue Date & Grade */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-ink mb-1">Issue Date</label>
                                    <input
                                        type="date"
                                        value={issueDate}
                                        onChange={(e) => setIssueDate(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-aviation-100 text-sm outline-none focus:border-aviation-600 bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-ink mb-1">Grade / Distinction</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Passed with Distinction"
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-aviation-100 text-sm outline-none focus:border-aviation-600"
                                    />
                                </div>
                            </div>

                            {/* Instructor Name */}
                            <div>
                                <label className="block text-xs font-semibold text-ink mb-1">Instructor Name</label>
                                <input
                                    type="text"
                                    value={instructorName}
                                    onChange={(e) => setInstructorName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-aviation-100 text-sm outline-none focus:border-aviation-600"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 bg-aviation-600 hover:bg-aviation-700 text-white font-bold py-3 rounded-xl shadow-soft text-sm transition-all disabled:opacity-60 mt-2"
                            >
                                <Sparkles className="h-4 w-4" />
                                {submitting ? "Issuing Certificate..." : "Generate & Issue Certificate"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
