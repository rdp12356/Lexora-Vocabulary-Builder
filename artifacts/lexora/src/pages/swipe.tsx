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
import { Button } from "@/components/ui/button";

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

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 0, 260], [-18, 0, 18]);
  const knownOpacity = useTransform(x, [30, 110], [0, 1]);
  const unknownOpacity = useTransform(x, [-110, -30], [1, 0]);
  const nextCardScale = useTransform(x, [-200, 0, 200], [0.97, 0.93, 0.97]);
  const nextCardY = useTransform(x, [-200, 0, 200], [6, 14, 6]);
  const bgGreenOpacity = useTransform(x, [40, 180], [0, 0.08]);
  const bgRedOpacity = useTransform(x, [-180, -40], [0.08, 0]);

  const words = queue || [];
  const currentWord = words[currentIndex];
  const nextWord = words[currentIndex + 1];

  const swipeCard = (direction: "left" | "right") => {
    if (isAnimating || !currentWord) return;
    setIsAnimating(true);

    const status = direction === "right" ? "known" : "unknown";
    recordSwipe.mutate({ wordId: currentWord.id, data: { status } });

    animate(x, direction === "right" ? 750 : -750, {
      duration: 0.38,
      ease: [0.32, 0, 0.67, 0],
    });

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
    if (offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) {
      swipeCard("right");
    } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) {
      swipeCard("left");
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
  };

  const progress = words.length > 0 ? currentIndex / words.length : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm">Loading session…</p>
      </div>
    );
  }

  if (!words.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full p-8 text-center"
      >
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Sparkles size={38} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">All caught up!</h2>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">Your queue is empty. Come back later.</p>
        <Button size="lg" className="w-full h-13 rounded-2xl" onClick={() => setLocation("/")}>
          Back to Home
        </Button>
      </motion.div>
    );
  }

  if (isFinished) {
    const total = swipeCount.known + swipeCount.unknown;
    const pct = total > 0 ? Math.round((swipeCount.known / total) * 100) : 0;
    return (
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center justify-center h-full p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 20 }}
          className="w-28 h-28 rounded-full flex items-center justify-center mb-8"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(280 90% 65% / 0.15))", border: "1px solid hsl(var(--primary) / 0.3)" }}
        >
          <Check size={50} className="text-primary" />
        </motion.div>
        <h2 className="text-3xl font-extrabold mb-1">Session Done</h2>
        <p className="text-muted-foreground mb-8 text-sm">You scored {pct}% on {total} words</p>

        <div className="grid grid-cols-2 gap-3 w-full mb-8">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center">
            <div className="text-4xl font-extrabold text-emerald-500">{swipeCount.known}</div>
            <div className="text-xs text-muted-foreground mt-1.5 font-medium uppercase tracking-wide">Known</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center">
            <div className="text-4xl font-extrabold text-red-400">{swipeCount.unknown}</div>
            <div className="text-xs text-muted-foreground mt-1.5 font-medium uppercase tracking-wide">Learning</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button
            size="lg"
            className="w-full h-14 rounded-2xl font-bold"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(280 90% 65%))" }}
            onClick={() => {
              setCurrentIndex(0);
              setIsFinished(false);
              setSwipeCount({ known: 0, unknown: 0 });
              queryClient.invalidateQueries({ queryKey: getGetSwipeQueueQueryKey() });
            }}
          >
            <RotateCcw size={17} className="mr-2" />
            Practice Again
          </Button>
          <Button size="lg" variant="ghost" className="w-full h-12 rounded-2xl" onClick={() => setLocation("/")}>
            Back to Home
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden select-none relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl"
          style={{ background: "hsl(var(--primary) / 0.07)" }}
        />
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-border z-20">
        <motion.div
          className="h-full"
          style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(280 90% 65%))" }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Swipe overlays — full-screen tint */}
      <motion.div
        className="absolute inset-0 bg-emerald-500 pointer-events-none z-0"
        style={{ opacity: bgGreenOpacity }}
      />
      <motion.div
        className="absolute inset-0 bg-red-500 pointer-events-none z-0"
        style={{ opacity: bgRedOpacity }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 pt-10 pb-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-card border border-border w-10 h-10"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft size={18} />
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tabular-nums text-muted-foreground">
            {currentIndex + 1} <span className="text-muted-foreground/40">/</span> {words.length}
          </span>
        </div>
        <div className="w-10" />
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center px-6 pb-4 relative z-10">
        {/* Next card (behind) */}
        <AnimatePresence>
          {nextWord && (
            <motion.div
              key={`bg-${nextWord.id}`}
              className="absolute w-full max-w-[320px] rounded-3xl bg-card border border-border/60"
              style={{ aspectRatio: "3/4", scale: nextCardScale, y: nextCardY }}
            />
          )}
        </AnimatePresence>

        {/* Active card */}
        <AnimatePresence mode="wait">
          {currentWord && (
            <motion.div
              key={`card-${currentWord.id}`}
              className="absolute w-full max-w-[320px] cursor-grab active:cursor-grabbing z-10"
              style={{ aspectRatio: "3/4", x, rotate }}
              drag="x"
              dragElastic={0.12}
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={handleDragEnd}
              initial={{ scale: 0.9, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            >
              {/* Known label */}
              <motion.div
                className="absolute top-6 right-6 z-20 flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full"
                style={{ opacity: knownOpacity }}
              >
                <Check size={12} strokeWidth={3} /> Know it
              </motion.div>

              {/* Unknown label */}
              <motion.div
                className="absolute top-6 left-6 z-20 flex items-center gap-1.5 bg-red-500 text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full"
                style={{ opacity: unknownOpacity }}
              >
                <X size={12} strokeWidth={3} /> Learning
              </motion.div>

              {/* Card face */}
              <div className="w-full h-full bg-card border border-border/80 rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 pointer-events-none opacity-30"
                  style={{ background: "radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.25), transparent 70%)" }}
                />
                <span className="relative text-xs font-bold text-primary uppercase tracking-[0.22em] mb-8 bg-primary/12 border border-primary/20 px-3.5 py-1.5 rounded-full">
                  {currentWord.partOfSpeech}
                </span>
                <h2 className="relative text-[52px] font-extrabold tracking-tight leading-none text-center break-words">
                  {currentWord.word}
                </h2>
                <p className="relative text-muted-foreground/40 text-xs uppercase tracking-[0.18em] mt-10 font-medium">
                  Swipe to classify
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-10 pb-12 z-10 relative">
        <motion.button
          whileTap={{ scale: 0.88 }}
          className="w-[60px] h-[60px] rounded-full border-2 border-red-500/30 bg-red-500/8 text-red-400 flex flex-col items-center justify-center gap-0.5 hover:bg-red-500/18 transition-colors"
          onClick={() => swipeCard("left")}
          disabled={isAnimating}
        >
          <X size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-bold uppercase tracking-wide">Skip</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.88 }}
          className="w-[60px] h-[60px] rounded-full border-2 border-emerald-500/30 bg-emerald-500/8 text-emerald-400 flex flex-col items-center justify-center gap-0.5 hover:bg-emerald-500/18 transition-colors"
          onClick={() => swipeCard("right")}
          disabled={isAnimating}
        >
          <Check size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-bold uppercase tracking-wide">Know</span>
        </motion.button>
      </div>
    </div>
  );
}
