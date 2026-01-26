import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Keyboard, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { Text } from "@/components/Themed";

import RecipeSearchBar from "@/components/recipes/RecipeSearchBar";
import RecipeSortBar, {
  RecipeSortMode,
} from "@/components/recipes/RecipeSortBar";

import { BOTTOM_NAV_HEIGHT, BOTTOM_NAV_MARGIN } from "@/constants/layout";
import { RECIPES_KEY } from "@/constants/storageKeys";
import { Recipe } from "@/src/types/recipe";
import { getCookedCount } from "@/utils/recipes/recipeCooked";
import { filterRecipes } from "@/utils/recipes/searchRecipes";

export default function TabTwoScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<RecipeSortMode>("newest");
  const [cookedMap, setCookedMap] = useState<Record<string, number>>({});

  const insets = useSafeAreaInsets();

  const loadRecipes = useCallback(async () => {
    const json = await AsyncStorage.getItem(RECIPES_KEY);
    const data: Recipe[] = json ? JSON.parse(json) : [];
    setRecipes(data);

    // cooked counts (for mostCooked sorting)
    const pairs = await Promise.all(
      data.map(async (r) => [r.id, await getCookedCount(r.id)] as const),
    );
    const nextMap: Record<string, number> = {};
    for (const [id, count] of pairs) nextMap[id] = count;
    setCookedMap(nextMap);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes]),
  );

  const toggleFavorite = useCallback(async (id: string) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r)),
    );

    const json = await AsyncStorage.getItem(RECIPES_KEY);
    const data: Recipe[] = json ? JSON.parse(json) : [];
    const next = data.map((r) =>
      r.id === id ? { ...r, isFavorite: !r.isFavorite } : r,
    );

    await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(next));
  }, []);

  const filtered = useMemo(
    () => filterRecipes(recipes, query),
    [recipes, query],
  );

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      if (sortMode === "az")
        return (a.title ?? "").localeCompare(b.title ?? "");
      if (sortMode === "mostCooked")
        return (cookedMap[b.id] ?? 0) - (cookedMap[a.id] ?? 0);

      const ta = a.favoritedAt ?? a.createdAt ?? 0;
      const tb = b.favoritedAt ?? b.createdAt ?? 0;
      return tb - ta;
    });
    return arr;
  }, [filtered, sortMode, cookedMap]);

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
        <Stack.Screen />

        <RecipeSearchBar
          query={query}
          onChangeQuery={setQuery}
          resultCount={sorted.length}
        />

        <RecipeSortBar value={sortMode} onChange={setSortMode} />

        {sorted.length === 0 ? (
          <Text>No results</Text>
        ) : (
          sorted.map((r) => (
            <RecipeCard
              key={r.id}
              id={r.id}
              title={r.title}
              description={r.description}
              tags={r.tags}
              ingredients={r.ingredients}
              instructions={r.instructions}
              photoUri={r.photoUri}
              isFavorite={!!r.isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}
      </ScrollViewContainer>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 12 },
});
