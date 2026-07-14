import { motion } from "framer-motion";
import { Download, Save, Copy, FileText, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { AnalysisResult } from "@workspace/api-client-react";
import { Gauge } from "./Gauge";
import { ScoreCard } from "./ScoreCard";
import { FlagCard } from "./FlagCard";
import { RadarChart } from "./RadarChart";
import { TypewriterText } from "./TypewriterText";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { getRiskColor } from "@/lib/colors";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  result: AnalysisResult;
  onSave?: () => void;
  isSaving?: boolean;
}

export function Dashboard({ result, onSave, isSaving }: DashboardProps) {
  const { toast } = useToast();
  
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    toast({ title: "Copied JSON to clipboard", duration: 2000 });
  };
  
  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "verity-report.json");
    dlAnchorElem.click();
  };

  const riskColor = getRiskColor(result.riskLevel);
  const RiskIcon = result.riskLevel === 'critical' || result.riskLevel === 'high' ? ShieldAlert : 
                   result.riskLevel === 'medium' ? AlertTriangle : CheckCircle2;

  // Sort flags: high -> medium -> low
  const sortedFlags = [...result.flags].sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12">
      
      {/* HEADER ACTIONS & DISCLAIMER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex-1 flex items-start gap-3">
          <div className="mt-1">
            <AlertTriangle className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
            <span className="font-semibold text-white">Analysis Disclaimer: </span>
            {result.analysisDisclaimer}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onSave && (
            <Button variant="outline" size="sm" onClick={onSave} disabled={isSaving} className="gap-2 text-xs">
              <Save className="w-3.5 h-3.5" />
              {isSaving ? "SAVING..." : "SAVE"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 text-xs">
            <Copy className="w-3.5 h-3.5" />
            COPY
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2 text-xs">
            <Download className="w-3.5 h-3.5" />
            JSON
          </Button>
        </div>
      </div>

      {/* TOP SECTION: GAUGE & SUMMARY */}
      <div className="grid md:grid-cols-[auto_1fr] gap-12 items-center">
        <div className="flex justify-center md:justify-start">
          <Gauge value={result.scores.overallTrustSignal} size={240} label="OVERALL TRUST SIGNAL" />
        </div>
        
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <Badge 
              variant="outline" 
              className="text-sm py-1.5 px-4 font-mono tracking-wider flex items-center gap-2"
              style={{ color: riskColor, borderColor: `${riskColor}40`, backgroundColor: `${riskColor}10` }}
            >
              <RiskIcon className="w-4 h-4" />
              {result.riskLevel.toUpperCase()} RISK
            </Badge>
            
            <div className="flex items-center gap-3 text-xs font-mono text-white/40">
              <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md">
                <FileText className="w-3.5 h-3.5" />
                <span>{result.wordCount} WORDS</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md">
                <span>READABILITY: {result.readabilityScore}/100</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 rounded-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
            <h3 className="text-sm font-mono text-indigo-400 uppercase tracking-widest mb-3">Intelligence Summary</h3>
            <p className="text-lg text-white/90 leading-relaxed">
              <TypewriterText text={result.summary} speed={14} />
            </p>
          </motion.div>
        </div>
      </div>

      {/* SCORE GRID */}
      <div>
        <h3 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-4 h-[1px] bg-white/20"></span>
          Dimension Analysis
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <ScoreCard 
            title="Communication Reliability" 
            score={result.scores.communicationReliability} 
            description="How clearly, consistently, and un-deceptively the author communicates."
            delay={0.1}
          />
          <ScoreCard 
            title="Reasoning Quality" 
            score={result.scores.reasoningQuality} 
            description="Logical coherence and absence of fallacies."
            delay={0.2}
          />
          <ScoreCard 
            title="Evidence Strength" 
            score={result.scores.evidenceStrength} 
            description="Quality, specificity, and quantity of evidence."
            delay={0.3}
          />
          <ScoreCard 
            title="Confidence Calibration" 
            score={result.scores.confidenceCalibration} 
            description="Does the expressed confidence match the evidence?"
            delay={0.4}
          />
          <ScoreCard 
            title="Source Quality" 
            score={result.scores.sourceQuality} 
            description="Credibility and verifiability of cited sources."
            delay={0.5}
          />
          <ScoreCard 
            title="Transparency" 
            score={result.scores.transparency} 
            description="Acknowledgment of limitations, assumptions, or biases."
            delay={0.6}
          />
        </div>
      </div>

      {/* RADAR CHART */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="glass-panel rounded-2xl p-8"
      >
        <RadarChart scores={result.scores} />
      </motion.div>

      {/* BOTTOM SECTION: STYLE & FLAGS */}
      <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
        
        {/* Writing Style */}
        <div>
          <h3 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-4 h-[1px] bg-white/20"></span>
            Linguistic Profile
          </h3>
          <div className="glass p-6 rounded-2xl space-y-6">
            {result.writingStyle.map((style, i) => (
              <motion.div 
                key={style.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
              >
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-white/90">{style.label}</span>
                  <span className="font-mono text-white/50">{style.probability}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    className="h-full bg-indigo-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${style.probability}%` }}
                    transition={{ duration: 1, delay: 0.6 + (i * 0.1) }}
                  />
                </div>
                <p className="text-xs text-white/40 leading-snug">{style.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Claim Flags */}
        <div>
          <h3 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-4 h-[1px] bg-white/20"></span>
            Signal Flags ({result.flags.length})
          </h3>
          {result.flags.length > 0 ? (
            <div className="space-y-3">
              {sortedFlags.map((flag, i) => (
                <FlagCard key={`${flag.type}-${i}`} flag={flag} index={i} />
              ))}
            </div>
          ) : (
            <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mb-4" />
              <p className="text-emerald-400 font-medium">No significant risk flags detected.</p>
              <p className="text-white/40 text-sm mt-1">The text communicates with high reliability.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
