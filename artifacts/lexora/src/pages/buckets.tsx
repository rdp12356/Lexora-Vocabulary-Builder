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
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 28 } },
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
      className="flex flex-col min-h-full pb-28"
    >
      <motion.header variants={stagger.item} className="px-6 pt-14 pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Buckets</h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          {isLoading ? "Loading…" : `${total} words in your library`}
        </p>
      </motion.header>

      <div className="px-6 flex flex-col gap-4">
        <BucketCard
          href="/words?status=known"
          icon={<CheckCircle2 size={26} />}
          label="Known"
          sublabel="Mastered"
          count={stats?.knownWords ?? 0}
          total={total}
          colorText="text-emerald-400"
          colorBg="bg-emerald-500/10"
          colorBorder="border-emerald-500/20 hover:border-emerald-500/50"
          barColor="bg-emerald-500"
          isLoading={isLoading}
          delay={0.2}
        />
        <BucketCard
          href="/words?status=unknown"
          icon={<XCircle size={26} />}
          label="Learning"
          sublabel="In progress"
          count={stats?.unknownWords ?? 0}
          total={total}
          colorText="text-red-400"
          colorBg="bg-red-500/10"
          colorBorder="border-red-500/20 hover:border-red-500/50"
          barColor="bg-red-400"
          isLoading={isLoading}
          delay={0.3}
        />
        <BucketCard
          href="/words"
          icon={<BookOpen size={26} />}
          label="All Words"
          sublabel="Full library"
          count={stats?.totalWords ?? 0}
          total={total}
          colorText="text-primary"
          colorBg="bg-primary/10"
          colorBorder="border-primary/20 hover:border-primary/50"
          barColor="bg-primary"
          isLoading={isLoading}
          delay={0.4}
          hidebar
        />
      </div>
    </motion.div>
  );
}

function BucketCard({
  href,
  icon,
  label,
  sublabel,
  count,
  total,
  colorText,
  colorBg,
  colorBorder,
  barColor,
  isLoading,
  delay,
  hidebar,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  count: number;
  total: number;
  colorText: string;
  colorBg: string;
  colorBorder: string;
  barColor: string;
  isLoading?: boolean;
  delay?: number;
  hidebar?: boolean;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 22 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 28, delay } },
      }}
    >
      <Link href={href}>
        <motion.div
          whileTap={{ scale: 0.975 }}
          className={`bg-card border rounded-3xl p-6 cursor-pointer transition-colors ${colorBorder}`}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${colorBg} ${colorText} flex items-center justify-center`}>
                {icon}
              </div>
              <div>
                <h3 className="text-xl font-bold leading-none">{label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
              </div>
            </div>
            {isLoading ? (
              <div className="w-14 h-10 bg-muted rounded-xl animate-pulse" />
            ) : (
              <span className={`text-4xl font-extrabold tabular-nums ${colorText}`}>{count}</span>
            )}
          </div>
          {!hidebar && !isLoading && (
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${barColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: "easeOut", delay: (delay ?? 0) + 0.1 }}
              />
            </div>
          )}
        </motion.div>
      </Link>
    </motion.div>
  );
}
