"use client";

import { useSession } from "next-auth/react";
import { MobileSidebar } from "@/components/shared/mobile-sidebar";
import { DashboardSidebarContent } from "@/components/dashboard/sidebar";

export function DashboardHeader() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar>
          <DashboardSidebarContent />
        </MobileSidebar>
        <h2 className="text-base md:text-lg font-semibold">
          Bienvenido, {session?.user?.name || "Usuario"}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-sm text-muted-foreground">
          {session?.user?.email}
        </span>
      </div>
    </header>
  );
}
