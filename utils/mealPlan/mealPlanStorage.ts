import AsyncStorage from "@react-native-async-storage/async-storage";

export type MealType = "breakfast" | "lunch" | "dinner";

export type PlannedRecipeRef = {
  id: string;
  title: string;
};

export type DayMealPlan = {
  breakfast?: PlannedRecipeRef | null;
  lunch?: PlannedRecipeRef | null;
  dinner?: PlannedRecipeRef | null;
};

const KEY_PREFIX = "nommie_mealplan_";

// local timezone YYYY-MM-DD
function getLocalISODateString(d: Date) {
  return d.toLocaleDateString("en-CA");
}

export function getMealPlanKeyForDate(date: Date) {
  return `${KEY_PREFIX}${getLocalISODateString(date)}`;
}

export function getTodayMealPlanKey() {
  return getMealPlanKeyForDate(new Date());
}

export async function readTodayMealPlan(): Promise<DayMealPlan> {
  const raw = await AsyncStorage.getItem(getTodayMealPlanKey());
  if (!raw) return {};
  try {
    return JSON.parse(raw) as DayMealPlan;
  } catch {
    return {};
  }
}

export async function writeTodayMealPlan(plan: DayMealPlan) {
  await AsyncStorage.setItem(getTodayMealPlanKey(), JSON.stringify(plan));
}

export async function setTodayMealSlot(
  type: MealType,
  recipe: PlannedRecipeRef | null,
): Promise<DayMealPlan> {
  const current = await readTodayMealPlan();
  const next: DayMealPlan = { ...current, [type]: recipe };
  await writeTodayMealPlan(next);
  return next;
}
