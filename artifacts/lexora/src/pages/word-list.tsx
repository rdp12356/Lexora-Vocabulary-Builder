import { useState } from "react";
import { useListWords } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, X } from "lucide-react";

export default function WordList() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const statusParam = (searchParams.get("status") as "known" | "unknown" | "all") || "all";
  const [search, setSearch] = useState("");
  const { data: words, isLoading } = useListWords({ search: search || undefined, status: statusParam });

  const title = statusParam === "known" ? "Known" : statusParam === "unknown" ? "Learning" : "Library";

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 px-5 pt-14 pb-4"
        style={{ background: "rgba(10,8,20,0.85)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h1 className="text-[38px] font-extrabold tracking-tight leading-none text-white">{title}</h1>
            {!isLoading && words && (
              <p className="text-xs text-white/35 mt-1.5">{words.length} words</p>
            )}
          </div>
        </div>
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-white/25 pointer-events-none" size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search words…"
            className="w-full pl-10 pr-10 h-11 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                className="absolute right-3.5 text-white/30 hover:text-white/70 transition-colors"
                onClick={() => setSearch("")}
              >
                <X size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {isLoading ? (
          <div className="space-y-2 mt-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-[60px] rounded-2xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)", opacity: 1 - i * 0.09 }} />
            ))}
          </div>
        ) : !words?.length ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="text-center text-white/30 text-sm mt-24">
            {search ? `No results for "${search}"` : "No words here yet."}
          </motion.div>
        ) : (
          <motion.ul
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
            className="space-y-1.5 mt-4"
          >
            {words.map((word) => (
              <motion.li key={word.id}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
                }}>
                <Link href={`/words/${word.id}`}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="glass-card rounded-2xl px-4 py-3.5 flex items-center gap-3 cursor-pointer group transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[15px] text-white/85 group-hover:text-white transition-colors truncate">
                        {word.word}
                      </div>
                      <div className="text-xs text-white/30 mt-0.5 capitalize">{word.partOfSpeech}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {word.status === "known" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(52,211,153,0.12)", color: "hsl(152 70% 60%)", border: "1px solid rgba(52,211,153,0.2)" }}>
                          Known
                        </span>
                      )}
                      {word.status === "unknown" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(248,113,113,0.12)", color: "hsl(0 80% 65%)", border: "1px solid rgba(248,113,113,0.2)" }}>
                          Learning
                        </span>
                      )}
                      <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
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
