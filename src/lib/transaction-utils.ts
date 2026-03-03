type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  approved: { label: "Aprobada", variant: "default" },
  rejected: { label: "Denegada", variant: "destructive" },
  in_review: { label: "En Revisión", variant: "outline" },
};

export function getStatusLabel(status: string): string {
  return STATUS_CONFIG[status]?.label ?? status;
}

export function getStatusBadgeVariant(status: string): BadgeVariant {
  return STATUS_CONFIG[status]?.variant ?? "secondary";
}
