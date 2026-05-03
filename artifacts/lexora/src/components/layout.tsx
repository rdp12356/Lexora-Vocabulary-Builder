import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Layers, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Session } from "@supabase/supabase-js";
import { VaultProvider } from "@/components/vault-provider";

export function Layout({
  children,
  session,
  onSignOut,
}: {
  children: ReactNode;
  session: Session;
  onSignOut: () => void | Promise<void>;
}) {
  const [location] = useLocation();
  const isSwipeMode = location === "/swipe";
  const isAdmin = session.user.app_metadata?.role === "admin";

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Home" },
    { href: "/buckets", icon: Layers, label: "Buckets" },
    { href: "/words", icon: BookOpen, label: "Words" },
    ...(isAdmin ? [{ href: "/admin", icon: ShieldCheck, label: "Admin" }] : []),
  ];

  return (
    <VaultProvider userId={session.user.id}>
      <div className="bg-[#030303] min-h-[100dvh] flex justify-center w-full">
        <div className="w-full max-w-[430px] bg-background relative flex flex-col min-h-[100dvh]">
          <div className="absolute top-5 right-5 z-40">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="glass-card rounded-full px-3 h-9 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white"
              data-testid="button-sign-out"
            >
              <LogOut size={12} />
              {session.user.email ? session.user.email.split("@")[0] : "Sign out"}
            </Button>
          </div>
          <main className={`flex-1 overflow-y-auto w-full relative ${isSwipeMode ? "h-[100dvh]" : "pb-24"}`}>
            {children}
          </main>

          {!isSwipeMode && (
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] z-50">
              <div className="glass-card rounded-[2rem] flex items-center justify-around h-16 px-4">
                {navItems.map(({ href, icon: Icon, label }) => {
                  const isActive =
                    href === "/"
                      ? location === "/"
                      : location.startsWith(href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      className="relative flex flex-col items-center justify-center w-12 h-12"
                      data-testid={`nav-${label.toLowerCase()}`}
                    >
                      <motion.div
                        animate={{ 
                          color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                          scale: isActive ? 1.1 : 1
                        }}
                        transition={{ duration: 0.15 }}
                        className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10' : 'hover:bg-white/5'}`}
                      >
                        <Icon
                          size={20}
                          className={isActive ? "text-primary" : "text-muted-foreground"}
                        />
                      </motion.div>
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary shadow-[0_0_10px_rgba(139,92,246,1)]"
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>
          )}
        </div>
      </div>
    </VaultProvider>
  );
}
