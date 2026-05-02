import { useGetStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
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
};

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
      <motion.header variants={stagger.item} className="px-6 pt-12 pb-8">
        <h1 className="text-3xl font-bold tracking-tight">Word Buckets</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isLoading ? "Loading..." : `${total} total words in your library`}
        </p>
      </motion.header>

      <div className="px-6 flex flex-col gap-4">
        <motion.div variants={stagger.item}>
          <Link href="/words?status=known">
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="bg-card border border-border/40 hover:border-green-500/40 rounded-3xl p-6 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500/20 transition-colors">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Known</h3>
                    <p className="text-muted-foreground text-sm mt-0.5">Words you've mastered</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-green-500 tabular-nums">
                  {isLoading ? (
                    <div className="w-8 h-9 bg-muted rounded animate-pulse" />
                  ) : (
                    stats?.knownWords ?? 0
                  )}
                </div>
              </div>
              {!isLoading && stats && (
                <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500 rounded-full"
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
              className="bg-card border border-border/40 hover:border-red-500/40 rounded-3xl p-6 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500/20 transition-colors">
                    <XCircle size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Learning</h3>
                    <p className="text-muted-foreground text-sm mt-0.5">Words to review</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-red-400 tabular-nums">
                  {isLoading ? (
                    <div className="w-8 h-9 bg-muted rounded animate-pulse" />
                  ) : (
                    stats?.unknownWords ?? 0
                  )}
                </div>
              </div>
              {!isLoading && stats && (
                <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-red-400 rounded-full"
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
              className="bg-card border border-border/40 hover:border-primary/40 rounded-3xl p-6 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    <BookOpen size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">All Words</h3>
                    <p className="text-muted-foreground text-sm mt-0.5">Full vocabulary library</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-primary tabular-nums">
                  {isLoading ? (
                    <div className="w-8 h-9 bg-muted rounded animate-pulse" />
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
