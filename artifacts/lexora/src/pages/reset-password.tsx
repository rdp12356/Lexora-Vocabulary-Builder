import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Lexora | Reset Password";
  }, []);

  const handleReset = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsBusy(true);
    setError(null);

    const { error: authError } = await supabase.auth.updateUser({ password });

    setIsBusy(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setMessage("Password updated. Redirecting to sign in...");
    await supabase.auth.signOut();
    setTimeout(() => setLocation("/login"), 1000);
  };

  return (
    <div className="min-h-[100dvh] px-6 py-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm glass-card rounded-[2rem] p-6 border-white/5"
      >
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Lexora</p>
          <h1 className="text-3xl font-black tracking-tighter text-glow">Set new password</h1>
          <p className="text-sm text-white/40 mt-2">Choose a new password for your account.</p>
        </div>

        <div className="space-y-3">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/25"
            autoComplete="new-password"
          />
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/25"
            autoComplete="new-password"
          />

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          {message && (
            <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
              {message}
            </div>
          )}

          <Button
            onClick={handleReset}
            disabled={isBusy || !password || !confirmPassword}
            className="w-full h-11 rounded-xl font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/90"
          >
            <ArrowRight size={14} />
            {isBusy ? "Saving..." : "Update password"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}