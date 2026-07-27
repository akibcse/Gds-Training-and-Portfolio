import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            <div className="min-h-screen bg-aviation-50/30">
                <Sidebar />
                <div className="transition-all duration-300 ease-in-out pl-64">
                    <Header />
                    <main className="p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AdminGuard>
    );
}
