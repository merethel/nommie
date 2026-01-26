import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Keyboard, StyleSheet, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import CookedPodium from "@/components/home/CookedPodium";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import RecipeSearchBar from "@/components/recipes/RecipeSearchBar";
import RecipeSortBar, {
  RecipeSortMode,
} from "@/components/recipes/RecipeSortBar";
import { Text, View } from "@/components/Themed";

import Colors from "@/constants/Colors";
import { BOTTOM_NAV_HEIGHT, BOTTOM_NAV_MARGIN } from "@/constants/layout";
import { RECIPES_KEY } from "@/constants/storageKeys";
import { Recipe } from "@/src/types/recipe";
import { syncTodayMealPlanRecipe } from "@/utils/mealPlan/mealPlanStorage";
import {
  getTopCookedRecipes,
  TopCookedRecipe,
} from "@/utils/recipes/getTopCookedRecipes";
import { getCookedCount } from "@/utils/recipes/recipeCooked";
import { filterRecipes } from "@/utils/recipes/searchRecipes";
import { t } from "i18next";

/* ---------------- helpers ---------------- */

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

/* ---------------- screen ---------------- */

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const c = Colors[useColorScheme() ?? "light"];

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [cookedMap, setCookedMap] = useState<Record<string, number>>({});
  const [topCooked, setTopCooked] = useState<TopCookedRecipe[]>([]);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<RecipeSortMode>("newest");

  const load = useCallback(async () => {
    const all = await readRecipes();
    setRecipes(all);

    // cooked counts (for sorting)
    const pairs = await Promise.all(
      all.map(async (r) => [r.id, await getCookedCount(r.id)] as const),
    );
    const map: Record<string, number> = {};
    for (const [id, count] of pairs) map[id] = count;
    setCookedMap(map);

    // global podium (all-time)
    const top = await getTopCookedRecipes(3);
    setTopCooked(top);
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
  const showPodium = topCooked.length > 0;

  return (
    <ScrollViewContainer
      contentContainerStyle={[
        styles.container,
        {
          paddingBottom: BOTTOM_NAV_HEIGHT + BOTTOM_NAV_MARGIN + insets.bottom,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      // optional: also dismiss when user starts scrolling
      onScrollBeginDrag={Keyboard.dismiss}
    >
      {showPodium && (
        <CookedPodium
          items={topCooked}
          title={t("recipes.mostCooked") || "Most cooked"}
          onPressItem={(item) =>
            router.push({
              pathname: "/pages/recipes/recipeInfo",
              params: { id: item.id },
            })
          }
        />
      )}

      {/* separator*/}
      <View
        style={{
          marginBottom: -20,
        }}
      />

      {noFavoritesAtAll ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySub}>
            Tap the heart on a recipe to save it here.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.searchWrap}>
            <RecipeSearchBar
              query={query}
              onChangeQuery={setQuery}
              resultCount={sorted.length}
            />
          </View>

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
        </>
      )}
    </ScrollViewContainer>
  );
}

/* ---------------- styles ---------------- */

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },

  // ✅ more margin above the search bar
  searchWrap: {
    marginTop: 12,
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800" },
  emptySub: { opacity: 0.7, textAlign: "center" },

  helperText: {
    opacity: 0.7,
    paddingVertical: 12,
  },
});
