import { type Request, type Response, type NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabase";

type SupabaseUser = NonNullable<Awaited<ReturnType<typeof supabaseAdmin.auth.getUser>>["data"]["user"]>;

const authCache = new Map<string, { user: SupabaseUser; expiresAt: number }>();
const AUTH_CACHE_TTL_MS = 5 * 60 * 1000;

function buildAuthUser(user: SupabaseUser) {
  return {
    id: user.id,
    email: user.email ?? undefined,
    isAdmin:
      user.app_metadata?.role === "admin" ||
      (Array.isArray(user.app_metadata?.roles) && user.app_metadata.roles.includes("admin")),
  };
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    isAdmin?: boolean;
  };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      // Allow guest access for certain endpoints
      req.user = undefined;
      return next();
    }

    const cached = authCache.get(token);
    if (cached && cached.expiresAt > Date.now()) {
      req.user = buildAuthUser(cached.user);
      return next();
    }

    // Verify the JWT token with Supabase and cache the result briefly to avoid repeated round-trips.
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    authCache.set(token, { user, expiresAt: Date.now() + AUTH_CACHE_TTL_MS });
    req.user = buildAuthUser(user);

    next();
  } catch (err) {
    res.status(500).json({ error: "Authentication error" });
  }
}
