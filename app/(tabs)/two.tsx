import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Keyboard, Pressable, StyleSheet } from "react-native";

import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import { Text } from "@/components/Themed";
import { t } from "i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RecipeCard } from "../../components/recipes/RecipeCard";

import RecipeSearchBar, {
  RecipeSearchScope,
} from "@/components/recipes/RecipeSearchBar";
import { BOTTOM_NAV_HEIGHT, BOTTOM_NAV_MARGIN } from "@/constants/layout";
import { RECIPES_KEY } from "@/constants/storageKeys";
import { Recipe } from "@/src/types/recipe";
import { filterRecipes } from "@/utils/recipes/searchRecipes";

export default function TabTwoScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState("");

  const [scope, setScope] = useState<RecipeSearchScope>({
    text: true,
    tags: true,
    ingredients: true,
  });

  const allOff = !scope.text && !scope.tags && !scope.ingredients;
  const hasQuery = query.trim().length > 0;
  const insets = useSafeAreaInsets();
  const loadRecipes = useCallback(async () => {
    const json = await AsyncStorage.getItem(RECIPES_KEY);
    const data: Recipe[] = json ? JSON.parse(json) : [];
    setRecipes(data);
  }, []);

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
          scope={scope}
          onChangeScope={setScope}
          resultCount={filtered.length}
        />

        {allOff && hasQuery ? (
          <Text style={styles.helperText}>{t("recipes.turnOnFilter")}</Text>
        ) : filtered.length === 0 ? (
          <Text>{t("recipes.emptySearch")}</Text>
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
  helperText: {
    opacity: 0.7,
    paddingVertical: 12,
  },
});
