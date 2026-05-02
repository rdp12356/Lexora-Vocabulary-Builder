import { useGetDailyLesson, useGetStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Flame, Zap, BookOpen, TrendingUp } from "lucide-react";

const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  },
  item: {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
  },
};

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: dailyLesson, isLoading: lessonLoading } = useGetDailyLesson();

  const knownPct = stats?.totalWords
    ? Math.round((stats.knownWords / stats.totalWords) * 100)
    : 0;

  return (
    <motion.div
      variants={stagger.container}
      initial="hidden"
      animate="show"
      className="flex flex-col min-h-full pb-24"
    >
      {/* Header */}
      <motion.header variants={stagger.item} className="px-6 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lexora</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Your daily vocabulary ritual</p>
          </div>
          {stats && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1.5 text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-2 rounded-full font-semibold text-sm"
            >
              <Flame size={15} />
              <span>{stats.streakDays} day streak</span>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Stats row */}
      <motion.section variants={stagger.item} className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {statsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
            ))
          ) : (
            <>
              <StatCard label="Known" value={stats?.knownWords ?? 0} icon={<BookOpen size={15} />} color="text-primary" bg="bg-primary/10" />
              <StatCard label="Learning" value={stats?.unknownWords ?? 0} icon={<Zap size={15} />} color="text-amber-400" bg="bg-amber-500/10" />
              <StatCard label="Mastery" value={`${knownPct}%`} icon={<TrendingUp size={15} />} color="text-green-400" bg="bg-green-500/10" />
            </>
          )}
        </div>
      </motion.section>

      {/* Mastery bar */}
      {!statsLoading && stats && (
        <motion.section variants={stagger.item} className="px-6 mb-8">
          <div className="bg-card border border-border/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Overall progress</span>
              <span className="text-sm font-bold">{stats.knownWords} / {stats.totalWords} words</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${knownPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
              />
            </div>
          </div>
        </motion.section>
      )}

      {/* Today's lesson */}
      <motion.section variants={stagger.item} className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Today's Lesson</h2>
          <span className="text-sm text-muted-foreground">
            {lessonLoading ? "..." : `${dailyLesson?.words?.length ?? 0} words`}
          </span>
        </div>

        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="space-y-2.5 mb-6"
        >
          {lessonLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[72px] rounded-2xl bg-muted animate-pulse" />
            ))
          ) : dailyLesson?.words?.length ? (
            dailyLesson.words.slice(0, 5).map((word) => (
              <motion.div
                key={word.id}
                variants={stagger.item}
              >
                <Link href={`/words/${word.id}`}>
                  <div className="bg-card border border-border/40 hover:border-primary/30 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer group">
                    <div>
                      <div className="font-semibold text-base group-hover:text-primary transition-colors">
                        {word.word}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{word.partOfSpeech}</div>
                    </div>
                    <div className="text-sm text-muted-foreground text-right max-w-[140px] truncate">
                      {word.meaning}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="bg-card rounded-2xl p-6 text-center text-muted-foreground border border-border/50">
              No words for today — come back tomorrow!
            </div>
          )}
        </motion.div>

        <Link href="/swipe" className="block">
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button size="lg" className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg shadow-primary/20">
              Start Swipe Mode
            </Button>
          </motion.div>
        </Link>
      </motion.section>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-card border border-border/40 rounded-2xl p-3.5 flex flex-col gap-2">
      <div className={`${bg} ${color} w-7 h-7 rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold leading-none">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}
