import { useState } from "react";
import { useListWords, useGetStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronDown, ChevronRight } from "lucide-react";

export default function Buckets() {
  const [expanded, setExpanded] = useState<"known" | "unknown" | null>(null);
  const { data: stats } = useGetStats();
  const { data: knownWords, isLoading: loadingKnown } = useListWords({ status: "known" });
  const { data: unknownWords, isLoading: loadingUnknown } = useListWords({ status: "unknown" });

  const toggle = (bucket: "known" | "unknown") =>
    setExpanded((prev) => (prev === bucket ? null : bucket));

  return (
    <div className="flex flex-col min-h-full pb-28 px-5">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        className="pt-14 pb-8"
      >
        <h1 className="text-[42px] font-extrabold tracking-tight leading-none text-white">My Words</h1>
        <p className="text-white/35 text-sm mt-1.5">
          {stats?.totalWords ?? "…"} words in your library
        </p>
      </motion.header>

      <div className="flex flex-col gap-4">
        {/* Known Words */}
        <BucketPanel
          id="known"
          expanded={expanded === "known"}
          onToggle={() => toggle("known")}
          icon={<CheckCircle2 size={22} />}
          label="Known Words"
          count={stats?.knownWords ?? 0}
          color="hsl(152 70% 58%)"
          glow="hsl(152 70% 45% / 0.22)"
          borderColor="rgba(52,211,153,0.15)"
          borderHover="rgba(52,211,153,0.3)"
          words={knownWords}
          isLoading={loadingKnown}
          delay={0.1}
          emptyText="No known words yet — start swiping!"
        />

        {/* Unknown Words */}
        <BucketPanel
          id="unknown"
          expanded={expanded === "unknown"}
          onToggle={() => toggle("unknown")}
          icon={<XCircle size={22} />}
          label="Learning"
          count={stats?.unknownWords ?? 0}
          color="hsl(0 80% 65%)"
          glow="hsl(0 80% 50% / 0.2)"
          borderColor="rgba(248,113,113,0.15)"
          borderHover="rgba(248,113,113,0.3)"
          words={unknownWords}
          isLoading={loadingUnknown}
          delay={0.2}
          emptyText="No words here — swipe left on words you're learning!"
        />
      </div>
    </div>
  );
}

function BucketPanel({
  id, expanded, onToggle, icon, label, count,
  color, glow, borderColor, borderHover,
  words, isLoading, delay, emptyText,
}: {
  id: string;
  expanded: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
  glow: string;
  borderColor: string;
  borderHover: string;
  words?: { id: number; word: string; meaning: string; partOfSpeech: string; status: string | null }[];
  isLoading: boolean;
  delay: number;
  emptyText: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 360, damping: 28, delay }}
      layout
    >
      <motion.div
        layout
        className="glass rounded-3xl overflow-hidden"
        style={{ border: `1px solid ${expanded ? borderHover : borderColor}`, transition: "border-color 0.3s ease" }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Header row */}
        <motion.button
          layout
          onClick={onToggle}
          className="w-full flex items-center gap-4 p-5 text-left relative overflow-hidden"
        >
          {/* Glow blob */}
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
            style={{ background: glow }} />

          {/* Icon */}
          <motion.div
            animate={{ rotate: expanded ? 5 : 0, scale: expanded ? 1.05 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative z-10"
            style={{ background: `${color.replace("hsl", "hsla").replace(")", " / 0.12)")}`, color }}
          >
            {icon}
          </motion.div>

          {/* Text */}
          <div className="flex-1 relative z-10">
            <div className="text-lg font-bold text-white">{label}</div>
            <div className="text-xs text-white/40 mt-0.5 font-medium">{count} words</div>
          </div>

          {/* Count badge */}
          <div className="text-3xl font-extrabold tabular-nums relative z-10" style={{ color }}>
            {count}
          </div>

          {/* Chevron */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="relative z-10 ml-1"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <ChevronDown size={18} />
          </motion.div>
        </motion.button>

        {/* Expanded word list */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="list"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ overflow: "hidden" }}
            >
              <div className="h-px mx-5" style={{ background: "rgba(255,255,255,0.06)" }} />

              {isLoading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 rounded-xl animate-pulse"
                      style={{ background: "rgba(255,255,255,0.04)" }} />
                  ))}
                </div>
              ) : !words?.length ? (
                <div className="px-5 py-6 text-center text-white/35 text-sm">{emptyText}</div>
              ) : (
                <motion.div
                  className="p-3 space-y-1.5 max-h-[320px] overflow-y-auto"
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035 } } }}
                >
                  {words.map((word) => (
                    <motion.div
                      key={word.id}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
                      }}
                    >
                      <Link href={`/words/${word.id}`}>
                        <motion.div
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer group transition-all"
                          style={{ background: "rgba(255,255,255,0.03)" }}
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-[15px] text-white/85 group-hover:text-white transition-colors">
                              {word.word}
                            </span>
                            <span className="text-xs text-white/30 ml-2 capitalize">{word.partOfSpeech}</span>
                          </div>
                          <p className="text-xs text-white/30 truncate max-w-[120px] hidden sm:block">
                            {word.meaning}
                          </p>
                          <ChevronRight size={13} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
