import { motion } from "framer-motion";

interface RadarChartProps {
  scores: {
    communicationReliability: number;
    reasoningQuality: number;
    evidenceStrength: number;
    confidenceCalibration: number;
    sourceQuality: number;
    transparency: number;
  };
}

const AXES = [
  { label: "Communication", key: "communicationReliability" },
  { label: "Reasoning", key: "reasoningQuality" },
  { label: "Evidence", key: "evidenceStrength" },
  { label: "Calibration", key: "confidenceCalibration" },
  { label: "Sources", key: "sourceQuality" },
  { label: "Transparency", key: "transparency" },
] as const;

const N = AXES.length;
const CX = 160;
const CY = 160;
const R = 100; // max radius
const LABEL_R = 125; // label ring

function polarPoint(angle: number, r: number) {
  // Angle in degrees, 0 = top
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  };
}

function makePolygon(values: number[]): string {
  return values
    .map((v, i) => {
      const angle = (360 / N) * i;
      const r = (v / 100) * R;
      const { x, y } = polarPoint(angle, r);
      return `${x},${y}`;
    })
    .join(" ");
}

function makeGridPolygon(fraction: number): string {
  return Array.from({ length: N }, (_, i) => {
    const angle = (360 / N) * i;
    const { x, y } = polarPoint(angle, R * fraction);
    return `${x},${y}`;
  }).join(" ");
}

export function RadarChart({ scores }: RadarChartProps) {
  const values = AXES.map((a) => scores[a.key]);
  const dataPolygon = makePolygon(values);

  const GRID_LEVELS = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2 self-start">
        <span className="w-4 h-[1px] bg-white/20" />
        Dimension Radar
      </h3>

      <svg
        viewBox="0 0 320 320"
        className="w-full max-w-[340px]"
        style={{ filter: "drop-shadow(0 0 24px rgba(99,102,241,0.15))" }}
      >
        <defs>
          <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>

        {/* Grid polygons */}
        {GRID_LEVELS.map((frac, i) => (
          <polygon
            key={i}
            points={makeGridPolygon(frac)}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {AXES.map((_, i) => {
          const angle = (360 / N) * i;
          const tip = polarPoint(angle, R);
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={tip.x}
              y2={tip.y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon — animated */}
        <motion.polygon
          points={makePolygon(values.map(() => 0))}
          animate={{ points: dataPolygon }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          fill="url(#radarFill)"
          stroke="url(#radarStroke)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Data dots */}
        {values.map((v, i) => {
          const angle = (360 / N) * i;
          const { x, y } = polarPoint(angle, (v / 100) * R);
          return (
            <motion.circle
              key={i}
              cx={CX}
              cy={CY}
              r="3.5"
              fill="#818cf8"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
              animate={{ cx: x, cy: y }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 + i * 0.05 }}
            />
          );
        })}

        {/* Labels */}
        {AXES.map((axis, i) => {
          const angle = (360 / N) * i;
          const { x, y } = polarPoint(angle, LABEL_R);

          // Anchor based on position
          const textAnchor =
            Math.abs(x - CX) < 5 ? "middle" : x > CX ? "start" : "end";
          const dy = y < CY - 5 ? "-0.4em" : y > CY + 5 ? "1.1em" : "0.3em";
          const score = values[i];
          const scoreColor =
            score >= 80
              ? "#34d399"
              : score >= 60
              ? "#818cf8"
              : score >= 40
              ? "#fbbf24"
              : "#f87171";

          return (
            <g key={i}>
              <text
                x={x}
                y={y}
                textAnchor={textAnchor}
                dy={dy}
                className="font-mono"
                fontSize="9"
                fill="rgba(255,255,255,0.45)"
                fontFamily="JetBrains Mono, monospace"
              >
                {axis.label}
              </text>
              <text
                x={x}
                y={y}
                textAnchor={textAnchor}
                dy={parseFloat(dy) + 1.4 + "em"}
                fontSize="9"
                fill={scoreColor}
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
              >
                {score}
              </text>
            </g>
          );
        })}

        {/* Center dot */}
        <circle cx={CX} cy={CY} r="2" fill="rgba(255,255,255,0.2)" />
      </svg>
    </div>
  );
}
