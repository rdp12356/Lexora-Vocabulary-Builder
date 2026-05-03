import { Router, type IRouter } from "express";
import { type AuthRequest } from "../middlewares/auth";
import { db } from "@workspace/db";
import { wordsTable, userWordStatusTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  RecordSwipeParams,
  RecordSwipeBody,
  RecordSwipeResponse,
  UpdateWordStatusParams,
  UpdateWordStatusBody,
  UpdateWordStatusResponse,
  GetSwipeQueueResponse,
  GetDailyLessonResponse,
  GetStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Middleware to require authentication
const requireAuth = (req: AuthRequest, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

router.get("/swipe", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const [allWords, statuses] = await Promise.all([
    db
      .select({
        id: wordsTable.id,
        word: wordsTable.word,
        meaning: wordsTable.meaning,
        partOfSpeech: wordsTable.partOfSpeech,
      })
      .from(wordsTable),
    db
      .select({ wordId: userWordStatusTable.wordId, status: userWordStatusTable.status })
      .from(userWordStatusTable)
      .where(eq(userWordStatusTable.userId, userId)),
  ]);

  const statusMap = new Map(statuses.map((s) => [s.wordId, s.status]));

  const unknownWords = allWords.filter(
    (w) => !statusMap.has(w.id) || statusMap.get(w.id) === "unknown",
  );
  const knownWords = allWords.filter((w) => statusMap.get(w.id) === "known");

  // Include all unknown words + ~20% of known words
  const knownSample = knownWords
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.ceil(knownWords.length * 0.2));

  const queue = [...unknownWords, ...knownSample].sort(
    () => Math.random() - 0.5,
  );

  const result = GetSwipeQueueResponse.parse(
    queue.map((w) => ({
      id: w.id,
      word: w.word,
      meaning: w.meaning,
      partOfSpeech: w.partOfSpeech,
      status: (statusMap.get(w.id) ?? null) as "known" | "unknown" | null,
    })),
  );

  res.json(result);
});

router.post("/swipe/:wordId", requireAuth, async (req: AuthRequest, res) => {
  const { wordId } = RecordSwipeParams.parse(req.params);
  const body = RecordSwipeBody.parse(req.body);
  const userId = req.user!.id;

  const existing = await db
    .select()
    .from(userWordStatusTable)
    .where(
      and(
        eq(userWordStatusTable.userId, userId),
        eq(userWordStatusTable.wordId, wordId),
      ),
    )
    .limit(1);

  let statusRow;

  if (existing.length) {
    const updated = await db
      .update(userWordStatusTable)
      .set({ status: body.status, updatedAt: new Date() })
      .where(
        and(
          eq(userWordStatusTable.userId, userId),
          eq(userWordStatusTable.wordId, wordId),
        ),
      )
      .returning();
    statusRow = updated[0];
  } else {
    const inserted = await db
      .insert(userWordStatusTable)
      .values({ userId, wordId, status: body.status })
      .returning();
    statusRow = inserted[0];
  }

  const result = RecordSwipeResponse.parse({
    wordId: statusRow!.wordId,
    status: statusRow!.status,
    updatedAt: statusRow!.updatedAt,
  });

  res.json(result);
});

router.put("/user-words/:wordId", requireAuth, async (req: AuthRequest, res) => {
  const { wordId } = UpdateWordStatusParams.parse(req.params);
  const body = UpdateWordStatusBody.parse(req.body);
  const userId = req.user!.id;

  const existing = await db
    .select()
    .from(userWordStatusTable)
    .where(
      and(
        eq(userWordStatusTable.userId, userId),
        eq(userWordStatusTable.wordId, wordId),
      ),
    )
    .limit(1);

  let statusRow;

  if (existing.length) {
    const updated = await db
      .update(userWordStatusTable)
      .set({ status: body.status, updatedAt: new Date() })
      .where(
        and(
          eq(userWordStatusTable.userId, userId),
          eq(userWordStatusTable.wordId, wordId),
        ),
      )
      .returning();
    statusRow = updated[0];
  } else {
    const inserted = await db
      .insert(userWordStatusTable)
      .values({ userId, wordId, status: body.status })
      .returning();
    statusRow = inserted[0];
  }

  const result = UpdateWordStatusResponse.parse({
    wordId: statusRow!.wordId,
    status: statusRow!.status,
    updatedAt: statusRow!.updatedAt,
  });

  res.json(result);
});

router.get("/daily-lesson", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const [allWords, statuses] = await Promise.all([
    db
      .select({
        id: wordsTable.id,
        word: wordsTable.word,
        meaning: wordsTable.meaning,
        partOfSpeech: wordsTable.partOfSpeech,
      })
      .from(wordsTable),
    db
      .select({ wordId: userWordStatusTable.wordId, status: userWordStatusTable.status })
      .from(userWordStatusTable)
      .where(eq(userWordStatusTable.userId, userId)),
  ]);

  const statusMap = new Map(statuses.map((s) => [s.wordId, s.status]));

  const DAILY_LIMIT = 5;

  const unknownWords = allWords
    .filter((w) => !statusMap.has(w.id) || statusMap.get(w.id) === "unknown")
    .sort(() => Math.random() - 0.5);

  const knownWords = allWords
    .filter((w) => statusMap.get(w.id) === "known")
    .sort(() => Math.random() - 0.5);

  const picked = [
    ...unknownWords.slice(0, DAILY_LIMIT),
    ...knownWords.slice(0, Math.max(0, DAILY_LIMIT - unknownWords.length)),
  ].slice(0, DAILY_LIMIT);

  const lessonWords = picked.map((w) => ({
    id: w.id,
    word: w.word,
    meaning: w.meaning,
    partOfSpeech: w.partOfSpeech,
    status: (statusMap.get(w.id) ?? null) as "known" | "unknown" | null,
  }));

  const result = GetDailyLessonResponse.parse({
    words: lessonWords,
    date: new Date().toISOString().split("T")[0],
  });

  res.json(result);
});

router.get("/stats", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const [totalWords, statuses] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(wordsTable),
    db
      .select({ status: userWordStatusTable.status })
      .from(userWordStatusTable)
      .where(eq(userWordStatusTable.userId, userId)),
  ]);

  const knownWords = statuses.filter((s) => s.status === "known").length;
  const unknownWords = statuses.filter((s) => s.status === "unknown").length;
  const total = totalWords[0]?.count ?? 0;
  const unstudiedWords = total - knownWords - unknownWords;

  const result = GetStatsResponse.parse({
    totalWords: total,
    knownWords,
    unknownWords,
    unstudiedWords,
    streakDays: 1,
  });

  res.json(result);
});

export default router;
