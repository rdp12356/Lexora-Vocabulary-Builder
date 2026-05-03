import { Router, type IRouter } from "express";
import { type AuthRequest } from "../middlewares/auth";
import { db } from "@workspace/db";
import { wordsTable, examplesTable, userWordStatusTable } from "@workspace/db";
import { eq, and, ilike, or, desc } from "drizzle-orm";
import {
  ListWordsQueryParams,
  GetWordParams,
  ListWordsResponse,
  GetWordResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/words", async (req: AuthRequest, res) => {
  const query = ListWordsQueryParams.parse(req.query);
  const userId = req.user?.id;

  // Fetch words with optional search filter
  let wordsQuery = db
    .select({
      id: wordsTable.id,
      word: wordsTable.word,
      meaning: wordsTable.meaning_advanced,
      partOfSpeech: wordsTable.partOfSpeech,
    })
    .from(wordsTable)
    .$dynamic();

  if (query.search) {
    wordsQuery = wordsQuery.where(
      or(
        ilike(wordsTable.word, `%${query.search}%`),
        ilike(wordsTable.meaning_advanced, `%${query.search}%`),
      ),
    );
  }

  wordsQuery = wordsQuery.orderBy(desc(wordsTable.id));

  if (query.limit) {
    wordsQuery = wordsQuery.limit(query.limit);
  }

  // Fetch user statuses only if userId exists
  const statusesPromise = userId
    ? db
        .select({ wordId: userWordStatusTable.wordId, status: userWordStatusTable.status })
        .from(userWordStatusTable)
        .where(eq(userWordStatusTable.userId, userId))
    : Promise.resolve([] as Array<{ wordId: number; status: string }>);

  // Execute both queries in parallel for better performance
  const [words, statuses] = await Promise.all([wordsQuery, statusesPromise]);
  const statusMap = new Map(statuses.map((s) => [s.wordId, s.status]));

  let result = words.map((w) => ({
    id: w.id,
    word: w.word,
    meaning: w.meaning,
    partOfSpeech: w.partOfSpeech,
    status: (statusMap.get(w.id) ?? null) as "known" | "unknown" | null,
  }));

  if (query.status && query.status !== "all") {
    result = result.filter((w) => w.status === query.status);
  }

  const parsed = ListWordsResponse.parse(result);
  res.json(parsed);
});

router.get("/words/:id", async (req: AuthRequest, res) => {
  const { id } = GetWordParams.parse(req.params);
  const userId = req.user?.id;

  const word = await db
    .select({
      id: wordsTable.id,
      word: wordsTable.word,
      meaning: wordsTable.meaning_advanced,
      partOfSpeech: wordsTable.partOfSpeech,
    })
    .from(wordsTable)
    .where(eq(wordsTable.id, id))
    .limit(1);

  if (!word.length) {
    res.status(404).json({ error: "Word not found" });
    return;
  }

  const examples = await db
    .select({
      id: examplesTable.id,
      wordId: examplesTable.wordId,
      type: examplesTable.type,
      sentence: examplesTable.sentence,
    })
    .from(examplesTable)
    .where(eq(examplesTable.wordId, id));

  let status = null;
  if (userId) {
    const statusRows = await db
      .select()
      .from(userWordStatusTable)
      .where(
        and(
          eq(userWordStatusTable.userId, userId),
          eq(userWordStatusTable.wordId, id),
        ),
      )
      .limit(1);

    status = statusRows[0]?.status ?? null;
  }

  const result = GetWordResponse.parse({
    ...word[0],
    examples,
    status,
  });

  res.json(result);
});

export default router;
