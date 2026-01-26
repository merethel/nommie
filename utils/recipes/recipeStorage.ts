import { RECIPES_KEY } from "@/constants/storageKeys";
import { Recipe } from "@/src/types/recipe";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function readRecipes(): Promise<Recipe[]> {
  const raw = await AsyncStorage.getItem(RECIPES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Recipe[];
  } catch {
    return [];
  }
}

export async function getRecipeById(id: string): Promise<Recipe | undefined> {
  const recipes = await readRecipes();
  return recipes.find((r) => r.id === id);
}
