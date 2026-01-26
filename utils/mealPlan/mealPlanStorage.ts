import { MEAL_PLANS_KEY } from "@/constants/storageKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type MealType = "breakfast" | "lunch" | "dinner";

export type PlannedRecipeRef = {
  id: string;
  title: string;
  photoUri?: string;
};

export type DayMealPlan = {
  breakfast?: PlannedRecipeRef | null;
  lunch?: PlannedRecipeRef | null;
  dinner?: PlannedRecipeRef | null;
};

export type MealPlansByDate = Record<string, DayMealPlan>; // YYYY-MM-DD => plan

export function dateKeyFromDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey() {
  return dateKeyFromDate(new Date());
}

async function readAll(): Promise<MealPlansByDate> {
  const raw = await AsyncStorage.getItem(MEAL_PLANS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as MealPlansByDate;
  } catch {
    return {};
  }
}

async function writeAll(next: MealPlansByDate) {
  await AsyncStorage.setItem(MEAL_PLANS_KEY, JSON.stringify(next));
}

function normalizeDay(plan: DayMealPlan): DayMealPlan {
  const cleaned: DayMealPlan = {};
  if (plan.breakfast) cleaned.breakfast = plan.breakfast;
  if (plan.lunch) cleaned.lunch = plan.lunch;
  if (plan.dinner) cleaned.dinner = plan.dinner;
  return cleaned;
}

export async function readMealPlansByDate(): Promise<MealPlansByDate> {
  return readAll();
}

export async function readMealPlanDay(dateKey: string): Promise<DayMealPlan> {
  const all = await readAll();
  return all[dateKey] ?? {};
}

export async function writeMealPlanDay(dateKey: string, plan: DayMealPlan) {
  const all = await readAll();
  const cleaned = normalizeDay(plan);

  const isEmpty = !cleaned.breakfast && !cleaned.lunch && !cleaned.dinner;

  const nextAll: MealPlansByDate = { ...all };
  if (isEmpty) delete nextAll[dateKey];
  else nextAll[dateKey] = cleaned;

  await writeAll(nextAll);
}

export async function clearMealPlanDay(dateKey: string) {
  const all = await readAll();
  const nextAll: MealPlansByDate = { ...all };
  delete nextAll[dateKey];
  await writeAll(nextAll);
}

export async function copyMealPlanDay(fromDateKey: string, toDateKey: string) {
  const from = await readMealPlanDay(fromDateKey);
  await writeMealPlanDay(toDateKey, from);
}

/* ---- compatibility: keep your existing today functions ---- */

export async function readTodayMealPlan(): Promise<DayMealPlan> {
  return readMealPlanDay(todayKey());
}

export async function writeTodayMealPlan(plan: DayMealPlan) {
  return writeMealPlanDay(todayKey(), plan);
}
