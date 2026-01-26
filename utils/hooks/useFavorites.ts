import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";

const KEY = "favorites:v1";

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  const set = (next: string[]) => setIds(Array.from(new Set(next)));

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) set(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(KEY, JSON.stringify(ids));
      } catch {}
    })();
  }, [ids]);

  const api = useMemo(() => {
    const has = (id: string) => ids.includes(id);
    const toggle = (id: string) =>
      setIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    const add = (id: string) =>
      setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    const remove = (id: string) =>
      setIds((prev) => prev.filter((x) => x !== id));
    const clear = () => setIds([]);

    return { ids, has, toggle, add, remove, clear };
  }, [ids]);

  return api;
}
