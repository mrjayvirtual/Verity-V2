import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, ClipboardPaste, CornerDownLeft } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { LiveReadability } from "./LiveReadability";

interface InputSectionProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

export function InputSection({ onAnalyze, isLoading }: InputSectionProps) {
  const [text, setText] = useState("");
  const [isPasted, setIsPasted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = text.length;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 400)}px`;
    }
  }, [text]);

  const handlePaste = () => {
    setIsPasted(true);
    setTimeout(() => setIsPasted(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (text.trim().length >= 20 && !isLoading) {
        onAnalyze(text);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="relative group">
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500 ${isPasted ? '!opacity-100 from-emerald-500/30 to-teal-500/30' : ''}`} />
        
        <div className="relative glass-panel rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs font-mono text-white/50">
              <Scan className="w-3.5 h-3.5" />
              <span>DATA INGESTION</span>
            </div>
            <div className="flex gap-4 text-xs font-mono text-white/40">
              <span>{wordCount} WORDS</span>
              <span>{charCount} CHARS</span>
            </div>
          </div>
          
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder="Paste any text to analyze its reasoning quality, evidence signals, and communication reliability..."
            className="min-h-[160px] border-0 focus-visible:ring-0 rounded-none bg-transparent text-lg placeholder:text-white/20 p-6 font-serif resize-none leading-relaxed"
            disabled={isLoading}
          />
          
          {/* Live readability meter */}
          <div className="px-4 pb-1 border-t border-white/5 bg-black/10">
            <LiveReadability text={text} />
          </div>

          <div className="p-4 bg-black/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/30">
              <AnimatePresence>
                {isPasted && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1 text-emerald-400"
                  >
                    <ClipboardPaste className="w-3 h-3" />
                    <span>Clipboard text detected</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1 text-xs text-white/30 font-mono">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10">⌘</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10">Enter</kbd>
                <span className="ml-1">to submit</span>
              </div>
              <Button 
                onClick={() => onAnalyze(text)} 
                disabled={text.trim().length < 20 || isLoading}
                className="gap-2 font-mono tracking-tight group"
              >
                {isLoading ? "ANALYZING..." : "ANALYZE"}
                {!isLoading && <CornerDownLeft className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-center text-xs text-white/40 max-w-lg mx-auto">
        <span className="font-semibold text-white/60">Scope Note:</span> Verity analyzes communication quality and reasoning patterns — not factual truth. Always independently verify claims.
      </p>
    </div>
  );
}
