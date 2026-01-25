import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import { Text } from "@/components/Themed";
import { t } from "i18next";
import { RecipeCard } from "../../components/recipes/RecipeCard";

const RECIPES_KEY = "nommie_recipes";

type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  photoUri?: string;
  createdAt: number;
  isFavorite?: boolean; // ✅ add this
};

export default function TabTwoScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const loadRecipes = useCallback(async () => {
    const json = await AsyncStorage.getItem(RECIPES_KEY);
    const data: Recipe[] = json ? JSON.parse(json) : [];
    setRecipes(data);
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    // optimistic UI update
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

  // Reload every time you navigate back to this tab
  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes]),
  );

  return (
    <ScrollViewContainer>
      <Stack.Screen />
      {recipes.length === 0 ? (
        <Text>{t("recipes.empty")}</Text>
      ) : (
        recipes.map((r) => (
          <RecipeCard
            key={r.id}
            id={r.id}
            title={r.title}
            description={r.description}
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
