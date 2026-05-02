import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wordsTable = pgTable("words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  meaning: text("meaning").notNull(),
  partOfSpeech: text("part_of_speech").notNull(),
});

export const examplesTable = pgTable("examples", {
  id: serial("id").primaryKey(),
  wordId: integer("word_id")
    .notNull()
    .references(() => wordsTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // casual | professional
  sentence: text("sentence").notNull(),
});

export const userWordStatusTable = pgTable("user_word_status", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  wordId: integer("word_id")
    .notNull()
    .references(() => wordsTable.id, { onDelete: "cascade" }),
  status: text("status").notNull(), // known | unknown
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWordSchema = createInsertSchema(wordsTable).omit({ id: true });
export const insertExampleSchema = createInsertSchema(examplesTable).omit({ id: true });
export const insertUserWordStatusSchema = createInsertSchema(userWordStatusTable).omit({ id: true, updatedAt: true });

export type InsertWord = z.infer<typeof insertWordSchema>;
export type Word = typeof wordsTable.$inferSelect;
export type InsertExample = z.infer<typeof insertExampleSchema>;
export type Example = typeof examplesTable.$inferSelect;
export type InsertUserWordStatus = z.infer<typeof insertUserWordStatusSchema>;
export type UserWordStatus = typeof userWordStatusTable.$inferSelect;
