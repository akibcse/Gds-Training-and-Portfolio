import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { isAdminAuthenticated } from "@/lib/admin";
import { readJsonFile } from "@/lib/storage";
import {
  getBlogs,
  getCourses,
  getPortfolioProfileRecord,
  getProfileRecord,
  getProjects,
  getSeoGlobal,
  getSeoPages,
  type LeadUser
} from "@/lib/admin-data";

type LeadRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  type: "registration" | "booking";
  createdAt: string;
};

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [users, registrations, bookings, courses, blogs, projects, seoGlobal, seoPages, profile, portfolioProfile] = await Promise.all([
    readJsonFile<LeadUser[]>("users.json"),
    readJsonFile<LeadRecord[]>("registrations.json"),
    readJsonFile<LeadRecord[]>("bookings.json"),
    getCourses(),
    getBlogs(),
    getProjects(),
    getSeoGlobal(),
    getSeoPages(),
    getProfileRecord(),
    getPortfolioProfileRecord()
  ]);

  return (
    <AdminDashboard
      users={users}
      registrations={registrations}
      bookings={bookings}
      courses={courses}
      blogs={blogs}
      projects={projects}
      seoGlobal={seoGlobal}
      seoPages={seoPages}
      profile={profile}
      portfolioProfile={portfolioProfile}
    />
  );
}
