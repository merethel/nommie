import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet } from "react-native";

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
};

export default function TabTwoScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const loadRecipes = useCallback(async () => {
    const json = await AsyncStorage.getItem(RECIPES_KEY);
    const data: Recipe[] = json ? JSON.parse(json) : [];
    setRecipes(data);
  }, []);

  // Reload every time you navigate back to this tab
  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes]),
  );

  return (
    <ScrollViewContainer>
      <Stack.Screen options={{ title: t(" ") }} />
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
          />
        ))
      )}
    </ScrollViewContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
});
