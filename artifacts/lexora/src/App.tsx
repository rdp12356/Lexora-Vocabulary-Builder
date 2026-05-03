import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import type { Session } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import Swipe from "@/pages/swipe";
import Buckets from "@/pages/buckets";
import WordList from "@/pages/word-list";
import WordDetail from "@/pages/word-detail";
import NotFound from "@/pages/not-found";
import Login from "./pages/login";
import Register from "./pages/register";
import ForgotPassword from "./pages/forgot-password";
import AuthCallback from "./pages/auth-callback";
import ResetPassword from "./pages/reset-password";
import Admin from "./pages/admin";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import { supabase } from "@/lib/supabase";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 mins
      gcTime: 30 * 60 * 1000, // 30 minutes - cache garbage collected after 30 mins
      retry: 1, // Retry once on failure
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    },
  },
});

function hasAdminRole(session: Session | null) {
  const role = session?.user.app_metadata?.role;
  const roles = session?.user.app_metadata?.roles;

  return role === "admin" || (Array.isArray(roles) && roles.includes("admin"));
}

setBaseUrl(import.meta.env.VITE_API_URL ?? null);

function AppRoutes() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [location, setLocation] = useLocation();
  const isAuthCallbackRoute = location === "/auth/callback";
  const isResetPasswordRoute = location === "/reset-password";
  const isAdminRoute = location === "/admin";
  const isPublicAuthRoute =
    location === "/login" ||
    location === "/register" ||
    location === "/forgot-password";
  const isAdmin = hasAdminRole(session);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setIsLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setIsLoadingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setAuthTokenGetter(async () => session?.access_token ?? null);

    if (session) {
      void queryClient.invalidateQueries({ queryKey: ["/api/daily-lesson"] });
      void queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    }

    return () => setAuthTokenGetter(null);
  }, [session]);

  useEffect(() => {
    if (!isLoadingSession && !session && !(isPublicAuthRoute || isAuthCallbackRoute || isResetPasswordRoute)) {
      setLocation("/login");
    }

    if (!isLoadingSession && session) {
      if (!isAdmin && isAdminRoute) {
        setLocation("/");
      } else if (isPublicAuthRoute) {
        setLocation("/");
      }
    }
  }, [
    isAdmin,
    isAdminRoute,
    isAuthCallbackRoute,
    isLoadingSession,
    isPublicAuthRoute,
    isResetPasswordRoute,
    location,
    session,
    setLocation,
  ]);

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    setLocation("/login");
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/40 text-xs font-black uppercase tracking-[0.3em]">
        Loading...
      </div>
    );
  }

  if (isAuthCallbackRoute) {
    return <AuthCallback />;
  }

  if (isResetPasswordRoute) {
    return <ResetPassword />;
  }

  if (isAdminRoute && !isAdmin) {
    return <NotFound />;
  }

  if (!session) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route component={Login} />
      </Switch>
    );
  }

  return (
    <Layout session={session} onSignOut={signOut}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/swipe" component={Swipe} />
        <Route path="/buckets" component={Buckets} />
        <Route path="/words" component={WordList} />
        <Route path="/words/:id" component={WordDetail} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  return <AppRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
