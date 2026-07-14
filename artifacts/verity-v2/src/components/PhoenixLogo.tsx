interface PhoenixLogoProps {
  className?: string;
  dim?: boolean;
}

export function PhoenixLogo({ className, dim = false }: PhoenixLogoProps) {
  const id = `verity-logo-gradient-${Math.random().toString(36).slice(2, 7)}`;
  
  if (dim) {
    // Footer variant — monochrome
    return (
      <svg
        className={className}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" opacity="0.3" />
        <path
          d="M28 50 L42 65 L72 35"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.3"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="30%" stopColor="#818cf8" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="78%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="40"
        stroke={`url(#${id})`}
        strokeWidth="8"
        fill="none"
      />
      <path
        d="M28 50 L42 65 L72 35"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
