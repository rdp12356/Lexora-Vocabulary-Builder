import { useGetStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

export default function Buckets() {
  const { data: stats, isLoading } = useGetStats();

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Word Buckets</h1>
        <p className="text-muted-foreground">Manage your vocabulary collection.</p>
      </header>

      <div className="px-6 flex flex-col gap-4">
        <Link href="/words?status=known">
          <Card className="bg-card border-none shadow-sm hover:scale-[1.02] transition-transform cursor-pointer">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Known Words</h3>
                  <p className="text-muted-foreground">Words you've mastered</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-green-500">
                {isLoading ? "-" : stats?.knownWords || 0}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/words?status=unknown">
          <Card className="bg-card border-none shadow-sm hover:scale-[1.02] transition-transform cursor-pointer">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <XCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Learning</h3>
                  <p className="text-muted-foreground">Words to review</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-red-500">
                {isLoading ? "-" : stats?.unknownWords || 0}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
