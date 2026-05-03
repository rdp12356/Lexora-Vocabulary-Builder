import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createVaultMarker,
  deriveVaultKey,
  getOrCreateVaultSalt,
  hasVaultMarker,
  verifyVaultMarker,
} from "@/lib/crypto";

type VaultContextValue = {
  userId: string;
  key: CryptoKey | null;
  isUnlocked: boolean;
  isBusy: boolean;
  error: string | null;
  hasExistingVault: boolean;
  unlock: (passphrase: string) => Promise<void>;
  lock: () => void;
};

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingVault, setHasExistingVault] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHasExistingVault(hasVaultMarker(userId));
    setKey(null);
    setError(null);
  }, [userId]);

  const unlock = async (passphrase: string) => {
    const trimmed = passphrase.trim();
    if (!trimmed) {
      setError("Enter a vault passphrase.");
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      const salt = getOrCreateVaultSalt(userId);
      const derivedKey = await deriveVaultKey(trimmed, salt);
      const isValid = await verifyVaultMarker(userId, derivedKey);

      if (!isValid) {
        throw new Error("Invalid vault passphrase.");
      }

      setKey(derivedKey);
      setHasExistingVault(true);
    } catch (unlockError) {
      setError(unlockError instanceof Error ? unlockError.message : "Unable to unlock vault.");
    } finally {
      setIsBusy(false);
    }
  };

  const lock = () => {
    setKey(null);
  };

  const value = useMemo<VaultContextValue>(
    () => ({
      userId,
      key,
      isUnlocked: key !== null,
      isBusy,
      error,
      hasExistingVault,
      unlock,
      lock,
    }),
    [error, hasExistingVault, isBusy, key, userId],
  );

  return (
    <VaultContext.Provider value={value}>
      {children}
      {key === null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl px-6">
          <form
            className="w-full max-w-sm glass-card rounded-[2rem] p-6 border-white/10 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              void unlock(String(form.get("vault-passphrase") ?? ""));
            }}
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Vault</p>
              <h2 className="text-2xl font-black tracking-tighter">{hasExistingVault ? "Unlock your vault" : "Create your vault"}</h2>
              <p className="text-sm text-white/45 mt-2 leading-relaxed">
                Your word list is encrypted on the client. Enter the passphrase that unlocks this device's vault.
              </p>
            </div>

            <Input
              name="vault-passphrase"
              type="password"
              placeholder={hasExistingVault ? "Vault passphrase" : "Create a vault passphrase"}
              className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/25"
              autoComplete="current-password"
              data-testid="input-vault-passphrase"
            />

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isBusy}
              className="w-full h-11 rounded-xl font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/90"
              data-testid="button-unlock-vault"
            >
              {isBusy ? "Unlocking..." : hasExistingVault ? "Unlock vault" : "Create vault"}
            </Button>
          </form>
        </div>
      )}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);

  if (!context) {
    throw new Error("useVault must be used inside a VaultProvider");
  }

  return context;
}
