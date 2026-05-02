import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Copy, Layers, LayoutDashboard } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const isSwipeMode = location === "/swipe";

  return (
    <div className="bg-black min-h-[100dvh] flex justify-center w-full">
      <div className="w-full max-w-[430px] bg-background relative flex flex-col shadow-2xl overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full relative">
          {children}
        </main>

        {/* Bottom Nav - Hidden in swipe mode */}
        {!isSwipeMode && (
          <nav className="sticky bottom-0 w-full bg-card/80 backdrop-blur-xl border-t border-border z-50">
            <div className="flex items-center justify-around h-16 px-4">
              <NavItem href="/" icon={<LayoutDashboard size={22} />} active={location === "/"} label="Home" />
              <NavItem href="/buckets" icon={<Layers size={22} />} active={location === "/buckets"} label="Buckets" />
              <NavItem href="/words" icon={<BookOpen size={22} />} active={location.startsWith("/words")} label="Words" />
            </div>
            {/* Safe area padding for mobile */}
            <div className="h-safe-bottom" />
          </nav>
        )}
      </div>
    </div>
  );
}

function NavItem({ href, icon, active, label }: { href: string; icon: ReactNode; active: boolean; label: string }) {
  return (
    <Link href={href} className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
      {icon}
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </Link>
  );
}
