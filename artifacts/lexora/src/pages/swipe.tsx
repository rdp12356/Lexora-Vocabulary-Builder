import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useGetSwipeQueue, useRecordSwipe, getGetStatsQueryKey, getGetDailyLessonQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { X, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Swipe() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: queue, isLoading } = useGetSwipeQueue();
  const recordSwipe = useRecordSwipe();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  const backgroundRed = useTransform(x, [-150, 0], [0.2, 0]);
  const backgroundGreen = useTransform(x, [0, 150], [0, 0.2]);

  const words = queue || [];
  const currentWord = words[currentIndex];
  
  const handleDragEnd = (event: any, info: any) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleSwipe("known");
    } else if (info.offset.x < -threshold) {
      handleSwipe("unknown");
    }
  };

  const handleSwipe = (status: "known" | "unknown") => {
    if (!currentWord) return;
    
    recordSwipe.mutate({ wordId: currentWord.id, data: { status } });
    
    setIsFlipped(false);
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDailyLessonQueryKey() });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!words.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Check size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">You're all caught up!</h2>
        <p className="text-muted-foreground mb-8">No more words in your queue right now.</p>
        <Link href="/">
          <Button size="lg" className="rounded-2xl">Return Home</Button>
        </Link>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary">
          <Check size={48} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Session Complete</h2>
        <p className="text-muted-foreground mb-8 text-lg">Great job! You reviewed {words.length} words.</p>
        <Link href="/">
          <Button size="lg" className="w-full h-14 text-lg rounded-2xl shadow-primary/20 shadow-lg">Done</Button>
        </Link>
      </div>
    );
  }

  const progress = ((currentIndex) / words.length) * 100;

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-background">
      {/* Dynamic background color feedback */}
      <motion.div 
        className="absolute inset-0 bg-red-500 pointer-events-none" 
        style={{ opacity: backgroundRed }} 
      />
      <motion.div 
        className="absolute inset-0 bg-green-500 pointer-events-none" 
        style={{ opacity: backgroundGreen }} 
      />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 z-10 flex items-center justify-between pointer-events-none">
        <Button variant="ghost" size="icon" className="pointer-events-auto rounded-full bg-background/50 backdrop-blur" onClick={() => setLocation("/")}>
          <ArrowLeft size={24} />
        </Button>
        <div className="text-sm font-bold tracking-widest text-muted-foreground bg-background/50 backdrop-blur px-4 py-1.5 rounded-full">
          {currentIndex + 1} / {words.length}
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted z-20">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Cards Area */}
      <div className="flex-1 flex items-center justify-center p-6 pt-24 pb-32 perspective-1000 relative">
        <AnimatePresence>
          {currentWord && (
            <motion.div
              key={currentWord.id}
              className="absolute w-full max-w-[340px] aspect-[3/4] cursor-grab active:cursor-grabbing"
              style={{ x, rotate, opacity }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="w-full h-full relative preserve-3d">
                {/* Front of card */}
                <motion.div 
                  className="absolute inset-0 backface-hidden bg-card border border-border shadow-2xl rounded-3xl flex flex-col items-center justify-center p-8 text-center"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <div className="text-sm font-medium text-primary mb-4 uppercase tracking-widest">{currentWord.partOfSpeech}</div>
                  <h2 className="text-5xl font-bold mb-4">{currentWord.word}</h2>
                  <p className="text-muted-foreground text-sm opacity-50 mt-12 uppercase tracking-widest">Tap to flip</p>
                </motion.div>

                {/* Back of card */}
                <motion.div 
                  className="absolute inset-0 backface-hidden bg-primary text-primary-foreground shadow-2xl rounded-3xl flex flex-col items-center justify-center p-8 text-center"
                  initial={{ rotateY: 180 }}
                  animate={{ rotateY: isFlipped ? 0 : -180 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <h2 className="text-3xl font-bold mb-6 opacity-50">{currentWord.word}</h2>
                  <p className="text-2xl font-medium leading-tight">{currentWord.meaning}</p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-10 left-0 right-0 px-8 flex items-center justify-center gap-8">
        <Button 
          variant="outline" 
          size="icon" 
          className="w-16 h-16 rounded-full border-2 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
          onClick={() => handleSwipe("unknown")}
        >
          <X size={32} />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="w-16 h-16 rounded-full border-2 border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-lg"
          onClick={() => handleSwipe("known")}
        >
          <Check size={32} />
        </Button>
      </div>
    </div>
  );
}
