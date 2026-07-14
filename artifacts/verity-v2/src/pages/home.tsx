import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyzeClaim, useCreateScan, useListScans, useDeleteScan, useGetScanStats, useGetScan, AnalysisResult } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListScansQueryKey, getGetScanStatsQueryKey } from "@workspace/api-client-react";

import { PhoenixLogo } from "@/components/PhoenixLogo";
import { InputSection } from "@/components/InputSection";
import { LoadingState } from "@/components/LoadingState";
import { Dashboard } from "@/components/Dashboard";
import { HistoryPanel } from "@/components/HistoryPanel";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { History, X } from "lucide-react";

export default function Home() {
  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);
  const [activeText, setActiveText] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: scans, isLoading: isLoadingScans } = useListScans({ limit: 20 });
  const { data: stats } = useGetScanStats();
  
  // Mutations
  const analyzeMutation = useAnalyzeClaim();
  const createScanMutation = useCreateScan();
  const deleteScanMutation = useDeleteScan();

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    setActiveText(text);
    setActiveResult(null);
    setIsHistoryOpen(false);
    
    try {
      const result = await analyzeMutation.mutateAsync({ data: { text } });
      setActiveResult(result);
      
      // Auto-save the scan
      try {
        await createScanMutation.mutateAsync({
          data: { inputText: text, result, title: null }
        });
        queryClient.invalidateQueries({ queryKey: getListScansQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetScanStatsQueryKey() });
      } catch (saveErr) {
        console.error("Auto-save failed", saveErr);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: err?.message || "There was an error processing the text."
      });
      setIsAnalyzing(false);
    }
  };

  const handleSaveResult = async () => {
    if (!activeResult || !activeText) return;
    
    try {
      await createScanMutation.mutateAsync({
        data: { inputText: activeText, result: activeResult, title: null }
      });
      toast({ title: "Saved to History" });
      queryClient.invalidateQueries({ queryKey: getListScansQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetScanStatsQueryKey() });
    } catch (err) {
      toast({ variant: "destructive", title: "Save Failed" });
    }
  };

  const handleLoadHistory = async (id: number) => {
    const scan = scans?.find(s => s.id === id);
    if (scan) {
      setActiveResult(scan.result);
      setActiveText(scan.inputText);
      setIsHistoryOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteScan = async (id: number) => {
    try {
      await deleteScanMutation.mutateAsync({ id });
      toast({ title: "Scan deleted" });
      queryClient.invalidateQueries({ queryKey: getListScansQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetScanStatsQueryKey() });
    } catch (err) {
      toast({ variant: "destructive", title: "Delete Failed" });
    }
  };

  // Ensure loading state runs for at least min time for UX
  useEffect(() => {
    if (activeResult && isAnalyzing) {
      const timer = setTimeout(() => {
        setIsAnalyzing(false);
      }, 3000); // 3 seconds min loading UX
      return () => clearTimeout(timer);
    }
  }, [activeResult, isAnalyzing]);

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-indigo-500/30">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 bg-[#0a0e1a] -z-20" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.05),transparent_50%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.05),transparent_50%)] -z-10" />
      
      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none -z-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-white/5 bg-[#0a0e1a]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ opacity: [0.7, 1, 0.7] }} 
              transition={{ duration: 3, repeat: Infinity }}
            >
              <PhoenixLogo className="w-6 h-6 text-indigo-400" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold tracking-widest text-white leading-none">VERITY</h1>
              <p className="text-[10px] uppercase font-mono tracking-[0.2em] text-indigo-400/80 leading-none mt-1">AI Claim Intelligence</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/60 hover:text-white gap-2 font-mono text-xs"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          >
            {isHistoryOpen ? <X className="w-4 h-4" /> : <History className="w-4 h-4" />}
            {isHistoryOpen ? "CLOSE" : "HISTORY"}
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 relative">
        <AnimatePresence mode="wait">
          {isHistoryOpen ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Analysis Archives</h2>
                  <p className="text-white/40">Review past intelligence reports.</p>
                </div>
              </div>
              <HistoryPanel 
                scans={scans} 
                stats={stats} 
                onSelect={handleLoadHistory}
                onDelete={handleDeleteScan}
                isLoading={isLoadingScans}
              />
            </motion.div>
          ) : isAnalyzing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingState />
            </motion.div>
          ) : activeResult ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setActiveResult(null)} className="text-white/40 hover:text-white">
                  ← New Analysis
                </Button>
              </div>
              <Dashboard 
                result={activeResult} 
                onSave={handleSaveResult}
                isSaving={createScanMutation.isPending}
              />
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
                  Signal through the noise.
                </h2>
                <p className="text-lg text-white/50 max-w-2xl mx-auto font-serif">
                  A high-resolution intelligence engine for evaluating reasoning quality, 
                  evidence patterns, and communication reliability in written text.
                </p>
              </div>
              <InputSection 
                onAnalyze={handleAnalyze} 
                isLoading={analyzeMutation.isPending} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PhoenixLogo className="w-5 h-5 text-white/20" />
            <p className="text-xs text-white/30 font-mono">
              VERITY INTELLIGENCE PLATFORM v2.0
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-xs text-white/40">
            <div className="flex flex-col items-end">
              <span className="text-white/60">Built by MRJAYVIRTUAL</span>
              <span className="italic">"Creativity Meets Technology"</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex gap-4">
              <a href="mailto:mrjayvirtual@proton.me" className="hover:text-indigo-400 transition-colors">Contact</a>
              <a href="https://www.linkedin.com/in/joshua-ikpendu" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">LinkedIn</a>
              <a href="https://github.com/mrjayvirtual" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
