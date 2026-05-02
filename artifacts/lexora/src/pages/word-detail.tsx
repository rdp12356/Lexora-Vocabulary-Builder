import { useParams, Link } from "wouter";
import { useGetWord, useUpdateWordStatus, getGetWordQueryKey, getListWordsQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WordDetail() {
  const { id } = useParams();
  const wordId = Number(id);
  const queryClient = useQueryClient();

  const { data: word, isLoading } = useGetWord(wordId, { 
    query: { enabled: !!wordId, queryKey: getGetWordQueryKey(wordId) } 
  });
  
  const updateStatus = useUpdateWordStatus();

  const handleToggleStatus = () => {
    if (!word) return;
    const newStatus = word.status === "known" ? "unknown" : "known";
    
    updateStatus.mutate({ wordId, data: { status: newStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWordQueryKey(wordId) });
        queryClient.invalidateQueries({ queryKey: getListWordsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
        <div className="h-16 w-3/4 bg-muted rounded-xl animate-pulse" />
        <div className="h-24 w-full bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!word) {
    return <div className="p-6 text-center mt-20">Word not found</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="p-6 flex items-center justify-between">
        <Link href="/words">
          <Button variant="ghost" size="icon" className="rounded-full bg-card">
            <ArrowLeft size={24} />
          </Button>
        </Link>
      </header>

      <div className="px-6 flex-1">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-primary/20 text-primary border-none uppercase tracking-widest px-3 py-1 text-xs">
              {word.partOfSpeech}
            </Badge>
            {word.status === 'known' && <Badge className="bg-green-500/10 text-green-500 border-none">Known</Badge>}
            {word.status === 'unknown' && <Badge className="bg-red-500/10 text-red-500 border-none">Learning</Badge>}
          </div>
          <h1 className="text-5xl font-bold mb-4">{word.word}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">{word.meaning}</p>
        </div>

        {word.examples && word.examples.length > 0 && (
          <div className="space-y-6 mb-12">
            <h2 className="text-lg font-semibold border-b border-border pb-2">Examples</h2>
            {word.examples.map((example) => (
              <div key={example.id} className="bg-card p-5 rounded-2xl border border-border/50 relative">
                <Badge variant="outline" className="absolute -top-3 left-4 bg-background text-xs font-normal">
                  {example.type}
                </Badge>
                <p className="text-lg italic text-card-foreground">"{example.sentence}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 pt-0 mt-auto">
        <Button 
          size="lg" 
          onClick={handleToggleStatus}
          disabled={updateStatus.isPending}
          className={`w-full h-14 text-lg rounded-2xl shadow-lg transition-colors ${
            word.status === 'known' 
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-none' 
              : 'bg-primary text-primary-foreground shadow-primary/20'
          }`}
        >
          {word.status === 'known' ? (
            <>
              <XCircle className="mr-2" size={20} /> Mark as Learning
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2" size={20} /> Mark as Known
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
