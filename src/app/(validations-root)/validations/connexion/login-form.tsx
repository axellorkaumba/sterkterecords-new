"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { loginAdmin } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Identifiant et mot de passe requis.",
  invalid_credentials: "Identifiant ou mot de passe incorrect.",
  unknown: "Une erreur est survenue — réessaie.",
};

export function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await loginAdmin(username, password);
      if (result?.error) {
        setError(ERROR_MESSAGES[result.error] ?? "Une erreur est survenue — réessaie.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error ? (
        <p role="alert" className="text-destructive text-small">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Identifiant</Label>
        <Input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      <Button type="submit" loading={isPending} loadingText="Connexion…">
        Se connecter
      </Button>
    </form>
  );
}
