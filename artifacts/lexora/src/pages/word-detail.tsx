import { useParams, Link } from "wouter";
import {
  useGetWord, useUpdateWordStatus,
  getGetWordQueryKey, getListWordsQueryKey, getGetStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } },
  item: {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 360, damping: 26 } },
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
    updateStatus.mutate({ wordId, data: { status: newStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWordQueryKey(wordId) });
        queryClient.invalidateQueries({ queryKey: getListWordsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-5 pt-14 space-y-5 animate-pulse">
        <div className="w-10 h-10 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="space-y-3 mt-4">
          <div className="h-4 w-20 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="h-14 w-3/4 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="h-5 w-full rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />
        </div>
      </div>
    );
  }

  if (!word) {
    return <div className="flex items-center justify-center h-full text-white/30 text-sm">Word not found.</div>;
  }

  const isKnown = word.status === "known";

  return (
    <motion.div variants={stagger.container} initial="hidden" animate="show"
      className="flex flex-col min-h-full pb-32">

      {/* Nav */}
      <motion.div variants={stagger.item} className="flex items-center justify-between px-5 pt-12 pb-2">
        <Link href="/words">
          <motion.button whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full flex items-center justify-center glass text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        {word.status === "known" && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(52,211,153,0.12)", color: "hsl(152 70% 60%)", border: "1px solid rgba(52,211,153,0.2)" }}>
            Known
          </span>
        )}
        {word.status === "unknown" && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(248,113,113,0.12)", color: "hsl(0 80% 65%)", border: "1px solid rgba(248,113,113,0.2)" }}>
            Learning
          </span>
        )}
        {!word.status && <div />}
      </motion.div>

      {/* Word hero */}
      <motion.div variants={stagger.item} className="px-5 pt-5 pb-8 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: "hsl(258 90% 60% / 0.12)" }} />
        <span className="inline-block text-xs font-bold uppercase tracking-[0.22em] mb-5 px-3.5 py-1.5 rounded-full"
          style={{ background: "rgba(147,100,255,0.15)", color: "hsl(258 90% 78%)", border: "1px solid rgba(147,100,255,0.22)" }}>
          {word.partOfSpeech}
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight leading-none mb-4 text-white relative">{word.word}</h1>
        <p className="text-white/50 text-lg leading-relaxed relative">{word.meaning}</p>
      </motion.div>

      <motion.div variants={stagger.item} className="px-5 mb-6">
        <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
      </motion.div>

      {/* Examples */}
      <AnimatePresence>
        {word.examples && word.examples.length > 0 && (
          <motion.div variants={stagger.item} className="px-5">
            <p className="text-xs font-bold text-white/25 uppercase tracking-[0.2em] mb-4">
              Usage examples
            </p>
            <motion.div
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
              className="space-y-3">
              {word.examples.map((example) => (
                <motion.div key={example.id} variants={stagger.item}
                  className="glass-card rounded-2xl p-5 pl-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-[3px] h-full rounded-l-2xl"
                    style={{ background: "linear-gradient(to bottom, hsl(258 90% 68%), hsl(290 80% 65%))" }} />
                  <p className="text-xs font-bold uppercase tracking-widest mb-2 capitalize"
                    style={{ color: "hsl(258 90% 72%)" }}>
                    {example.type}
                  </p>
                  <p className="text-base leading-relaxed text-white/75 italic">"{example.sentence}"</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-8 pt-4 z-20"
        style={{ background: "linear-gradient(to top, hsl(248 25% 4%) 65%, transparent)" }}>
        <motion.button
          whileTap={{ scale: 0.975 }}
          onClick={handleToggle}
          disabled={updateStatus.isPending}
          className="w-full h-14 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all"
          style={isKnown ? {
            background: "rgba(248,113,113,0.12)",
            border: "1px solid rgba(248,113,113,0.22)",
            color: "hsl(0 80% 65%)",
            boxShadow: "none",
          } : {
            background: "linear-gradient(135deg, hsl(258 90% 62%), hsl(290 80% 65%))",
            boxShadow: "0 8px 28px hsl(258 90% 55% / 0.38), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          {isKnown
            ? <><XCircle size={18} /> Move to Learning</>
            : <><CheckCircle2 size={18} /> Mark as Known</>
          }
        </motion.button>
      </div>
    </motion.div>
  );
}
