export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen">
      {/* Background image — visible on mobile as full bg, on desktop as left half */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat lg:relative lg:w-1/2"
        style={{
          backgroundImage: "url('/invierno.png')",
          backgroundPosition: "left center",
        }}
      />

      {/* Form area — on mobile overlays the image with semi-transparent bg */}
      <div className="relative z-10 flex w-full flex-col bg-black/30 lg:w-1/2 lg:bg-white">
        {children}
      </div>
    </div>
  );
}
