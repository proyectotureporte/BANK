"use client";

import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { MobileSidebar } from "@/components/shared/mobile-sidebar";
import { AdminSidebarContent } from "@/components/admin/admin-sidebar";

export function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar>
          <AdminSidebarContent />
        </MobileSidebar>
        <h2 className="text-base md:text-lg font-semibold">Administración Ocean Bank</h2>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
          Admin
        </Badge>
        <span className="hidden sm:inline text-sm text-muted-foreground">
          {session?.user?.email}
        </span>
      </div>
    </header>
  );
}
