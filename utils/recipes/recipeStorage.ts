import AsyncStorage from "@react-native-async-storage/async-storage";

const RECIPES_KEY = "nommie_recipes";

export type Recipe = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  ingredients: string[];
  instructions: string[];
  photoUri?: string;
  createdAt: number;
  isFavorite?: boolean;
};

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
