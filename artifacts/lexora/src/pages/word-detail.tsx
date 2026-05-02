import { useParams, Link } from "wouter";
import {
  useGetWord,
  useUpdateWordStatus,
  getGetWordQueryKey,
  getListWordsQueryKey,
  getGetStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
  },
  item: {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 26 } },
  },
};

export default function WordDetail() {
  const { id } = useParams();
  const wordId = Number(id);
  const queryClient = useQueryClient();

  const { data: word, isLoading } = useGetWord(wordId, {
    query: { enabled: !!wordId, queryKey: getGetWordQueryKey(wordId) },
  });

  const updateStatus = useUpdateWordStatus();

  const handleToggle = () => {
    if (!word) return;
    const newStatus = word.status === "known" ? "unknown" : "known";
    updateStatus.mutate(
      { wordId, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWordQueryKey(wordId) });
          queryClient.invalidateQueries({ queryKey: getListWordsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 pt-14 space-y-6 animate-pulse">
        <div className="w-10 h-10 bg-muted rounded-full" />
        <div className="space-y-3 mt-4">
          <div className="h-4 w-20 bg-muted rounded-full" />
          <div className="h-14 w-3/4 bg-muted rounded-2xl" />
          <div className="h-5 w-full bg-muted rounded-xl" />
          <div className="h-5 w-5/6 bg-muted rounded-xl" />
        </div>
        <div className="h-28 w-full bg-muted rounded-2xl mt-6" />
      </div>
    );
  }

  if (!word) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
        Word not found.
      </div>
    );
  }

  const isKnown = word.status === "known";
  const isUnknown = word.status === "unknown";

  return (
    <motion.div
      variants={stagger.container}
      initial="hidden"
      animate="show"
      className="flex flex-col min-h-full pb-32"
    >
      {/* Top nav */}
      <motion.div variants={stagger.item} className="flex items-center justify-between px-5 pt-12 pb-2">
        <Link href="/words">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" className="rounded-full bg-card border border-border w-10 h-10">
              <ArrowLeft size={18} />
            </Button>
          </motion.div>
        </Link>
        {isKnown && (
          <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            Known
          </span>
        )}
        {isUnknown && (
          <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
            Learning
          </span>
        )}
        {!isKnown && !isUnknown && <div />}
      </motion.div>

      {/* Word hero */}
      <motion.div variants={stagger.item} className="px-6 pt-5 pb-8 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-48 h-48 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
        <span className="inline-block text-xs font-bold text-primary uppercase tracking-[0.22em] bg-primary/12 border border-primary/20 px-3.5 py-1.5 rounded-full mb-5">
          {word.partOfSpeech}
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight leading-none mb-4 relative">
          {word.word}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed relative">{word.meaning}</p>
      </motion.div>

      {/* Divider */}
      <motion.div variants={stagger.item} className="px-6 mb-6">
        <div className="h-px bg-border/50" />
      </motion.div>

      {/* Examples */}
      <AnimatePresence>
        {word.examples && word.examples.length > 0 && (
          <motion.div variants={stagger.item} className="px-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">
              Usage examples
            </p>
            <motion.div
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
              className="space-y-3"
            >
              {word.examples.map((example) => (
                <motion.div
                  key={example.id}
                  variants={stagger.item}
                  className="relative bg-card border border-border/60 rounded-2xl p-5 pl-6 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-[3px] h-full bg-primary/40 rounded-l-2xl" />
                  <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-2 capitalize">
                    {example.type}
                  </p>
                  <p className="text-base leading-relaxed text-foreground/85 italic">
                    "{example.sentence}"
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed bottom action */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 pb-8 pt-4 z-20"
        style={{ background: "linear-gradient(to top, hsl(var(--background)) 70%, transparent)" }}
      >
        <motion.div whileTap={{ scale: 0.975 }}>
          <Button
            size="lg"
            onClick={handleToggle}
            disabled={updateStatus.isPending}
            className={`w-full h-14 text-base font-bold rounded-2xl transition-all ${
              isKnown
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/18 border border-red-500/25 shadow-none"
                : "border-0"
            }`}
            style={!isKnown ? {
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(280 90% 65%))",
              boxShadow: "0 8px 24px hsl(var(--primary) / 0.3)",
            } : {}}
          >
            {isKnown ? (
              <><XCircle className="mr-2" size={18} /> Move to Learning</>
            ) : (
              <><CheckCircle2 className="mr-2" size={18} /> Mark as Known</>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
