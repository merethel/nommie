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

  // ✅ if everything is off, match nothing
  if (!scope.text && !scope.tags && !scope.ingredients) return [];

  return recipes.filter((r) => {
    const matchesText =
      scope.text && includesAllTokens(`${r.title} ${r.description}`, tokens);

    const matchesTags =
      scope.tags && includesAllTokens((r.tags ?? []).join(" "), tokens);

    const matchesIngredients =
      scope.ingredients &&
      includesAllTokens((r.ingredients ?? []).join(" "), tokens);

    return matchesText || matchesTags || matchesIngredients;
  });
}
