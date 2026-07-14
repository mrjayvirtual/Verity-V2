import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LiveReadabilityProps {
  text: string;
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  const vowels = word.match(/[aeiouy]+/g);
  const count = vowels ? vowels.length : 1;
  // Subtract silent e
  const silentE = word.endsWith("e") && !word.endsWith("le") ? 1 : 0;
  return Math.max(1, count - silentE);
}

function computeReadability(text: string) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  
  if (words.length < 5) return null;

  const numWords = words.length;
  const numSentences = Math.max(1, sentences.length);
  const numSyllables = words.reduce((acc, w) => acc + countSyllables(w), 0);

  const avgSentenceLen = numWords / numSentences;
  const avgSyllablesPerWord = numSyllables / numWords;

  // Flesch Reading Ease (0-100, higher = easier)
  const fleschRaw = 206.835 - 1.015 * avgSentenceLen - 84.6 * avgSyllablesPerWord;
  const flesch = Math.max(0, Math.min(100, Math.round(fleschRaw)));

  const grade =
    flesch >= 90 ? { label: "Very Easy", color: "#34d399" } :
    flesch >= 70 ? { label: "Easy", color: "#60a5fa" } :
    flesch >= 50 ? { label: "Standard", color: "#818cf8" } :
    flesch >= 30 ? { label: "Difficult", color: "#fbbf24" } :
                   { label: "Complex", color: "#f87171" };

  return { score: flesch, grade, avgSentenceLen: Math.round(avgSentenceLen * 10) / 10, avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10 };
}

export function LiveReadability({ text }: LiveReadabilityProps) {
  const result = useMemo(() => computeReadability(text), [text]);

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="px-1 pt-2 pb-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                Live Readability
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-mono font-semibold uppercase tracking-wider"
                  style={{ color: result.grade.color }}
                >
                  {result.grade.label}
                </span>
                <span className="text-[10px] font-mono text-white/40">
                  {result.score}/100
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: result.grade.color }}
                animate={{ width: `${result.score}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            {/* Sub-stats */}
            <div className="flex gap-4 mt-1.5">
              <span className="text-[9px] font-mono text-white/25">
                avg sentence: {result.avgSentenceLen} words
              </span>
              <span className="text-[9px] font-mono text-white/25">
                avg syllables/word: {result.avgSyllablesPerWord}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
