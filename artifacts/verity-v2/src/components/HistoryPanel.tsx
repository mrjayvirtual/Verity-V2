import { motion } from "framer-motion";
import { format } from "date-fns";
import { Trash2, History, AlertCircle } from "lucide-react";
import { Scan, ScanStats } from "@workspace/api-client-react";
import { Button } from "./ui/button";
import { getRiskColor, getTrustColor } from "@/lib/colors";
import { Badge } from "./ui/badge";

interface HistoryPanelProps {
  scans?: Scan[];
  stats?: ScanStats;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export function HistoryPanel({ scans, stats, onSelect, onDelete, isLoading }: HistoryPanelProps) {
  if (isLoading) {
    return <div className="p-6 text-center text-white/40 font-mono text-sm animate-pulse">Loading history...</div>;
  }

  if (!scans || scans.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center">
        <History className="w-12 h-12 text-white/10 mb-4" />
        <p className="text-white/50 text-sm">No analysis history yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-white/5">
          <div className="glass p-4 rounded-xl">
            <p className="text-xs text-white/40 uppercase font-mono mb-1">Total Scans</p>
            <p className="text-2xl font-semibold text-white">{stats.totalScans}</p>
          </div>
          <div className="glass p-4 rounded-xl">
            <p className="text-xs text-white/40 uppercase font-mono mb-1">Avg Trust</p>
            <p className="text-2xl font-semibold" style={{ color: getTrustColor(stats.avgOverallScore) }}>
              {Math.round(stats.avgOverallScore)}
            </p>
          </div>
          <div className="glass p-4 rounded-xl">
            <p className="text-xs text-white/40 uppercase font-mono mb-1">High Risk</p>
            <p className="text-2xl font-semibold text-red-400">{stats.highRiskCount + stats.criticalRiskCount}</p>
          </div>
          <div className="glass p-4 rounded-xl">
            <p className="text-xs text-white/40 uppercase font-mono mb-1">Low Risk</p>
            <p className="text-2xl font-semibold text-emerald-400">{stats.lowRiskCount}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {scans.map((scan, i) => {
          const riskColor = getRiskColor(scan.result.riskLevel);
          const trustColor = getTrustColor(scan.result.scores.overallTrustSignal);
          
          return (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative glass p-4 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-between cursor-pointer"
              onClick={() => onSelect(scan.id)}
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-3 mb-1">
                  <Badge variant="outline" className="border-white/10" style={{ color: riskColor, borderColor: `${riskColor}40` }}>
                    {scan.result.riskLevel.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-white/40 font-mono">
                    {format(new Date(scan.createdAt), 'MMM d, yyyy • HH:mm')}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-white/90 truncate">
                  {scan.title || scan.inputText.substring(0, 80) + '...'}
                </h4>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-white/40 font-mono mb-0.5">TRUST</span>
                  <span className="font-semibold font-mono text-lg" style={{ color: trustColor }}>
                    {scan.result.scores.overallTrustSignal}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 transition-all z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm("Delete this scan?")) onDelete(scan.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
