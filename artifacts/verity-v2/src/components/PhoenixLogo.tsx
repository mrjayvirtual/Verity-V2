export function PhoenixLogo({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 21.5C12 21.5 3 15.5 3 8.5C3 5 12 2 12 2C12 2 21 5 21 8.5C21 15.5 12 21.5 12 21.5Z" className="opacity-50" />
      <path d="M12 21.5V11" />
      <path d="M8 8.5C8 8.5 10 11 12 11C14 11 16 8.5 16 8.5" />
      <path d="M9 5.5L12 8.5L15 5.5" />
      <circle cx="12" cy="8.5" r="0.5" fill="currentColor" />
    </svg>
  );
}
