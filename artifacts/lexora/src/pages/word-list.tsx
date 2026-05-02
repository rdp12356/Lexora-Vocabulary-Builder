import { useState } from "react";
import { useListWords } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, X } from "lucide-react";

export default function WordList() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const statusParam =
    (searchParams.get("status") as "known" | "unknown" | "all") || "all";

  const [search, setSearch] = useState("");

  const { data: words, isLoading } = useListWords({
    search: search || undefined,
    status: statusParam,
  });

  const title =
    statusParam === "known"
      ? "Known"
      : statusParam === "unknown"
        ? "Learning"
        : "All Words";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl px-6 pt-14 pb-4 border-b border-border/40">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-none">{title}</h1>
            {!isLoading && words && (
              <p className="text-xs text-muted-foreground mt-1.5">{words.length} words</p>
            )}
          </div>
        </div>

        <div className="relative flex items-center">
          <Search className="absolute left-4 text-muted-foreground/50 pointer-events-none" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search words…"
            className="w-full pl-10 pr-10 h-11 bg-card border border-border/60 rounded-xl text-sm placeholder:text-muted-foreground/40 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="absolute right-3.5 text-muted-foreground/50 hover:text-foreground transition-colors"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-28">
        {isLoading ? (
          <div className="space-y-2 mt-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-[62px] bg-muted animate-pulse rounded-2xl"
                style={{ opacity: 1 - i * 0.09 }}
              />
            ))}
          </div>
        ) : !words?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-muted-foreground text-sm mt-24"
          >
            {search ? `No results for "${search}"` : "No words here yet."}
          </motion.div>
        ) : (
          <motion.ul
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.035 } },
            }}
            className="space-y-1.5 mt-4"
          >
            {words.map((word) => (
              <motion.li
                key={word.id}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
                }}
              >
                <Link href={`/words/${word.id}`}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="bg-card hover:bg-card/70 border border-border/50 hover:border-primary/30 transition-all rounded-2xl px-4 py-3.5 flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[15px] group-hover:text-primary transition-colors truncate">
                        {word.word}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 capitalize">{word.partOfSpeech}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {word.status === "known" && (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          Known
                        </span>
                      )}
                      {word.status === "unknown" && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                          Learning
                        </span>
                      )}
                      <ChevronRight size={14} className="text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                    </div>
                  </motion.div>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  );
}
