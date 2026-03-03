import Image from "next/image";

export function OceanLogo({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = {
    sm: { width: 160, height: 160 },
    md: { width: 240, height: 240 },
    lg: { width: 320, height: 320 },
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
