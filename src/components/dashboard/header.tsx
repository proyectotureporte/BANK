"use client";

import { useSession } from "next-auth/react";

export function DashboardHeader() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <h2 className="text-lg font-semibold">
        Bienvenido, {session?.user?.name || "Usuario"}
      </h2>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {session?.user?.email}
        </span>
      </div>
    </header>
  );
}
