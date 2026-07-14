import { motion } from "framer-motion";

export function BeaconLight() {
  return (
    <div className="relative w-full h-px overflow-hidden">
      {/* Static base line */}
      <div className="absolute inset-0 bg-white/5" />

      {/* Primary beam — bright indigo sweep */}
      <motion.div
        className="absolute top-0 h-px"
        style={{
          width: "280px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0) 10%, rgba(99,102,241,0.9) 40%, rgba(139,92,246,1) 50%, rgba(99,102,241,0.9) 60%, rgba(99,102,241,0) 90%, transparent 100%)",
          filter: "blur(0.5px)",
        }}
        initial={{ x: "-280px" }}
        animate={{ x: "100vw" }}
        transition={{
          duration: 4,
          ease: "linear",
          repeat: Infinity,
          repeatDelay: 3,
        }}
      />

      {/* Glow layer — softer, wider */}
      <motion.div
        className="absolute -top-[2px] h-[5px]"
        style={{
          width: "400px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0) 20%, rgba(99,102,241,0.15) 50%, rgba(99,102,241,0) 80%, transparent 100%)",
          filter: "blur(4px)",
        }}
        initial={{ x: "-400px" }}
        animate={{ x: "100vw" }}
        transition={{
          duration: 4,
          ease: "linear",
          repeat: Infinity,
          repeatDelay: 3,
        }}
      />

      {/* Secondary beam — amber, offset timing */}
      <motion.div
        className="absolute top-0 h-px"
        style={{
          width: "180px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0) 15%, rgba(245,158,11,0.6) 50%, rgba(245,158,11,0) 85%, transparent 100%)",
        }}
        initial={{ x: "-180px" }}
        animate={{ x: "100vw" }}
        transition={{
          duration: 4,
          ease: "linear",
          repeat: Infinity,
          repeatDelay: 3,
          delay: 1.5,
        }}
      />
    </div>
  );
}
