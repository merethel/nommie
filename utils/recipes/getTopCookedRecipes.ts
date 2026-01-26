import { RECIPES_KEY } from "@/constants/storageKeys";
import { Recipe } from "@/src/types/recipe";
import { getCookedCount } from "@/utils/recipes/recipeCooked";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type TopCookedRecipe = {
  id: string;
  title: string;
  cookedCount: number;
  photoUri?: string;
};

async function readRecipes(): Promise<Recipe[]> {
  const raw = await AsyncStorage.getItem(RECIPES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Recipe[];
  } catch {
    return [];
  }
}

export async function getTopCookedRecipes(
  limit = 3,
): Promise<TopCookedRecipe[]> {
  const recipes = await readRecipes();
  if (!recipes.length) return [];

  const withCounts = await Promise.all(
    recipes.map(async (r) => ({
      id: r.id,
      title: r.title ?? "",
      photoUri: r.photoUri ?? "",
      cookedCount: await getCookedCount(r.id),
    })),
  );

  return withCounts
    .filter((r) => r.title.trim().length > 0)
    .filter((r) => r.cookedCount > 0)
    .sort((a, b) => b.cookedCount - a.cookedCount)
    .slice(0, limit);
}
