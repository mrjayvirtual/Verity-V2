import { motion } from "framer-motion";
import { getTrustColor } from "@/lib/colors";
import { AnimatedNumber } from "./AnimatedNumber";

export function Gauge({ 
  value, 
  size = 180, 
  strokeWidth = 12, 
  label 
}: { 
  value: number; 
  size?: number; 
  strokeWidth?: number; 
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const color = getTrustColor(value);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-2xl">
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={strokeWidth} 
          className="text-white/5" 
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white tracking-tighter" style={{ textShadow: `0 0 20px ${color}40` }}>
          <AnimatedNumber value={value}/>
        </span>
        {label && <span className="text-xs text-white/50 uppercase tracking-widest mt-1 font-mono">{label}</span>}
      </div>
    </div>
  );
}
