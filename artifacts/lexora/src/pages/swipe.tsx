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
import { X, Check, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 400;

export default function Swipe() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: queue, isLoading } = useGetSwipeQueue();
  const recordSwipe = useRecordSwipe();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [swipeCount, setSwipeCount] = useState({ known: 0, unknown: 0 });

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-22, 0, 22]);

  const knownOpacity = useTransform(x, [20, 120], [0, 1]);
  const unknownOpacity = useTransform(x, [-120, -20], [1, 0]);
  const bgRedOpacity = useTransform(x, [-160, 0], [0.18, 0]);
  const bgGreenOpacity = useTransform(x, [0, 160], [0, 0.18]);
  const cardScale = useTransform(x, [-250, 0, 250], [0.97, 1, 0.97]);

  const words = queue || [];
  const currentWord = words[currentIndex];
  const nextWord = words[currentIndex + 1];

  const swipeCard = (direction: "left" | "right") => {
    if (isAnimating || !currentWord) return;
    setIsAnimating(true);

    const status = direction === "right" ? "known" : "unknown";
    recordSwipe.mutate({ wordId: currentWord.id, data: { status } });

    const targetX = direction === "right" ? 700 : -700;
    animate(x, targetX, { duration: 0.35, ease: [0.32, 0, 0.67, 0] });

    setTimeout(() => {
      x.set(0);
      setIsFlipped(false);
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
    }, 370);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isAnimating) return;
    const { offset, velocity } = info;

    const swipedRight =
      offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD;
    const swipedLeft =
      offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD;

    if (swipedRight) {
      swipeCard("right");
    } else if (swipedLeft) {
      swipeCard("left");
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
  };

  const progress = words.length > 0 ? (currentIndex / words.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm">Loading your session...</p>
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
          <Check size={40} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">All caught up!</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Your queue is empty. Come back later for more.
        </p>
        <Button size="lg" className="w-full h-14 text-base rounded-2xl" onClick={() => setLocation("/")}>
          Back to Home
        </Button>
      </motion.div>
    );
  }

  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center justify-center h-full p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mb-8"
        >
          <Check size={52} className="text-primary" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-3">Session Done</h2>
        <p className="text-muted-foreground mb-10 text-base leading-relaxed">
          You reviewed {words.length} words
        </p>
        <div className="grid grid-cols-2 gap-4 w-full mb-10">
          <div className="bg-green-500/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-green-500">{swipeCount.known}</div>
            <div className="text-sm text-muted-foreground mt-1">Known</div>
          </div>
          <div className="bg-red-500/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{swipeCount.unknown}</div>
            <div className="text-sm text-muted-foreground mt-1">Learning</div>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <Button
            size="lg"
            className="w-full h-14 text-base rounded-2xl"
            onClick={() => {
              setCurrentIndex(0);
              setIsFinished(false);
              setSwipeCount({ known: 0, unknown: 0 });
              queryClient.invalidateQueries({ queryKey: getGetSwipeQueueQueryKey() });
            }}
          >
            <RotateCcw size={18} className="mr-2" />
            Practice Again
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="w-full h-12 text-base rounded-2xl"
            onClick={() => setLocation("/")}
          >
            Back to Home
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden select-none">
      {/* Background color feedback */}
      <motion.div className="absolute inset-0 bg-red-500 pointer-events-none" style={{ opacity: bgRedOpacity }} />
      <motion.div className="absolute inset-0 bg-green-500 pointer-events-none" style={{ opacity: bgGreenOpacity }} />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-border z-20">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 pt-8 pb-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-card/60 backdrop-blur w-10 h-10"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft size={20} />
        </Button>
        <span className="text-sm font-semibold text-muted-foreground tabular-nums">
          {currentIndex + 1} / {words.length}
        </span>
        <div className="w-10" />
      </div>

      {/* Cards Stack */}
      <div className="flex-1 flex items-center justify-center px-5 pb-6 relative">
        {/* Background (next) card */}
        <AnimatePresence>
          {nextWord && (
            <motion.div
              key={`bg-${nextWord.id}`}
              className="absolute w-full max-w-[340px]"
              style={{ aspectRatio: "3/4" }}
              initial={{ scale: 0.9, y: 16, opacity: 0.4 }}
              animate={{ scale: 0.93, y: 12, opacity: 0.5 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="w-full h-full bg-card border border-border/50 rounded-3xl shadow-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground/30">{nextWord.word}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active card */}
        <AnimatePresence mode="wait">
          {currentWord && (
            <motion.div
              key={`card-${currentWord.id}`}
              className="absolute w-full max-w-[340px] cursor-grab active:cursor-grabbing z-10"
              style={{ aspectRatio: "3/4", x, rotate, scale: cardScale }}
              drag="x"
              dragElastic={0.15}
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={handleDragEnd}
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              onClick={() => !isAnimating && setIsFlipped((f) => !f)}
            >
              {/* Known overlay */}
              <motion.div
                className="absolute inset-0 rounded-3xl border-4 border-green-500 z-10 pointer-events-none flex items-start justify-end p-5"
                style={{ opacity: knownOpacity }}
              >
                <div className="bg-green-500 rounded-full p-2">
                  <Check size={20} className="text-white" strokeWidth={3} />
                </div>
              </motion.div>

              {/* Unknown overlay */}
              <motion.div
                className="absolute inset-0 rounded-3xl border-4 border-red-500 z-10 pointer-events-none flex items-start justify-start p-5"
                style={{ opacity: unknownOpacity }}
              >
                <div className="bg-red-500 rounded-full p-2">
                  <X size={20} className="text-white" strokeWidth={3} />
                </div>
              </motion.div>

              {/* Card inner — flip */}
              <div className="w-full h-full relative" style={{ transformStyle: "preserve-3d" }}>
                {/* Front */}
                <motion.div
                  className="absolute inset-0 bg-card border border-border shadow-2xl rounded-3xl flex flex-col items-center justify-center p-8 text-center"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-6 bg-primary/10 px-3 py-1 rounded-full">
                    {currentWord.partOfSpeech}
                  </span>
                  <h2 className="text-5xl font-bold tracking-tight mb-4 leading-none">
                    {currentWord.word}
                  </h2>
                  <p className="text-muted-foreground/50 text-xs uppercase tracking-widest mt-10">
                    Tap to reveal
                  </p>
                </motion.div>

                {/* Back */}
                <motion.div
                  className="absolute inset-0 bg-primary rounded-3xl flex flex-col items-center justify-center p-8 text-center"
                  initial={{ rotateY: 180 }}
                  animate={{ rotateY: isFlipped ? 360 : 180 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-primary-foreground/50 text-xl font-bold mb-6 opacity-50">
                    {currentWord.word}
                  </span>
                  <p className="text-2xl font-semibold text-primary-foreground leading-snug">
                    {currentWord.meaning}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-8 pb-10 z-10 relative">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 rounded-full border-2 border-red-500/40 bg-red-500/5 text-red-500 flex items-center justify-center shadow-lg transition-colors hover:bg-red-500/20"
          onClick={() => swipeCard("left")}
          disabled={isAnimating}
          data-testid="button-unknown"
        >
          <X size={28} strokeWidth={2.5} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 rounded-full border-2 border-green-500/40 bg-green-500/5 text-green-500 flex items-center justify-center shadow-lg transition-colors hover:bg-green-500/20"
          onClick={() => swipeCard("right")}
          disabled={isAnimating}
          data-testid="button-known"
        >
          <Check size={28} strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* Swipe hint — first card only */}
      {currentIndex === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-[120px] left-0 right-0 text-center text-muted-foreground/40 text-xs tracking-widest uppercase pointer-events-none"
        >
          Swipe right to know, left to learn
        </motion.p>
      )}
    </div>
  );
}
