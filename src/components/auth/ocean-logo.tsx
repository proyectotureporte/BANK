import Image from "next/image";

export function OceanLogo({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = {
    sm: { width: 80, height: 80 },
    md: { width: 120, height: 120 },
    lg: { width: 160, height: 160 },
  };

  const { width, height } = dimensions[size];

  return (
    <div className="flex flex-col items-center gap-1">
      <Image
        src="/logo.png"
        alt="Ocean Bank"
        width={width}
        height={height}
        priority
      />
    </div>
  );
}
