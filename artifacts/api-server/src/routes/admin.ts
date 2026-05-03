import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, insertWordSchema, wordsTable } from "@workspace/db";
import { type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

const batchWordsSchema = z.object({
  words: z.array(insertWordSchema).min(1).max(5),
});

function requireAdmin(req: AuthRequest, res: any, next: any) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

router.post("/admin/words/batch", requireAdmin, async (req: AuthRequest, res) => {
  const body = batchWordsSchema.parse(req.body);

  const inserted = await db.insert(wordsTable).values(body.words).returning();

  res.status(201).json({
    added: inserted,
    count: inserted.length,
  });
});

export default router;