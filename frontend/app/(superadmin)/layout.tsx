import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
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
