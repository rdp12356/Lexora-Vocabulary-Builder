import { useState } from "react";
import { useListWords } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";

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
      ? "Known Words"
      : statusParam === "unknown"
        ? "Learning"
        : "All Words";

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl px-6 pt-12 pb-4 border-b border-border/30">
        <h1 className="text-2xl font-bold tracking-tight mb-4">{title}</h1>
        <div className="relative flex items-center">
          <Search
            className="absolute left-3.5 text-muted-foreground pointer-events-none"
            size={17}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-10 pr-10 bg-card border-border/50 rounded-xl h-11 text-sm"
            data-testid="input-search"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setSearch("")}
              >
                <X size={16} />
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
                className="h-[68px] bg-muted animate-pulse rounded-xl"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        ) : !words?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-muted-foreground mt-20 text-sm"
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
            {words.map((word) => (
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
                    className="bg-card hover:bg-card/70 border border-border/40 hover:border-primary/30 transition-all rounded-xl p-4 flex items-center justify-between cursor-pointer group"
                    data-testid={`card-word-${word.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base group-hover:text-primary transition-colors truncate">
                        {word.word}
                      </div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {word.meaning}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 ml-3 shrink-0">
                      {word.status === "known" && (
                        <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full">
                          Known
                        </span>
                      )}
                      {word.status === "unknown" && (
                        <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
                          Learning
                        </span>
                      )}
                      <ChevronRight size={16} className="text-muted-foreground/50" />
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
