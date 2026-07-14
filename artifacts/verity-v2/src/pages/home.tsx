import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyzeClaim, useCreateScan, useListScans, useDeleteScan, useGetScanStats, AnalysisResult } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListScansQueryKey, getGetScanStatsQueryKey } from "@workspace/api-client-react";

import { PhoenixLogo } from "@/components/PhoenixLogo";
import { InputSection } from "@/components/InputSection";
import { LoadingState } from "@/components/LoadingState";
import { Dashboard } from "@/components/Dashboard";
import { HistoryPanel } from "@/components/HistoryPanel";
import { BeaconLight } from "@/components/BeaconLight";
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

  const { data: scans, isLoading: isLoadingScans } = useListScans({ limit: 20 });
  const { data: stats } = useGetScanStats();

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

      try {
        await createScanMutation.mutateAsync({
          data: { inputText: text, result, title: null },
        });
        queryClient.invalidateQueries({ queryKey: getListScansQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetScanStatsQueryKey() });
      } catch (saveErr) {
        console.error("Auto-save failed", saveErr);
      }
    } catch (err: any) {
      // Extract the most useful message from the error
      const serverMsg =
        err?.response?.data?.error ||
        err?.data?.error ||
        err?.message ||
        "Analysis failed. Please try again.";

      const isRateLimit =
        err?.response?.status === 429 ||
        serverMsg.toLowerCase().includes("quota") ||
        serverMsg.toLowerCase().includes("rate limit");

      toast({
        variant: "destructive",
        title: isRateLimit ? "API Quota Reached" : "Analysis Failed",
        description: isRateLimit
          ? "Your Google AI free-tier limit has been hit. Wait a minute and try again, or enable billing on Google AI Studio."
          : serverMsg,
        duration: isRateLimit ? 8000 : 5000,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveResult = async () => {
    if (!activeResult || !activeText) return;
    try {
      await createScanMutation.mutateAsync({
        data: { inputText: activeText, result: activeResult, title: null },
      });
      toast({ title: "Saved to History" });
      queryClient.invalidateQueries({ queryKey: getListScansQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetScanStatsQueryKey() });
    } catch {
      toast({ variant: "destructive", title: "Save Failed" });
    }
  };

  const handleLoadHistory = (id: number) => {
    const scan = scans?.find((s) => s.id === id);
    if (scan) {
      setActiveResult(scan.result);
      setActiveText(scan.inputText);
      setIsHistoryOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDeleteScan = async (id: number) => {
    try {
      await deleteScanMutation.mutateAsync({ id });
      toast({ title: "Scan deleted" });
      queryClient.invalidateQueries({ queryKey: getListScansQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetScanStatsQueryKey() });
    } catch {
      toast({ variant: "destructive", title: "Delete Failed" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-indigo-500/30">
      {/* BACKGROUND */}
      <div className="fixed inset-0 bg-[#0a0e1a] -z-20" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.06),transparent_55%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.05),transparent_55%)] -z-10" />
      {/* Subtle grid texture */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-white/5 bg-[#0a0e1a]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <PhoenixLogo className="w-8 h-8" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold tracking-widest text-white leading-none">
                VERITY
              </h1>
              <p className="text-[10px] uppercase font-mono tracking-[0.2em] text-indigo-400/80 leading-none mt-1">
                AI Claim Intelligence
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white gap-2 font-mono text-xs"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          >
            <motion.span
              animate={{ rotate: isHistoryOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isHistoryOpen ? <X className="w-4 h-4" /> : <History className="w-4 h-4" />}
            </motion.span>
            {isHistoryOpen ? "CLOSE" : "HISTORY"}
          </Button>
        </div>
      </header>

      {/* MAIN */}
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
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                  Analysis Archives
                </h2>
                <p className="text-white/40">Review past intelligence reports.</p>
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
              <div className="mb-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveResult(null)}
                  className="text-white/40 hover:text-white"
                >
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
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              {/* Hero */}
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 border border-indigo-500/30 bg-indigo-500/10 rounded-full px-4 py-1.5 mb-6 text-xs font-mono text-indigo-300 tracking-widest"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  INTELLIGENCE ENGINE READY
                </motion.div>

                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-5 leading-tight">
                  Signal through{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                    the noise.
                  </span>
                </h2>
                <p className="text-lg text-white/45 max-w-2xl mx-auto leading-relaxed">
                  A high-resolution intelligence engine for evaluating reasoning quality,
                  evidence patterns, and communication reliability in written text.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full"
              >
                <InputSection
                  onAnalyze={handleAnalyze}
                  isLoading={analyzeMutation.isPending}
                />
              </motion.div>

              {/* Feature chips */}
              <motion.div
                className="flex flex-wrap justify-center gap-3 mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {[
                  "7 Calibrated Scores",
                  "Claim Flag Detection",
                  "Writing Style Analysis",
                  "Scan History",
                  "Live Readability",
                  "Radar Chart",
                ].map((chip) => (
                  <span
                    key={chip}
                    className="text-[10px] font-mono text-white/30 border border-white/10 rounded-full px-3 py-1 tracking-wider"
                  >
                    {chip}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* BEACON LIGHT — cinematic scanning beam above footer border */}
      <BeaconLight />

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PhoenixLogo className="w-5 h-5" dim />
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
              <a
                href="mailto:mrjayvirtual@proton.me"
                className="hover:text-indigo-400 transition-colors"
              >
                Contact
              </a>
              <a
                href="https://www.linkedin.com/in/joshua-ikpendu"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-400 transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/mrjayvirtual"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-400 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
