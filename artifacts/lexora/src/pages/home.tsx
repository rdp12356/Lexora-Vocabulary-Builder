import { useGetDailyLesson, useGetStats } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Brain, Flame, Target } from "lucide-react";

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: dailyLesson, isLoading: lessonLoading } = useGetDailyLesson();

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Lexora</h1>
          {stats && (
            <div className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full font-medium">
              <Flame size={16} />
              <span>{stats.streakDays}</span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground">Your daily vocabulary ritual.</p>
      </header>

      <div className="px-6 space-y-8 pb-12">
        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <Card className="bg-card border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Target size={16} />
                <span className="text-sm font-medium">Known Words</span>
              </div>
              <div className="text-3xl font-bold">
                {statsLoading ? "-" : stats?.knownWords}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Brain size={16} />
                <span className="text-sm font-medium">Total Studied</span>
              </div>
              <div className="text-3xl font-bold">
                {statsLoading ? "-" : ((stats?.knownWords || 0) + (stats?.unknownWords || 0))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Daily Lesson Preview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Today's Lesson</h2>
            <span className="text-sm text-muted-foreground font-medium">
              {lessonLoading ? "-" : dailyLesson?.words?.length} words
            </span>
          </div>

          <div className="space-y-3 mb-6">
            {lessonLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
              ))
            ) : dailyLesson?.words && dailyLesson.words.length > 0 ? (
              dailyLesson.words.slice(0, 3).map((word) => (
                <div key={word.id} className="p-4 rounded-xl bg-card border border-border/50 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{word.word}</div>
                    <div className="text-sm text-muted-foreground">{word.partOfSpeech}</div>
                  </div>
                  <div className="text-sm text-right max-w-[150px] truncate text-muted-foreground">
                    {word.meaning}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-muted-foreground bg-card rounded-xl border border-border/50">
                No words available right now.
              </div>
            )}
          </div>

          <Link href="/swipe" className="block">
            <Button size="lg" className="w-full h-14 text-lg font-medium shadow-primary/20 shadow-lg rounded-2xl">
              Start Swipe Mode
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
