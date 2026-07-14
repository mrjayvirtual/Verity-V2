import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const STEPS = [
  "Initializing cognitive matrix...",
  "Scanning lexical structures...",
  "Analyzing reasoning patterns...",
  "Calibrating confidence signals...",
  "Evaluating evidence strength...",
  "Synthesizing trust parameters...",
  "Generating intelligence report..."
];

export function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-32 h-32 mb-8">
        <motion.div 
          className="absolute inset-0 border-2 border-indigo-500/20 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute inset-2 border-2 border-indigo-500/40 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <div className="absolute inset-4 bg-indigo-500/10 rounded-full backdrop-blur-sm border border-indigo-500/30 flex items-center justify-center overflow-hidden">
          <motion.div 
            className="w-full h-1 bg-indigo-500/50 absolute"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <div className="w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]" />
        </div>
      </div>

      <div className="h-6 overflow-hidden flex items-center justify-center relative w-full max-w-md text-center">
        <motion.div
          key={currentStep}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="absolute text-sm font-mono tracking-widest text-indigo-300 uppercase"
        >
          {STEPS[currentStep]}
        </motion.div>
      </div>
      
      <div className="w-64 h-1 bg-white/5 rounded-full mt-6 overflow-hidden">
        <motion.div 
          className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
}
