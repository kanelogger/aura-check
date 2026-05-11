export default function LiquidGlassBg() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none -z-[2]"
      style={{ background: 'var(--bg-cream)' }}
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Floating ellipse A - teal */}
      <div
        className="absolute animate-float-a will-change-transform"
        style={{
          width: 280,
          height: 200,
          top: -20,
          left: -40,
          borderRadius: '50%',
          background: 'rgba(78, 205, 196, 0.08)',
          filter: 'blur(80px)',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Floating ellipse B - mint */}
      <div
        className="absolute animate-float-b will-change-transform"
        style={{
          width: 200,
          height: 280,
          bottom: '15%',
          right: -40,
          borderRadius: '50%',
          background: 'rgba(168, 230, 207, 0.10)',
          filter: 'blur(80px)',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Floating ellipse C - gold */}
      <div
        className="absolute animate-float-c will-change-transform"
        style={{
          width: 160,
          height: 160,
          top: '30%',
          left: '40%',
          borderRadius: '50%',
          background: 'rgba(255, 213, 79, 0.06)',
          filter: 'blur(80px)',
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  );
}
