"use client";

import * as React from "react";

export type Identified = { id: string };

export function useCollection<T extends Identified>(endpoint: string, initial: T[]) {
  const [items, setItems] = React.useState<T[]>(initial);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) throw new Error(await response.text());
      setItems((await response.json()) as T[]);
    } catch (cause) {
      setError(String(cause));
    }
  }, [endpoint]);

  const create = React.useCallback(
    async (payload: Record<string, unknown>) => {
      setPending(true);
      setError(null);
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(await response.text());
        const row = (await response.json()) as T;
        setItems((current) => [row, ...current]);
        return row;
      } catch (cause) {
        setError(String(cause));
        return null;
      } finally {
        setPending(false);
      }
    },
    [endpoint]
  );

  const update = React.useCallback(
    async (id: string, payload: Record<string, unknown>) => {
      setPending(true);
      setError(null);
      try {
        const response = await fetch(`${endpoint}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(await response.text());
        const row = (await response.json()) as T;
        setItems((current) => current.map((item) => (item.id === id ? row : item)));
        return row;
      } catch (cause) {
        setError(String(cause));
        return null;
      } finally {
        setPending(false);
      }
    },
    [endpoint]
  );

  const remove = React.useCallback(
    async (id: string) => {
      setPending(true);
      setError(null);
      try {
        const response = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error(await response.text());
        setItems((current) => current.filter((item) => item.id !== id));
        return true;
      } catch (cause) {
        setError(String(cause));
        return false;
      } finally {
        setPending(false);
      }
    },
    [endpoint]
  );

  return { items, setItems, create, update, remove, refresh, pending, error };
}
