import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronDown, CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "./ui/badge";
import { ClaimFlag } from "@workspace/api-client-react";

export function FlagCard({ flag, index }: { flag: ClaimFlag; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'high': return { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: ShieldAlert };
      case 'medium': return { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: AlertTriangle };
      case 'low': return { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: CheckCircle2 };
      default: return { color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20', icon: AlertTriangle };
    }
  };

  const config = getSeverityConfig(flag.severity);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`rounded-xl border ${config.border} bg-white/[0.02] overflow-hidden transition-all duration-300 hover:bg-white/[0.04]`}
    >
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 flex items-start gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
      >
        <div className={`mt-0.5 p-1.5 rounded-md ${config.bg} ${config.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-white/90">{flag.type}</span>
            <Badge variant="outline" className={`text-[10px] h-5 ${config.color} ${config.border}`}>
              {flag.severity.toUpperCase()}
            </Badge>
            <span className="text-xs text-white/40 font-mono ml-auto">{flag.category}</span>
          </div>
          
          <p className="text-sm text-white/70 line-clamp-2 leading-relaxed">
            "{flag.snippet}"
          </p>
        </div>
        
        <div className="pt-2">
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-white/30" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 pl-14 space-y-4 border-t border-white/5 mt-2 text-sm">
              <div>
                <h5 className="text-xs uppercase tracking-wider text-white/40 font-mono mb-1">Full Snippet</h5>
                <p className="text-white/80 italic border-l-2 border-white/10 pl-3 py-1">"{flag.snippet}"</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs uppercase tracking-wider text-white/40 font-mono mb-1">Reasoning</h5>
                  <p className="text-white/70 leading-relaxed">{flag.reasoning}</p>
                </div>
                <div>
                  <h5 className="text-xs uppercase tracking-wider text-white/40 font-mono mb-1">Impact</h5>
                  <p className="text-white/70 leading-relaxed">{flag.impact}</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <h5 className="text-xs uppercase tracking-wider text-white/40 font-mono mb-1">Suggestion</h5>
                <p className="text-white/80">{flag.suggestion}</p>
              </div>
              
              {flag.verificationAdvice && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                  <h5 className="text-xs uppercase tracking-wider text-indigo-300 font-mono mb-1">Verification Advice</h5>
                  <p className="text-indigo-100/80">{flag.verificationAdvice}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
