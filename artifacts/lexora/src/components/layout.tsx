import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Layers, Home } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/buckets", icon: Layers, label: "Words" },
  { href: "/words", icon: BookOpen, label: "Library" },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isSwipeMode = location === "/swipe";

  return (
    <div className="bg-black min-h-[100dvh] flex justify-center w-full">
      <div className="w-full max-w-[430px] relative flex flex-col shadow-2xl overflow-hidden min-h-[100dvh]"
        style={{ background: "hsl(248 25% 4%)" }}>

        {/* ── Ambient background orbs ── */}
        <div className="fixed inset-0 max-w-[430px] pointer-events-none overflow-hidden z-0">
          <div className="orb-a absolute -top-[15%] -left-[20%] w-[70%] aspect-square rounded-full"
            style={{ background: "radial-gradient(circle, hsl(258 90% 55% / 0.28), transparent 70%)" }} />
          <div className="orb-b absolute top-[35%] -right-[25%] w-[60%] aspect-square rounded-full"
            style={{ background: "radial-gradient(circle, hsl(280 80% 55% / 0.20), transparent 70%)" }} />
          <div className="orb-c absolute -bottom-[10%] left-[10%] w-[55%] aspect-square rounded-full"
            style={{ background: "radial-gradient(circle, hsl(220 100% 55% / 0.18), transparent 70%)" }} />
        </div>

        <main className={`flex-1 overflow-y-auto w-full relative z-10 ${isSwipeMode ? "h-[100dvh]" : ""}`}>
          {children}
        </main>

        <AnimatePresence>
          {!isSwipeMode && (
            <motion.nav
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="sticky bottom-0 w-full z-50 glass-nav"
            >
              <div className="flex items-stretch justify-around h-[62px] px-3">
                {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                  const isActive =
                    href === "/" ? location === "/" : location.startsWith(href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      className="relative flex flex-col items-center justify-center w-24 gap-1"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-x-1 inset-y-1.5 rounded-xl"
                          style={{ background: "rgba(147, 100, 255, 0.15)", border: "1px solid rgba(147, 100, 255, 0.2)" }}
                          transition={{ type: "spring", stiffness: 500, damping: 38 }}
                        />
                      )}
                      <motion.div
                        animate={{ color: isActive ? "hsl(258 90% 75%)" : "rgba(255,255,255,0.35)", y: isActive ? -1 : 0 }}
                        transition={{ duration: 0.18 }}
                        className="relative z-10"
                      >
                        <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
                      </motion.div>
                      <span className={`relative z-10 text-[10px] font-semibold transition-colors ${isActive ? "text-primary/90" : "text-white/30"}`}>
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
