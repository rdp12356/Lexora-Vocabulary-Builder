import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { wordsTable, examplesTable, userWordStatusTable } from "@workspace/db";
import { eq, and, ilike, or } from "drizzle-orm";
import {
  ListWordsQueryParams,
  GetWordParams,
  ListWordsResponse,
  GetWordResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const GUEST_USER_ID = "guest";

router.get("/words", async (req, res) => {
  const query = ListWordsQueryParams.parse(req.query);
  const userId = GUEST_USER_ID;

  let wordsQuery = db.select().from(wordsTable).$dynamic();

  if (query.search) {
    wordsQuery = wordsQuery.where(
      or(
        ilike(wordsTable.word, `%${query.search}%`),
        ilike(wordsTable.meaning, `%${query.search}%`),
      ),
    );
  }

  const words = await wordsQuery;

  const statuses = await db
    .select()
    .from(userWordStatusTable)
    .where(eq(userWordStatusTable.userId, userId));

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

router.get("/words/:id", async (req, res) => {
  const { id } = GetWordParams.parse(req.params);
  const userId = GUEST_USER_ID;

  const word = await db
    .select()
    .from(wordsTable)
    .where(eq(wordsTable.id, id))
    .limit(1);

  if (!word.length) {
    res.status(404).json({ error: "Word not found" });
    return;
  }

  const examples = await db
    .select()
    .from(examplesTable)
    .where(eq(examplesTable.wordId, id));

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

  const status = statusRows[0]?.status ?? null;

  const result = GetWordResponse.parse({
    ...word[0],
    examples,
    status,
  });

  res.json(result);
});

export default router;
