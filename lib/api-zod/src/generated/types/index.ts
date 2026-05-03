// CLEAN TYPE DEFINITIONS (NO ZOD MIX)

export type Status = "known" | "unknown";

export interface Example {
  id: number;
  wordId: number;
  type: "casual" | "professional";
  sentence: string;
}

export interface Word {
  id: number;
  word: string;
  meaning: string;
  partOfSpeech: string;
}

export interface WordWithStatus extends Word {
  status?: Status;
}

export interface WordDetail extends Word {
  examples: Example[];
  status?: Status;
}

export interface UserWordStatus {
  wordId: number;
  status: Status;
  updatedAt: Date;
}

export interface UserStats {
  totalWords: number;
  knownWords: number;
  unknownWords: number;
  unstudiedWords: number;
  streakDays: number;
}

export interface DailyLesson {
  words: WordWithStatus[];
  date: Date;
}

export interface ListWordsParams {
  search?: string;
  status?: Status | "all";
}

export interface SwipeBody {
  status: Status;
}

export interface UpdateWordStatusBody {
  status: Status;
}

export interface HealthStatus {
  status: string;
}