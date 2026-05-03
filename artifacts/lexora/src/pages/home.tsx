import { useEffect, useState } from "react";
import { useGetStats, useListWords } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, type Variants } from "framer-motion";
import { Flame, Zap, BookOpen, TrendingUp } from "lucide-react";
import { decryptVaultWords, type VaultWordRecord } from "@/lib/crypto";
import { useVault } from "@/components/vault-provider";

const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  },
  item: {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
  },
} as const;

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: words, isLoading: wordsLoading } = useListWords({
    status: "all",
    limit: 5,
  });
  const { key } = useVault();
  const [displayWords, setDisplayWords] = useState<VaultWordRecord[]>([]);

  useEffect(() => {
    let active = true;

    async function decryptWords() {
      if (!words?.length) {
        if (active) {
          setDisplayWords([]);
        }
        return;
      }

      if (!key) {
        if (active) {
          setDisplayWords(words as VaultWordRecord[]);
        }
        return;
      }

      const decrypted = await decryptVaultWords(words as VaultWordRecord[], key);
      if (active) {
        setDisplayWords(decrypted);
      }
    }

    void decryptWords();

    return () => {
      active = false;
    };
  }, [key, words]);

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
      <motion.header variants={stagger.item} className="px-6 pt-10 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-glow">Lexora</h1>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Daily Ritual</p>
          </div>
          {stats && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1.5 text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider"
            >
              <Flame size={12} />
              <span>{stats.streakDays} Day Streak</span>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Stats row */}
      <motion.section variants={stagger.item} className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-2.5">
          {statsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
            ))
          ) : (
            <>
              <StatCard label="Known" value={stats?.knownWords ?? 0} icon={<BookOpen size={12} />} color="text-primary" bg="bg-primary/10" />
              <StatCard label="Learning" value={stats?.unknownWords ?? 0} icon={<Zap size={12} />} color="text-amber-400" bg="bg-amber-500/10" />
              <StatCard label="Mastery" value={`${knownPct}%`} icon={<TrendingUp size={12} />} color="text-green-400" bg="bg-green-500/10" />
            </>
          )}
        </div>
      </motion.section>

      {/* Mastery bar */}
      {!statsLoading && stats && (
        <motion.section variants={stagger.item} className="px-6 mb-6">
          <div className="glass-card rounded-2xl p-4 border-white/5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Progress</span>
              <span className="text-[10px] font-black text-white/80 tabular-nums">{stats.knownWords} / {stats.totalWords} WORDS</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${knownPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
              />
            </div>
          </div>
        </motion.section>
      )}

      {/* Words */}
      <motion.section variants={stagger.item} className="px-6">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Test Words</h2>
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">
            {wordsLoading ? "..." : `${displayWords.length} WORDS`}
          </span>
        </div>

        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="space-y-2 mb-6"
        >
          {wordsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
            ))
          ) : displayWords.length ? (
            displayWords.map((word) => (
              <motion.div
                key={word.id}
                variants={stagger.item}
              >
                <Link href={`/words/${word.id}`}>
                  <div className="glass-card hover:bg-white/5 rounded-xl p-3.5 flex items-center justify-between transition-all cursor-pointer group border-white/5">
                    <div>
                      <div className="font-bold text-sm group-hover:text-primary transition-colors tracking-tight">
                        {word.word}
                      </div>
                      <div className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-0.5">{word.partOfSpeech}</div>
                    </div>
                    <div className="text-[10px] text-white/40 text-right max-w-[140px] truncate italic font-medium">
                      {word.meaning}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="glass-card rounded-xl p-6 text-center text-white/30 border-white/5 text-xs font-medium">
              No test words found.
            </div>
          )}
        </motion.div>

        <Link href="/swipe" className="block">
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button size="lg" className="w-full h-14 text-[13px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
              Start Session
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
    <div className="glass-card rounded-2xl p-3 flex flex-col gap-2 border-white/5">
      <div className={`${bg} ${color} w-6 h-6 rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <div className="text-lg font-black leading-none tabular-nums tracking-tight">{value}</div>
        <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1.5">{label}</div>
      </div>
    </div>
  );
}
