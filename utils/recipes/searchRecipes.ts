import { Recipe } from "@/src/types/recipe";

// utils/recipes/searchRecipes.ts
export type RecipeSearchScope = {
  text: boolean; // title + description
  tags: boolean;
  ingredients: boolean;
};

type RecipeLike = {
  title: string;
  description: string;
  tags: string[];
  ingredients: string[];
};

function normalize(s: string) {
  return (s ?? "").toLowerCase().trim();
}

function tokenize(q: string) {
  return normalize(q).split(/\s+/).filter(Boolean);
}

function includesAllTokens(haystack: string, tokens: string[]) {
  const h = normalize(haystack);
  return tokens.every((tok) => h.includes(tok));
}

export function filterRecipes(recipes: Recipe[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return recipes;

  return recipes.filter((r) => {
    const haystack = [
      r.title,
      r.description,
      (r.tags ?? []).join(" "),
      (r.ingredients ?? []).join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}
