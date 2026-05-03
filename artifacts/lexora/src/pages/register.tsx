import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Chrome, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { getAuthCallbackUrl } from "@/lib/auth";

export default function Register() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Lexora | Register";
  }, []);

  const handleRegister = async () => {
    setIsBusy(true);
    setError(null);
    setMessage(null);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    setIsBusy(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setMessage("Account created. Check your email to confirm and finish signing in.");
    setLocation("/login");
  };

  const handleGoogleLogin = async () => {
    setIsBusy(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackUrl(),
      },
    });

    setIsBusy(false);

    if (authError) {
      setError(authError.message);
    }
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
          <h1 className="text-3xl font-black tracking-tighter text-glow">Create account</h1>
          <p className="text-sm text-white/40 mt-2">Start saving progress with a new Supabase account.</p>
        </div>

        <div className="space-y-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/25"
            autoComplete="email"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
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
            onClick={handleRegister}
            disabled={isBusy || !email || !password}
            className="w-full h-11 rounded-xl font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/90"
          >
            <ArrowRight size={14} />
            {isBusy ? "Creating..." : "Create account"}
          </Button>

          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isBusy}
            className="w-full h-11 rounded-xl font-black uppercase tracking-[0.2em] border-white/10 text-white/80"
          >
            <Chrome size={14} />
            Continue with Google
          </Button>

          <div className="flex items-center justify-between pt-1 text-[10px] uppercase tracking-[0.25em] text-white/35 font-black">
            <Link href="/login" className="hover:text-white transition-colors">
              Back to sign in
            </Link>
            <Link href="/forgot-password" className="hover:text-white transition-colors">
              Forgot password
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}