import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { getTrustColor } from "@/lib/colors";
import { AnimatedNumber } from "./AnimatedNumber";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
  delay?: number;
}

export function ScoreCard({ title, score, description, delay = 0 }: ScoreCardProps) {
  const color = getTrustColor(score);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass p-4 rounded-xl relative overflow-hidden group hover:border-white/20 transition-colors"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/10 transition-colors pointer-events-none" />
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-medium text-white/80">{title}</h4>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-white/40 hover:text-white/80 transition-colors">
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{description}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div 
          className="w-2.5 h-2.5 rounded-full" 
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
      
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold font-mono tracking-tight text-white">
          <AnimatedNumber value={score} />
        </span>
        <span className="text-sm text-white/40 mb-1">/100</span>
      </div>
      
      <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
