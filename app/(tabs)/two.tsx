import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet } from "react-native";

import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import { Text } from "@/components/Themed";
import { t } from "i18next";
import { RecipeCard } from "../../components/recipes/RecipeCard";

import RecipeSearchBar, {
  RecipeSearchScope,
} from "@/components/recipes/RecipeSearchBar";
import { filterRecipes } from "@/utils/recipes/searchRecipes";

const RECIPES_KEY = "nommie_recipes";

type Recipe = {
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

export default function TabTwoScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState("");

  const [scope, setScope] = useState<RecipeSearchScope>({
    text: true,
    tags: true,
    ingredients: true,
  });

  // derived UI state
  const allOff = !scope.text && !scope.tags && !scope.ingredients;
  const hasQuery = query.trim().length > 0;

  const loadRecipes = useCallback(async () => {
    const json = await AsyncStorage.getItem(RECIPES_KEY);
    const data: Recipe[] = json ? JSON.parse(json) : [];
    setRecipes(data);
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    // optimistic UI
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r)),
    );

    // persist
    const json = await AsyncStorage.getItem(RECIPES_KEY);
    const data: Recipe[] = json ? JSON.parse(json) : [];
    const next = data.map((r) =>
      r.id === id ? { ...r, isFavorite: !r.isFavorite } : r,
    );

    await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(next));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes]),
  );

  const filtered = useMemo(
    () => filterRecipes(recipes, query, scope),
    [recipes, query, scope],
  );

  return (
    <ScrollViewContainer contentContainerStyle={styles.container}>
      <Stack.Screen />

      {/* Search + filters */}
      <RecipeSearchBar
        query={query}
        onChangeQuery={setQuery}
        scope={scope}
        onChangeScope={setScope}
        resultCount={filtered.length}
      />

      {/* Results / empty states */}
      {allOff && hasQuery ? (
        <Text style={styles.helperText}>
          {t("recipes.turnOnFilter") ||
            "Choose at least one filter (Text / Tags / Ingredients)."}
        </Text>
      ) : filtered.length === 0 ? (
        <Text>
          {t("recipes.emptySearch") || "No recipes found for your search."}
        </Text>
      ) : (
        filtered.map((r) => (
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
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  helperText: {
    opacity: 0.7,
    paddingVertical: 12,
  },
});
