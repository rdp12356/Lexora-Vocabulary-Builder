import { useGetDailyLesson, useGetStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Flame, Zap, BookOpen, TrendingUp, ChevronRight, ArrowRight } from "lucide-react";

const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  },
  item: {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 28 } },
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
      className="flex flex-col min-h-full pb-28"
    >
      {/* Hero Header */}
      <motion.header variants={stagger.item} className="relative px-6 pt-14 pb-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-10 -left-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl" />
        </div>
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">Good day 👋</p>
            <h1 className="text-4xl font-bold tracking-tight">Lexora</h1>
          </div>
          {!statsLoading && stats && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/25 text-orange-400 px-3.5 py-2 rounded-full text-sm font-semibold mt-1"
            >
              <Flame size={14} />
              {stats.streakDays}d streak
            </motion.div>
          )}
        </div>

        {/* Mastery bar */}
        {!statsLoading && stats && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Mastery</span>
              <span className="text-xs font-bold text-primary">{knownPct}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(258 90% 80%))" }}
                initial={{ width: 0 }}
                animate={{ width: `${knownPct}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
              />
            </div>
          </div>
        )}
      </motion.header>

      {/* Stats row */}
      <motion.section variants={stagger.item} className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {statsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[90px] rounded-2xl bg-muted animate-pulse" />
            ))
          ) : (
            <>
              <StatCard
                label="Known"
                value={stats?.knownWords ?? 0}
                icon={<BookOpen size={14} />}
                color="text-primary"
                bg="bg-primary/12 border-primary/20"
              />
              <StatCard
                label="Learning"
                value={stats?.unknownWords ?? 0}
                icon={<Zap size={14} />}
                color="text-amber-400"
                bg="bg-amber-500/10 border-amber-500/20"
              />
              <StatCard
                label="Total"
                value={stats?.totalWords ?? 0}
                icon={<TrendingUp size={14} />}
                color="text-emerald-400"
                bg="bg-emerald-500/10 border-emerald-500/20"
              />
            </>
          )}
        </div>
      </motion.section>

      {/* Today's lesson */}
      <motion.section variants={stagger.item} className="px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Today's Words</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lessonLoading ? "..." : `${dailyLesson?.words?.length ?? 0} words to practice`}
            </p>
          </div>
        </div>

        {lessonLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        ) : dailyLesson?.words?.length ? (
          <motion.div
            variants={stagger.container}
            initial="hidden"
            animate="show"
            className="space-y-2.5 mb-7"
          >
            {dailyLesson.words.map((word, i) => (
              <motion.div key={word.id} variants={stagger.item}>
                <Link href={`/words/${word.id}`}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="bg-card border border-border hover:border-primary/40 rounded-2xl px-4 py-3.5 flex items-center gap-4 cursor-pointer group transition-all"
                  >
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base group-hover:text-primary transition-colors truncate">
                        {word.word}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 capitalize">{word.partOfSpeech}</div>
                    </div>
                    {word.status === "known" && (
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full shrink-0">
                        Known
                      </span>
                    )}
                    <ChevronRight size={15} className="text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0" />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground text-sm mb-7">
            No words available — check back soon!
          </div>
        )}

        <Link href="/swipe">
          <motion.div whileTap={{ scale: 0.975 }} whileHover={{ scale: 1.01 }}>
            <Button
              size="lg"
              className="w-full h-14 text-base font-bold rounded-2xl flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(280 90% 65%))", boxShadow: "0 8px 32px hsl(var(--primary) / 0.35)" }}
            >
              Start Swipe Mode
              <ArrowRight size={18} />
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
    <div className={`border rounded-2xl p-3.5 flex flex-col gap-2.5 ${bg}`}>
      <div className={`${color} opacity-80`}>{icon}</div>
      <div>
        <div className={`text-2xl font-extrabold leading-none ${color}`}>{value}</div>
        <div className="text-xs text-muted-foreground mt-1 font-medium">{label}</div>
      </div>
    </div>
  );
}
