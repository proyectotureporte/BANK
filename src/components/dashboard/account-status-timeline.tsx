import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusValue =
  | "pending"
  | "approved"
  | "validation_pending"
  | "completed";

const STEPS: { value: StatusValue; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "approved", label: "Aprobada" },
  { value: "validation_pending", label: "Validación Pendiente" },
  { value: "completed", label: "Completada" },
];

const STEP_COLORS = [
  { bg: "bg-yellow-400", text: "text-yellow-600", ring: "ring-yellow-200" },
  { bg: "bg-lime-400", text: "text-lime-600", ring: "ring-lime-200" },
  { bg: "bg-emerald-400", text: "text-emerald-600", ring: "ring-emerald-200" },
  { bg: "bg-green-500", text: "text-green-600", ring: "ring-green-200" },
];

export function AccountStatusTimeline({
  status,
}: {
  status?: string | null;
}) {
  const normalized = (status as StatusValue) || "validation_pending";
  const currentIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.value === normalized)
  );

  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute top-4 left-0 right-0 h-1 rounded-full bg-muted" />
        <div
          className="absolute top-4 left-0 h-1 rounded-full bg-gradient-to-r from-yellow-400 via-lime-400 to-emerald-500"
          style={{
            width:
              currentIndex === 0
                ? "0%"
                : `${(currentIndex / (STEPS.length - 1)) * 100}%`,
          }}
        />

        <div className="relative grid grid-cols-4 gap-2">
          {STEPS.map((step, idx) => {
            const reached = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const colors = STEP_COLORS[idx];
            return (
              <div
                key={step.value}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
                    reached
                      ? `${colors.bg} border-transparent text-white shadow-md`
                      : "bg-background border-muted text-muted-foreground",
                    isCurrent && `ring-4 ${colors.ring}`
                  )}
                >
                  {reached && idx < currentIndex ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold">{idx + 1}</span>
                  )}
                </div>
                <p
                  className={cn(
                    "mt-2 text-[10px] sm:text-xs font-medium leading-tight",
                    reached ? colors.text : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
