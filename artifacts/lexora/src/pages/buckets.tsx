import { useGetStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion, type Variants } from "framer-motion";
import { CheckCircle2, XCircle, BookOpen } from "lucide-react";

const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
  },
} as const;

export default function Buckets() {
  const { data: stats, isLoading } = useGetStats();

  const total = (stats?.knownWords ?? 0) + (stats?.unknownWords ?? 0) + (stats?.unstudiedWords ?? 0);

  return (
    <motion.div
      variants={stagger.container}
      initial="hidden"
      animate="show"
      className="flex flex-col min-h-full pb-24"
    >
      <motion.header variants={stagger.item} className="px-6 pt-10 pb-6">
        <h1 className="text-2xl font-black tracking-tighter text-glow">Word Buckets</h1>
        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
          {isLoading ? "Loading..." : `${total} TOTAL WORDS IN LIBRARY`}
        </p>
      </motion.header>

      <div className="px-6 flex flex-col gap-3">
        <motion.div variants={stagger.item}>
          <Link href="/words?status=known">
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="glass-card rounded-[2rem] p-5 cursor-pointer transition-all group border-white/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500/20 transition-colors border border-green-500/10">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Mastered</h3>
                    <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-0.5">Known words</p>
                  </div>
                </div>
                <div className="text-3xl font-black text-green-500 tabular-nums tracking-tighter">
                  {isLoading ? (
                    <div className="w-8 h-9 bg-white/5 rounded animate-pulse" />
                  ) : (
                    stats?.knownWords ?? 0
                  )}
                </div>
              </div>
              {!isLoading && stats && (
                <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                    initial={{ width: 0 }}
                    animate={{
                      width: total > 0 ? `${(stats.knownWords / total) * 100}%` : "0%",
                    }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                  />
                </div>
              )}
            </motion.div>
          </Link>
        </motion.div>

        <motion.div variants={stagger.item}>
          <Link href="/words?status=unknown">
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="glass-card rounded-[2rem] p-5 cursor-pointer transition-all group border-white/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500/20 transition-colors border border-red-500/10">
                    <XCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Learning</h3>
                    <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-0.5">Words to review</p>
                  </div>
                </div>
                <div className="text-3xl font-black text-red-400 tabular-nums tracking-tighter">
                  {isLoading ? (
                    <div className="w-8 h-9 bg-white/5 rounded animate-pulse" />
                  ) : (
                    stats?.unknownWords ?? 0
                  )}
                </div>
              </div>
              {!isLoading && stats && (
                <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-red-400 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                    initial={{ width: 0 }}
                    animate={{
                      width: total > 0 ? `${(stats.unknownWords / total) * 100}%` : "0%",
                    }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                  />
                </div>
              )}
            </motion.div>
          </Link>
        </motion.div>

        <motion.div variants={stagger.item}>
          <Link href="/words">
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="glass-card rounded-[2rem] p-5 cursor-pointer transition-all group border-white/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors border border-primary/10">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Library</h3>
                    <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-0.5">Full vocabulary</p>
                  </div>
                </div>
                <div className="text-3xl font-black text-primary tabular-nums tracking-tighter">
                  {isLoading ? (
                    <div className="w-8 h-9 bg-white/5 rounded animate-pulse" />
                  ) : (
                    stats?.totalWords ?? 0
                  )}
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
