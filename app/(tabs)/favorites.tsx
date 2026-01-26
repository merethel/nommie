import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { Keyboard, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import RecipeSearchBar from "@/components/recipes/RecipeSearchBar";
import RecipeSortBar, {
  RecipeSortMode,
} from "@/components/recipes/RecipeSortBar";
import { Text, View } from "@/components/Themed";

import { BOTTOM_NAV_HEIGHT, BOTTOM_NAV_MARGIN } from "@/constants/layout";
import { RECIPES_KEY } from "@/constants/storageKeys";
import { Recipe } from "@/src/types/recipe";
import { syncTodayMealPlanRecipe } from "@/utils/mealPlan/mealPlanStorage";
import { getCookedCount } from "@/utils/recipes/recipeCooked";
import { filterRecipes } from "@/utils/recipes/searchRecipes";

async function readRecipes(): Promise<Recipe[]> {
  const raw = await AsyncStorage.getItem(RECIPES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Recipe[];
  } catch {
    return [];
  }
}

async function writeRecipes(recipes: Recipe[]) {
  await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [cookedMap, setCookedMap] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<RecipeSortMode>("newest");

  const load = useCallback(async () => {
    const all = await readRecipes();
    setRecipes(all);

    // cooked counts only for favorites
    const favs = all.filter((r) => !!r.isFavorite);
    const pairs = await Promise.all(
      favs.map(async (r) => [r.id, await getCookedCount(r.id)] as const),
    );

    const nextMap: Record<string, number> = {};
    for (const [id, count] of pairs) nextMap[id] = count;
    setCookedMap(nextMap);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const favoritesOnly = useMemo(
    () => recipes.filter((r) => !!r.isFavorite),
    [recipes],
  );

  // ✅ NO scope anymore
  const searched = useMemo(
    () => filterRecipes(favoritesOnly, query),
    [favoritesOnly, query],
  );

  const sorted = useMemo(() => {
    const arr = [...searched];

    arr.sort((a, b) => {
      if (sortMode === "az") {
        return (a.title ?? "").localeCompare(b.title ?? "");
      }
      if (sortMode === "mostCooked") {
        return (cookedMap[b.id] ?? 0) - (cookedMap[a.id] ?? 0);
      }
      const ta = a.favoritedAt ?? a.createdAt ?? 0;
      const tb = b.favoritedAt ?? b.createdAt ?? 0;
      return tb - ta;
    });

    return arr;
  }, [searched, sortMode, cookedMap]);

  const toggleFavorite = useCallback(async (id: string) => {
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = !r.isFavorite;
        return {
          ...r,
          isFavorite: next,
          favoritedAt: next ? Date.now() : undefined,
        };
      }),
    );

    const all = await readRecipes();
    const next = all.map((r) => {
      if (r.id !== id) return r;
      const nextFav = !r.isFavorite;
      return {
        ...r,
        isFavorite: nextFav,
        favoritedAt: nextFav ? Date.now() : undefined,
      };
    });

    await writeRecipes(next);
  }, []);

  const addToMealPlan = useCallback(
    async (id: string) => {
      const r = recipes.find((x) => x.id === id);
      if (!r) return;

      await syncTodayMealPlanRecipe({
        id: r.id,
        title: r.title ?? "",
        photoUri: r.photoUri ?? "",
      });
    },
    [recipes],
  );

  const noFavoritesAtAll = favoritesOnly.length === 0;

  if (noFavoritesAtAll) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptySub}>
          Tap the heart on a recipe to save it here.
        </Text>
      </View>
    );
  }

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <ScrollViewContainer
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom:
              BOTTOM_NAV_HEIGHT + BOTTOM_NAV_MARGIN + insets.bottom,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <RecipeSearchBar
          query={query}
          onChangeQuery={setQuery}
          resultCount={sorted.length}
        />

        {/* ✅ Reusable sort component */}
        <RecipeSortBar value={sortMode} onChange={setSortMode} />

        {sorted.length === 0 ? (
          <Text style={styles.helperText}>No matches.</Text>
        ) : (
          sorted.map((r) => (
            <RecipeCard
              key={r.id}
              id={r.id}
              title={r.title}
              description={r.description}
              tags={r.tags ?? []}
              ingredients={r.ingredients ?? []}
              instructions={r.instructions ?? []}
              photoUri={r.photoUri}
              isFavorite={!!r.isFavorite}
              onToggleFavorite={toggleFavorite}
              onAddToMealPlan={addToMealPlan}
            />
          ))
        )}
      </ScrollViewContainer>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },

  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800" },
  emptySub: { marginTop: 8, opacity: 0.7, textAlign: "center" },

  helperText: {
    opacity: 0.7,
    paddingVertical: 12,
  },
});
