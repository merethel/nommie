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

export function filterRecipes<T extends RecipeLike>(
  recipes: T[],
  query: string,
  scope: RecipeSearchScope,
) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return recipes;

  // safety: if everything off, behave like text search
  const useText =
    scope.text || (!scope.text && !scope.tags && !scope.ingredients);
  const useTags = scope.tags;
  const useIng = scope.ingredients;

  return recipes.filter((r) => {
    const matchesText =
      useText && includesAllTokens(`${r.title} ${r.description}`, tokens);

    const matchesTags =
      useTags && includesAllTokens((r.tags ?? []).join(" "), tokens);

    const matchesIngredients =
      useIng && includesAllTokens((r.ingredients ?? []).join(" "), tokens);

    return matchesText || matchesTags || matchesIngredients;
  });
}
