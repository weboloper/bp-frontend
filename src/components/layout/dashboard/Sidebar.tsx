"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Settings,
  Mail,
  TrendingUp,
  HelpCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: User,
    label: "Profile",
    href: "/profile",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
    requiresStaff: false,
  },
  {
    icon: Mail,
    label: "Messages",
    href: "/messages",
  },
  {
    icon: TrendingUp,
    label: "Analytics",
    href: "/analytics",
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  return (
    <Sidebar className="[&>[data-slot=sidebar-container]]:top-16">
      <SidebarContent className="lg:py-16">
        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                // Hide staff-only items from non-staff users (only after loading completes)
                if (item.requiresStaff && !isLoading && !user?.is_staff) {
                  return null;
                }

                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - Help Section */}
      <SidebarFooter>
        <SidebarGroup>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Need Help?</p>
                <p className="text-xs text-muted-foreground">
                  Check our documentation or contact support.
                </p>
                <Link
                  href="/docs"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  View Docs →
                </Link>
              </div>
            </div>
          </div>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
