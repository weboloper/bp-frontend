"use client";

import AppSidebar from "@/components/layout/dashboard/Sidebar";
import DashboardHeader from "@/components/layout/dashboard/DashboardHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { isLoading } = useAuth();

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <Spinner className="h-8 w-8 text-muted-foreground" />
  //     </div>
  //   );
  // }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <DashboardHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <main className="flex-1 p-6">{children}</main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
