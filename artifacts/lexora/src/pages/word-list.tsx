import { useEffect, useMemo, useState } from "react";
import { useListWords } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { decryptVaultWords, type VaultWordRecord } from "@/lib/crypto";
import { useVault } from "@/components/vault-provider";

export default function WordList() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const statusParam =
    (searchParams.get("status") as "known" | "unknown" | "all") || "all";

  const [search, setSearch] = useState("");
  const { key } = useVault();
  const [decryptedWords, setDecryptedWords] = useState<VaultWordRecord[]>([]);

  const { data: words, isLoading } = useListWords({
    status: statusParam,
  });

  useEffect(() => {
    let active = true;

    async function decryptWords() {
      if (!words?.length) {
        if (active) {
          setDecryptedWords([]);
        }
        return;
      }

      if (!key) {
        if (active) {
          setDecryptedWords(words as VaultWordRecord[]);
        }
        return;
      }

      const decrypted = await decryptVaultWords(words as VaultWordRecord[], key);
      if (active) {
        setDecryptedWords(decrypted);
      }
    }

    void decryptWords();

    return () => {
      active = false;
    };
  }, [key, words]);

  const wordItems = useMemo(() => {
    const filtered = decryptedWords.filter((word) => {
      const matchesSearch =
        !search ||
        word.word.toLowerCase().includes(search.toLowerCase()) ||
        word.meaning.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusParam === "all" || word.status === statusParam;

      return matchesSearch && matchesStatus;
    });

    return filtered;
  }, [decryptedWords, search, statusParam]);

  const title =
    statusParam === "known"
      ? "Known Words"
      : statusParam === "unknown"
        ? "Learning"
        : "All Words";

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-2xl px-6 pt-10 pb-4 border-b border-white/5">
        <h1 className="text-xl font-black tracking-tighter text-glow mb-4">{title}</h1>
        <div className="relative flex items-center">
          <Search
            className="absolute left-3.5 text-white/30 pointer-events-none"
            size={14}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search words..."
            className="pl-9 pr-9 bg-white/5 border-white/5 rounded-xl h-10 text-xs font-medium placeholder:text-white/20"
            data-testid="input-search"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 text-white/30 hover:text-white transition-colors"
                onClick={() => setSearch("")}
              >
                <X size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-28">
        {isLoading ? (
          <div className="space-y-2 mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-14 bg-white/5 animate-pulse rounded-xl"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        ) : !wordItems.length ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white/20 mt-20 text-[10px] font-black uppercase tracking-widest"
          >
            No words found{search ? ` for "${search}"` : ""}.
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.04 } },
            }}
            className="space-y-2 mt-4"
          >
            {wordItems.map((word) => (
              <motion.div
                key={word.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { type: "spring", stiffness: 400, damping: 30 },
                  },
                }}
              >
                <Link href={`/words/${word.id}`}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="glass-card hover:bg-white/5 border-white/5 transition-all rounded-xl p-3.5 flex items-center justify-between cursor-pointer group"
                    data-testid={`card-word-${word.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm group-hover:text-primary transition-colors truncate tracking-tight">
                        {word.word}
                      </div>
                      <div className="text-[10px] text-white/30 truncate max-w-[200px] italic font-medium">
                        {word.meaning}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      {word.status === "known" && (
                        <span className="text-[9px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Known
                        </span>
                      )}
                      {word.status === "unknown" && (
                        <span className="text-[9px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Learning
                        </span>
                      )}
                      <ChevronRight size={14} className="text-white/10 group-hover:text-primary/40 transition-colors" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
