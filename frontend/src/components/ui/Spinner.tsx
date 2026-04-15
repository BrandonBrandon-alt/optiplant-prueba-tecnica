// Spinner.tsx – Componente de carga reutilizable

interface SpinnerProps {
  size?: number;
  fullPage?: boolean;
}

export default function Spinner({ size = 22, fullPage = false }: SpinnerProps) {
  const el = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--brand-500)"
      strokeWidth="2.5"
      style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}
    >
      <path d="M21 12a9 9 0 1 1-6.22-8.56" strokeLinecap="round" />
    </svg>
  );

  if (fullPage) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60dvh",
          width: "100%",
        }}
      >
        {el}
      </div>
    );
  }

  return el;
}
