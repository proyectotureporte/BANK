"use client";

import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";

export function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <h2 className="text-lg font-semibold">Administración Ocean Bank</h2>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
          Admin
        </Badge>
        <span className="text-sm text-muted-foreground">
          {session?.user?.email}
        </span>
      </div>
    </header>
  );
}
