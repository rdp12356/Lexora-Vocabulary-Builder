import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("Completing sign in...");

  useEffect(() => {
    let active = true;

    const finishAuth = async () => {
      const url = new URL(window.location.href);

      if (url.searchParams.has("code")) {
        const { error } = await supabase.auth.exchangeCodeForSession(url.toString());

        if (!active) return;

        if (error) {
          setMessage(error.message);
          setTimeout(() => setLocation("/login"), 1200);
          return;
        }
      }

      const next = url.searchParams.get("next") ?? "/";
      setLocation(next);
    };

    finishAuth();

    return () => {
      active = false;
    };
  }, [setLocation]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 text-white/50 text-xs font-black uppercase tracking-[0.3em]">
      {message}
    </div>
  );
}