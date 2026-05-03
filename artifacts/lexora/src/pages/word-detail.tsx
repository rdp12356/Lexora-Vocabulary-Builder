import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import {
  useGetWord,
  useUpdateWordStatus,
  getGetWordQueryKey,
  getListWordsQueryKey,
  getGetStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { decryptVaultWord, type VaultWordRecord } from "@/lib/crypto";
import { useVault } from "@/components/vault-provider";

const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  },
  item: {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 28 } },
  },
} as const;

export default function WordDetail() {
  const { id } = useParams();
  const wordId = Number(id);
  const queryClient = useQueryClient();
  const { key } = useVault();
  const [displayWord, setDisplayWord] = useState<VaultWordRecord | null>(null);

  const { data: word, isLoading } = useGetWord(wordId, {
    query: { enabled: !!wordId, queryKey: getGetWordQueryKey(wordId) },
  });

  useEffect(() => {
    let active = true;

    async function decryptWord() {
      if (!word) {
        if (active) {
          setDisplayWord(null);
        }
        return;
      }

      if (!key) {
        if (active) {
          setDisplayWord(word as VaultWordRecord);
        }
        return;
      }

      const decrypted = await decryptVaultWord(word as VaultWordRecord, key);
      if (active) {
        setDisplayWord(decrypted);
      }
    }

    void decryptWord();

    return () => {
      active = false;
    };
  }, [key, word]);

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

  if (!word || !displayWord) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        Word not found.
      </div>
    );
  }

  const statusBg =
    displayWord.status === "known"
      ? "bg-green-500/10 text-green-500 border-green-500/20"
      : displayWord.status === "unknown"
        ? "bg-red-500/10 text-red-400 border-red-500/20"
        : "bg-muted text-muted-foreground border-border/50";

  const statusLabel =
    displayWord.status === "known"
      ? "Known"
      : displayWord.status === "unknown"
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
            <Button variant="ghost" size="icon" className="rounded-full glass-button w-10 h-10">
              <ArrowLeft size={18} />
            </Button>
          </motion.div>
        </Link>
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${statusBg}`}>
          {statusLabel}
        </span>
      </motion.div>

      {/* Word */}
      <motion.div variants={stagger.item} className="px-6 pt-4 pb-6">
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] bg-primary/10 px-3 py-1.5 rounded-full inline-block mb-4 border border-primary/20">
          {displayWord.partOfSpeech}
        </span>
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-black tracking-tighter leading-none text-glow">{displayWord.word}</h1>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => {
              const utterance = new SpeechSynthesisUtterance(displayWord.word);
              utterance.rate = 0.9;
              window.speechSynthesis.speak(utterance);
            }}
            className="w-9 h-9 rounded-full glass-button flex items-center justify-center text-white/40 hover:text-primary transition-colors shrink-0"
            data-testid="button-pronunciation"
          >
            <Volume2 size={16} />
          </motion.button>
        </div>
        <p className="text-base text-white/60 leading-relaxed font-medium tracking-tight italic">{displayWord.meaning}</p>
      </motion.div>

      {/* Examples */}
      <AnimatePresence>
        {word.examples && word.examples.length > 0 && (
          <motion.div variants={stagger.item} className="px-6">
            <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">
              Context Usage
            </h2>
            <motion.div
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
              className="space-y-3"
            >
              {word.examples.map((example) => (
                <motion.div
                  key={example.id}
                  variants={stagger.item}
                  className="glass-card rounded-2xl p-5 relative overflow-hidden border-white/5"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/30 rounded-l-2xl" />
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2 block">
                    {example.type}
                  </span>
                  <p className="text-sm leading-relaxed text-white/80 italic font-medium">
                    "{example.sentence}"
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky action button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 pb-6 pt-10 bg-gradient-to-t from-[#030303] via-[#030303]/95 to-transparent z-20 pointer-events-none">
        <motion.div whileTap={{ scale: 0.98 }} className="pointer-events-auto">
          <Button
            size="lg"
            onClick={handleToggle}
            disabled={updateStatus.isPending}
            className={`w-full h-14 text-[13px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${
              displayWord.status === "known"
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 shadow-none border border-red-500/20"
                : "shadow-xl shadow-primary/20 bg-primary"
            }`}
            data-testid="button-toggle-status"
          >
            {displayWord.status === "known" ? (
              <>
                <XCircle className="mr-2" size={16} />
                Forget Word
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2" size={16} />
                Mastered
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
