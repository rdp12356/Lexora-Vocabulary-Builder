import { useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
  type PanInfo,
} from "framer-motion";
import {
  useGetSwipeQueue,
  useRecordSwipe,
  getGetStatsQueryKey,
  getGetDailyLessonQueryKey,
  getGetSwipeQueueQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { X, Check, ArrowLeft, RotateCcw, Sparkles } from "lucide-react";

const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 400;

export default function Swipe() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: queue, isLoading } = useGetSwipeQueue();
  const recordSwipe = useRecordSwipe();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [swipeCount, setSwipeCount] = useState({ known: 0, unknown: 0 });

  /* ── Motion values (must be at top, before any early return) ── */
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 0, 260], [-16, 0, 16]);
  const knownOpacity = useTransform(x, [30, 110], [0, 1]);
  const unknownOpacity = useTransform(x, [-110, -30], [1, 0]);
  const nextCardScale = useTransform(x, [-200, 0, 200], [0.97, 0.92, 0.97]);
  const nextCardY = useTransform(x, [-200, 0, 200], [4, 16, 4]);
  const bgGreenOpacity = useTransform(x, [40, 200], [0, 0.07]);
  const bgRedOpacity = useTransform(x, [-200, -40], [0.07, 0]);

  const words = queue || [];
  const currentWord = words[currentIndex];
  const nextWord = words[currentIndex + 1];

  const swipeCard = (direction: "left" | "right") => {
    if (isAnimating || !currentWord) return;
    setIsAnimating(true);
    const status = direction === "right" ? "known" : "unknown";
    recordSwipe.mutate({ wordId: currentWord.id, data: { status } });
    animate(x, direction === "right" ? 750 : -750, { duration: 0.38, ease: [0.32, 0, 0.67, 0] });
    setTimeout(() => {
      x.set(0);
      setIsAnimating(false);
      setSwipeCount((prev) => ({
        known: status === "known" ? prev.known + 1 : prev.known,
        unknown: status === "unknown" ? prev.unknown + 1 : prev.unknown,
      }));
      if (currentIndex >= words.length - 1) {
        setIsFinished(true);
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDailyLessonQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSwipeQueueQueryKey() });
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 400);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isAnimating) return;
    const { offset, velocity } = info;
    if (offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) swipeCard("right");
    else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) swipeCard("left");
    else animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
  };

  const progress = words.length > 0 ? currentIndex / words.length : 0;

  /* ── Empty / loading states ── */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-white/40 text-sm">Loading session…</p>
      </div>
    );
  }

  if (!words.length) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 glass">
          <Sparkles size={36} className="text-primary/90" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white">All caught up!</h2>
        <p className="text-white/40 mb-8 text-sm">Queue is empty. Come back later.</p>
        <button onClick={() => setLocation("/")}
          className="w-full h-13 rounded-2xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, hsl(258 90% 62%), hsl(290 80% 65%))", boxShadow: "0 8px 32px hsl(258 90% 55% / 0.4)" }}>
          Back to Home
        </button>
      </motion.div>
    );
  }

  if (isFinished) {
    const total = swipeCount.known + swipeCount.unknown;
    const pct = total > 0 ? Math.round((swipeCount.known / total) * 100) : 0;
    return (
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex flex-col items-center justify-center h-full p-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 18 }}
          className="w-28 h-28 rounded-full flex items-center justify-center mb-8 glass-strong">
          <Check size={50} className="text-primary/90" />
        </motion.div>
        <h2 className="text-3xl font-extrabold mb-1 text-white">Session Done</h2>
        <p className="text-white/40 mb-8 text-sm">{pct}% accuracy · {total} cards reviewed</p>
        <div className="grid grid-cols-2 gap-3 w-full mb-8">
          <div className="glass rounded-2xl p-5 text-center">
            <div className="text-4xl font-extrabold" style={{ color: "hsl(152 70% 58%)" }}>{swipeCount.known}</div>
            <div className="text-xs text-white/35 mt-1.5 font-medium uppercase tracking-wide">Known</div>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <div className="text-4xl font-extrabold" style={{ color: "hsl(0 80% 65%)" }}>{swipeCount.unknown}</div>
            <div className="text-xs text-white/35 mt-1.5 font-medium uppercase tracking-wide">Learning</div>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <motion.button whileTap={{ scale: 0.975 }}
            className="w-full h-14 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, hsl(258 90% 62%), hsl(290 80% 65%))", boxShadow: "0 8px 32px hsl(258 90% 55% / 0.4)" }}
            onClick={() => {
              setCurrentIndex(0); setIsFinished(false); setSwipeCount({ known: 0, unknown: 0 });
              queryClient.invalidateQueries({ queryKey: getGetSwipeQueueQueryKey() });
            }}>
            <RotateCcw size={16} /> Practice Again
          </motion.button>
          <motion.button whileTap={{ scale: 0.975 }}
            className="w-full h-12 rounded-2xl font-semibold text-white/50 glass"
            onClick={() => setLocation("/")}>
            Back to Home
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden select-none relative">
      {/* Background color tints */}
      <motion.div className="absolute inset-0 bg-emerald-500 pointer-events-none z-0" style={{ opacity: bgGreenOpacity }} />
      <motion.div className="absolute inset-0 bg-red-500 pointer-events-none z-0" style={{ opacity: bgRedOpacity }} />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-20" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full"
          style={{ background: "linear-gradient(90deg, hsl(258 90% 65%), hsl(290 80% 70%))" }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 pt-12 pb-4 z-10">
        <motion.button whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full flex items-center justify-center glass text-white/60 hover:text-white transition-colors"
          onClick={() => setLocation("/")}>
          <ArrowLeft size={18} />
        </motion.button>
        <span className="text-sm font-semibold tabular-nums text-white/40">
          {currentIndex + 1} <span className="text-white/20">/</span> {words.length}
        </span>
        <div className="w-10" />
      </div>

      {/* Cards */}
      <div className="flex-1 flex items-center justify-center px-6 pb-4 relative z-10">
        {/* Next card */}
        <AnimatePresence>
          {nextWord && (
            <motion.div
              key={`bg-${nextWord.id}`}
              className="absolute w-full max-w-[310px] rounded-3xl glass"
              style={{ aspectRatio: "3/4", scale: nextCardScale, y: nextCardY }}
            />
          )}
        </AnimatePresence>

        {/* Active card */}
        <AnimatePresence mode="wait">
          {currentWord && (
            <motion.div
              key={`card-${currentWord.id}`}
              className="absolute w-full max-w-[310px] cursor-grab active:cursor-grabbing z-10"
              style={{ aspectRatio: "3/4", x, rotate }}
              drag="x"
              dragElastic={0.12}
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={handleDragEnd}
              initial={{ scale: 0.88, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
            >
              {/* Known pill */}
              <motion.div
                className="absolute top-5 right-5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest text-white"
                style={{ opacity: knownOpacity, background: "rgba(52,211,153,0.85)", boxShadow: "0 4px 16px rgba(52,211,153,0.5)" }}
              >
                <Check size={11} strokeWidth={3} /> Know it
              </motion.div>

              {/* Unknown pill */}
              <motion.div
                className="absolute top-5 left-5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest text-white"
                style={{ opacity: unknownOpacity, background: "rgba(248,113,113,0.85)", boxShadow: "0 4px 16px rgba(248,113,113,0.5)" }}
              >
                <X size={11} strokeWidth={3} /> Learning
              </motion.div>

              {/* Card face — liquid glass */}
              <div className="w-full h-full glass-strong rounded-3xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                {/* Specular highlight at top */}
                <div className="absolute top-0 left-[15%] right-[15%] h-px"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }} />
                {/* Radial glow */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 5%, hsl(258 90% 65% / 0.18), transparent 65%)" }} />

                <span className="relative z-10 text-xs font-bold uppercase tracking-[0.22em] mb-8 px-3.5 py-1.5 rounded-full"
                  style={{ background: "rgba(147,100,255,0.18)", color: "hsl(258 90% 78%)", border: "1px solid rgba(147,100,255,0.25)" }}>
                  {currentWord.partOfSpeech}
                </span>
                <h2 className="relative z-10 text-[54px] font-extrabold tracking-tight leading-none text-white text-center break-words">
                  {currentWord.word}
                </h2>
                <p className="relative z-10 text-xs uppercase tracking-[0.18em] mt-10 font-medium text-white/25">
                  Swipe to classify
                </p>

                {/* Bottom specular */}
                <div className="absolute bottom-0 left-[20%] right-[20%] h-px"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-10 pb-12 z-10 relative">
        <motion.button
          whileTap={{ scale: 0.86 }}
          onClick={() => swipeCard("left")}
          disabled={isAnimating}
          className="w-[62px] h-[62px] rounded-full flex flex-col items-center justify-center gap-1 glass transition-all"
          style={{ color: "hsl(0 80% 65%)", border: "1px solid rgba(248,113,113,0.25)" }}
        >
          <X size={24} strokeWidth={2.2} />
          <span className="text-[9px] font-bold uppercase tracking-wide opacity-70">Skip</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.86 }}
          onClick={() => swipeCard("right")}
          disabled={isAnimating}
          className="w-[62px] h-[62px] rounded-full flex flex-col items-center justify-center gap-1 glass transition-all"
          style={{ color: "hsl(152 70% 58%)", border: "1px solid rgba(52,211,153,0.25)" }}
        >
          <Check size={24} strokeWidth={2.2} />
          <span className="text-[9px] font-bold uppercase tracking-wide opacity-70">Know</span>
        </motion.button>
      </div>
    </div>
  );
}
