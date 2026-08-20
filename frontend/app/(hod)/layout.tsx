import { Metadata } from "next";
import { HodSidebar } from "@/components/layout/HodSidebar";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "HOD Portal | DR IT GROUP",
};

export default function HodLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile/Desktop Sidebar */}
      <div className="hidden md:flex w-56 flex-col fixed inset-y-0 z-50">
        <HodSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-56 min-h-screen transition-all">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 mt-16 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
