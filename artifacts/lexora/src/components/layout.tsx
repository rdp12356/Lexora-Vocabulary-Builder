import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Layers, LayoutDashboard } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
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
          <nav className="sticky bottom-0 w-full z-50 border-t border-border/50 bg-card/80 backdrop-blur-xl">
            <div className="flex items-center justify-around h-[60px] px-2">
              {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                const isActive =
                  href === "/"
                    ? location === "/"
                    : location.startsWith(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative flex flex-col items-center justify-center w-20 h-full gap-1"
                    data-testid={`nav-${label.toLowerCase()}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute top-1 w-10 h-0.5 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <motion.div
                      animate={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
                      transition={{ duration: 0.15 }}
                    >
                      <Icon
                        size={21}
                        className={isActive ? "text-primary" : "text-muted-foreground"}
                      />
                    </motion.div>
                    <span
                      className={`text-[10px] font-medium tracking-wide transition-colors ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
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
