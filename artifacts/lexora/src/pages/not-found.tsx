import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-full w-full flex items-center justify-center p-6">
      <div className="glass-card w-full max-w-sm rounded-[2rem] p-8 text-center border-white/5">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 mx-auto mb-6 border border-red-500/10">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-xl font-black tracking-tighter text-glow mb-2">404 Loss of Signal</h1>
        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-8">
          The requested coordinate does not exist.
        </p>
        <Link href="/">
          <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[11px] bg-primary">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
