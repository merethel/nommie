import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

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
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: t("tabs.recipes") }} />
      <Text style={styles.title}>{t("recipes.title")}</Text>

      {recipes.length === 0 ? (
        <Text>{t("recipes.empty")}</Text>
      ) : (
        recipes.map((r) => (
          <RecipeCard
            key={r.id}
            title={r.title}
            description={r.description}
            ingredients={r.ingredients}
            instructions={r.instructions}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
});
