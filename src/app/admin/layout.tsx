// src/app/admin/layout.tsx

import { AdminHeader } from "@/components/site/admim/general/admin-header";
import { AdminSidebar } from "@/components/site/admim/general/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full max-w-none bg-background text-foreground">
      <AdminHeader />

      <div className="flex w-full max-w-none">
        <AdminSidebar />

        <main className="min-w-0 flex-1 w-full max-w-none py-8">
          {children}
        </main>
      </div>
    </div>
  );
}