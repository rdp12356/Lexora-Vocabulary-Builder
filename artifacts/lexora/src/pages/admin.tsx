import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { encryptVaultWord, type VaultWordRecord } from "@/lib/crypto";
import { useVault } from "@/components/vault-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type WordDraft = {
  word: string;
  meaning: string;
  partOfSpeech: string;
};

const emptyDrafts: WordDraft[] = Array.from({ length: 5 }).map(() => ({
  word: "",
  meaning: "",
  partOfSpeech: "noun",
}));

export default function Admin() {
  const [words, setWords] = useState<WordDraft[]>(emptyDrafts);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { key } = useVault();

  useEffect(() => {
    document.title = "Lexora | Admin";
  }, []);

  const updateWord = (index: number, key: keyof WordDraft, value: string) => {
    setWords((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  };

  const handleSubmit = async () => {
    const payload = words
      .map((item) => ({
        word: item.word.trim(),
        meaning: item.meaning.trim(),
        partOfSpeech: item.partOfSpeech.trim(),
      }))
      .filter((item) => item.word && item.meaning && item.partOfSpeech);

    if (!payload.length) {
      setError("Add at least one complete word before submitting.");
      return;
    }

    if (payload.length > 5) {
      setError("You can add at most 5 words at a time.");
      return;
    }

    setIsBusy(true);
    setError(null);
    setMessage(null);

    if (!key) {
      setError("Unlock the vault before adding words.");
      setIsBusy(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      setError("You must be signed in to add words.");
      setIsBusy(false);
      return;
    }

    try {
      const encryptedWords: VaultWordRecord[] = await Promise.all(
        payload.map((word, idx) =>
          encryptVaultWord(
            {
              id: idx,
              ...word,
              status: null,
            },
            key,
          ),
        ),
      );

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/words/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ words: encryptedWords }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Failed to add words.");
        return;
      }

      setWords(emptyDrafts);
      setMessage(`${payload.length} words added.`);
    } catch {
      setError("Failed to add words.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-[100dvh] px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Admin</p>
          <h1 className="text-3xl font-black tracking-tighter text-glow">Add up to 5 words</h1>
          <p className="text-sm text-white/40 mt-2">Submit a batch of new vocabulary for the daily pool.</p>
        </div>

        <div className="space-y-3">
          {words.map((item, index) => (
            <div key={index} className="glass-card rounded-2xl p-4 space-y-3 border-white/5">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Word {index + 1}</div>
              <Input
                value={item.word}
                onChange={(e) => updateWord(index, "word", e.target.value)}
                placeholder="Word"
                className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/25"
              />
              <Input
                value={item.meaning}
                onChange={(e) => updateWord(index, "meaning", e.target.value)}
                placeholder="Meaning"
                className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/25"
              />
              <Input
                value={item.partOfSpeech}
                onChange={(e) => updateWord(index, "partOfSpeech", e.target.value)}
                placeholder="Part of speech"
                className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/25"
              />
            </div>
          ))}
        </div>

        {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</div>}
        {message && <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">{message}</div>}

        <Button
          onClick={handleSubmit}
          disabled={isBusy}
          className="w-full h-11 rounded-xl font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/90"
        >
          <Plus size={14} />
          {isBusy ? "Saving..." : "Add words"}
        </Button>
      </motion.div>
    </div>
  );
}