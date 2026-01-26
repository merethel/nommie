import AsyncStorage from "@react-native-async-storage/async-storage";

const COOKED_PREFIX = "nommie_cooked_count:";

function keyFor(id: string) {
  return `${COOKED_PREFIX}${id}`;
}

export async function getCookedCount(id: string): Promise<number> {
  const raw = await AsyncStorage.getItem(keyFor(id));
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

export async function setCookedCount(
  id: string,
  count: number,
): Promise<number> {
  const next = Math.max(0, Math.floor(count));
  await AsyncStorage.setItem(keyFor(id), String(next));
  return next;
}

export async function incrementCookedCount(id: string): Promise<number> {
  const current = await getCookedCount(id);
  return setCookedCount(id, current + 1);
}

export async function decrementCookedCount(id: string): Promise<number> {
  const current = await getCookedCount(id);
  return setCookedCount(id, current - 1);
}
