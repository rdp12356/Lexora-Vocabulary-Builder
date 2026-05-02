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
import { ArrowLeft, CheckCircle2, XCircle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  },
  item: {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 28 } },
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
      <div className="p-6 space-y-5 pt-10">
        <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-16 w-4/5 bg-muted rounded-2xl animate-pulse" />
        <div className="h-5 w-full bg-muted rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
        <div className="mt-6 h-28 w-full bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!word) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        Word not found.
      </div>
    );
  }

  const statusBg =
    word.status === "known"
      ? "bg-green-500/10 text-green-500 border-green-500/20"
      : word.status === "unknown"
        ? "bg-red-500/10 text-red-400 border-red-500/20"
        : "bg-muted text-muted-foreground border-border/50";

  const statusLabel =
    word.status === "known"
      ? "Known"
      : word.status === "unknown"
        ? "Learning"
        : "New";

  return (
    <motion.div
      variants={stagger.container}
      initial="hidden"
      animate="show"
      className="flex flex-col min-h-full pb-28"
    >
      {/* Header */}
      <motion.div variants={stagger.item} className="flex items-center justify-between px-5 pt-10 pb-2">
        <Link href="/words">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" className="rounded-full bg-card w-10 h-10">
              <ArrowLeft size={20} />
            </Button>
          </motion.div>
        </Link>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${statusBg}`}>
          {statusLabel}
        </span>
      </motion.div>

      {/* Word */}
      <motion.div variants={stagger.item} className="px-6 pt-4 pb-6">
        <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em] bg-primary/10 px-2.5 py-1 rounded-full inline-block mb-4">
          {word.partOfSpeech}
        </span>
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-5xl font-bold tracking-tight leading-none">{word.word}</h1>
          <motion.button
            whileTap={{ scale: 0.85 }}
            className="w-9 h-9 rounded-full bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shrink-0"
            data-testid="button-pronunciation"
          >
            <Volume2 size={16} />
          </motion.button>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">{word.meaning}</p>
      </motion.div>

      {/* Examples */}
      <AnimatePresence>
        {word.examples && word.examples.length > 0 && (
          <motion.div variants={stagger.item} className="px-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Usage examples
            </h2>
            <motion.div
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
              className="space-y-3"
            >
              {word.examples.map((example) => (
                <motion.div
                  key={example.id}
                  variants={stagger.item}
                  className="bg-card border border-border/40 rounded-2xl p-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/30 rounded-l-2xl" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    {example.type}
                  </span>
                  <p className="text-base leading-relaxed text-foreground/90 italic">
                    "{example.sentence}"
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky action button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 pb-6 pt-3 bg-gradient-to-t from-background via-background/95 to-transparent z-20">
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            size="lg"
            onClick={handleToggle}
            disabled={updateStatus.isPending}
            className={`w-full h-14 text-base font-semibold rounded-2xl transition-all ${
              word.status === "known"
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 shadow-none border border-red-500/20"
                : "shadow-lg shadow-primary/20"
            }`}
            data-testid="button-toggle-status"
          >
            {word.status === "known" ? (
              <>
                <XCircle className="mr-2" size={18} />
                Move to Learning
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2" size={18} />
                Mark as Known
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
