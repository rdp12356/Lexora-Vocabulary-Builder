import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Layers, Home } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/buckets", icon: Layers, label: "Buckets" },
  { href: "/words", icon: BookOpen, label: "Words" },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isSwipeMode = location === "/swipe";

  return (
    <div className="bg-black min-h-[100dvh] flex justify-center w-full">
      <div className="w-full max-w-[430px] bg-background relative flex flex-col shadow-2xl overflow-hidden min-h-[100dvh]">
        <main className={`flex-1 overflow-y-auto w-full relative ${isSwipeMode ? "h-[100dvh]" : ""}`}>
          {children}
        </main>

        {!isSwipeMode && (
          <nav className="sticky bottom-0 w-full z-50 bg-card/90 backdrop-blur-2xl border-t border-border/60">
            <div className="flex items-stretch justify-around h-[62px] px-3">
              {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                const isActive =
                  href === "/" ? location === "/" : location.startsWith(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative flex flex-col items-center justify-center w-20 gap-1"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-x-1 inset-y-2 rounded-xl"
                        style={{ background: "hsl(var(--primary) / 0.12)" }}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <motion.div
                      animate={{
                        color: isActive
                          ? "hsl(var(--primary))"
                          : "hsl(var(--muted-foreground))",
                        y: isActive ? -1 : 0,
                      }}
                      transition={{ duration: 0.15 }}
                      className="relative z-10"
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                    </motion.div>
                    <span
                      className={`relative z-10 text-[10px] font-semibold transition-colors ${isActive ? "text-primary" : "text-muted-foreground/70"}`}
                    >
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
