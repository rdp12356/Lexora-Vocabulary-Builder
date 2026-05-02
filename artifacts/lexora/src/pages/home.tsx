import { useGetDailyLesson, useGetStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Flame, Zap, BookOpen, TrendingUp, ChevronRight, ArrowRight } from "lucide-react";

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 360, damping: 28 } },
  },
};

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: dailyLesson, isLoading: lessonLoading } = useGetDailyLesson();

  const knownPct = stats?.totalWords
    ? Math.round((stats.knownWords / stats.totalWords) * 100)
    : 0;

  return (
    <motion.div variants={stagger.container} initial="hidden" animate="show"
      className="flex flex-col min-h-full pb-28 px-5">

      {/* Header */}
      <motion.header variants={stagger.item} className="pt-14 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/40 text-sm font-medium mb-1">Good day 👋</p>
            <h1 className="text-[42px] font-extrabold tracking-tight leading-none text-white">Lexora</h1>
          </div>
          {!statsLoading && stats && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-orange-300 text-sm font-bold mt-2"
              style={{ background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.22)" }}
            >
              <Flame size={14} />{stats.streakDays}d streak
            </motion.div>
          )}
        </div>

        {!statsLoading && stats && (
          <div className="mt-5">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-white/40 font-medium">Mastery</span>
              <span className="text-xs font-bold text-primary/90">{knownPct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(258 90% 65%), hsl(290 80% 70%))" }}
                initial={{ width: 0 }}
                animate={{ width: `${knownPct}%` }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.6 }}
              />
            </div>
          </div>
        )}
      </motion.header>

      {/* Stat cards */}
      <motion.section variants={stagger.item} className="grid grid-cols-3 gap-3 mb-6">
        {statsLoading
          ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[90px] rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
          ))
          : <>
            <GlassStat label="Known" value={stats?.knownWords ?? 0} icon={<BookOpen size={13} />} color="hsl(258 90% 75%)" glow="hsl(258 90% 55% / 0.25)" />
            <GlassStat label="Learning" value={stats?.unknownWords ?? 0} icon={<Zap size={13} />} color="hsl(38 95% 65%)" glow="hsl(38 95% 50% / 0.2)" />
            <GlassStat label="Total" value={stats?.totalWords ?? 0} icon={<TrendingUp size={13} />} color="hsl(152 70% 55%)" glow="hsl(152 70% 40% / 0.2)" />
          </>
        }
      </motion.section>

      {/* Today's Words */}
      <motion.section variants={stagger.item}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Today's Words</h2>
            <p className="text-xs text-white/35 mt-0.5">
              {lessonLoading ? "…" : `${dailyLesson?.words?.length ?? 0} words queued`}
            </p>
          </div>
        </div>

        {lessonLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[60px] rounded-2xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)", opacity: 1 - i * 0.16 }} />
            ))}
          </div>
        ) : dailyLesson?.words?.length ? (
          <motion.div
            variants={stagger.container} initial="hidden" animate="show"
            className="space-y-2 mb-7"
          >
            {dailyLesson.words.map((word, i) => (
              <motion.div key={word.id} variants={stagger.item}>
                <Link href={`/words/${word.id}`}>
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    className="glass-card rounded-2xl px-4 py-3.5 flex items-center gap-3 cursor-pointer group transition-all"
                  >
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "rgba(147,100,255,0.15)", color: "hsl(258 90% 75%)" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[15px] text-white/90 group-hover:text-white transition-colors truncate">
                        {word.word}
                      </div>
                      <div className="text-xs text-white/35 mt-0.5 capitalize">{word.partOfSpeech}</div>
                    </div>
                    {word.status === "known" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: "rgba(52,211,153,0.12)", color: "hsl(152 70% 60%)", border: "1px solid rgba(52,211,153,0.2)" }}>
                        Known
                      </span>
                    )}
                    <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="glass-card rounded-2xl p-6 text-center text-white/35 text-sm mb-7">
            No words available — check back soon!
          </div>
        )}

        <Link href="/swipe">
          <motion.div whileTap={{ scale: 0.975 }} whileHover={{ scale: 1.01 }}>
            <button className="w-full h-14 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: "linear-gradient(135deg, hsl(258 90% 62%), hsl(290 80% 65%))",
                boxShadow: "0 8px 32px hsl(258 90% 55% / 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}>
              Start Swipe Mode <ArrowRight size={18} />
            </button>
          </motion.div>
        </Link>
      </motion.section>
    </motion.div>
  );
}

function GlassStat({ label, value, icon, color, glow }: {
  label: string; value: string | number; icon: React.ReactNode; color: string; glow: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-3.5 flex flex-col gap-2.5 overflow-hidden relative">
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl pointer-events-none"
        style={{ background: glow }} />
      <div style={{ color }} className="relative z-10">{icon}</div>
      <div className="relative z-10">
        <div className="text-[26px] font-extrabold leading-none" style={{ color }}>{value}</div>
        <div className="text-[11px] text-white/40 mt-1 font-medium">{label}</div>
      </div>
    </div>
  );
}
