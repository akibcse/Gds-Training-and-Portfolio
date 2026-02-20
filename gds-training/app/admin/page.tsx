import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  redirect("/admin/dashboard");
}
