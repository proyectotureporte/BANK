export function BTFLogo({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizes[size]} font-black tracking-widest text-primary`}
      >
        BTF
      </div>
      <div className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        Banco Tesis Final
      </div>
    </div>
  );
}
