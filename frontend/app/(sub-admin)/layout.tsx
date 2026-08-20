import Sidebar from "@/components/layout/SubAdminSidebar";
import Header from "@/components/layout/Header";

export default function SubAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="md:ml-56 pt-16">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
