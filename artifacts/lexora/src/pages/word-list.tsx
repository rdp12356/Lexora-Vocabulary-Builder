import { useState } from "react";
import { useListWords } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function WordList() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const statusParam = searchParams.get("status") as 'known' | 'unknown' | 'all' || 'all';

  const [search, setSearch] = useState("");
  
  const { data: words, isLoading } = useListWords({ search, status: statusParam });

  return (
    <div className="flex flex-col h-full">
      <header className="px-6 pt-12 pb-4 sticky top-0 bg-background/90 backdrop-blur-xl z-10">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          {statusParam === 'known' ? 'Known Words' : statusParam === 'unknown' ? 'Learning' : 'All Words'}
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vocabulary..."
            className="pl-10 bg-card border-none rounded-xl h-12 text-base"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        {isLoading ? (
          <div className="space-y-2 mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : words?.length === 0 ? (
          <div className="text-center text-muted-foreground mt-20">
            No words found matching your search.
          </div>
        ) : (
          <div className="space-y-2 mt-4">
            {words?.map((word) => (
              <Link key={word.id} href={`/words/${word.id}`}>
                <div className="bg-card hover:bg-card/80 transition-colors p-4 rounded-xl flex items-center justify-between cursor-pointer border border-border/50">
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg">{word.word}</span>
                    <span className="text-sm text-muted-foreground max-w-[200px] truncate">{word.meaning}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {word.status === 'known' && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none">Known</Badge>
                    )}
                    {word.status === 'unknown' && (
                      <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-none">Learning</Badge>
                    )}
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
