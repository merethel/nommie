import StyledButton from "@/components/common/StyledButton";
import { Text, View } from "@/components/Themed";
import { getRecipeById } from "@/utils/recipes/recipeStorage";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet } from "react-native";

export type MealType = "breakfast" | "lunch" | "dinner";

export type MealSlot = {
  type: MealType;
  recipe?: {
    id: string;
    title: string;
  };
};

type Props = {
  meals: MealSlot[];
};

export default function TodaysMealPlan({ meals }: Props) {
  const { t } = useTranslation();

  const labelFor = (type: MealType) => {
    switch (type) {
      case "breakfast":
        return t("meals.breakfast") || "Breakfast";
      case "lunch":
        return t("meals.lunch") || "Lunch";
      case "dinner":
        return t("meals.dinner") || "Dinner";
    }
  };

  const openRecipe = async (id: string) => {
    const recipe = await getRecipeById(id);
    if (!recipe) return;

    router.push({
      pathname: "/pages/recipes/recipeInfo",
      params: {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description ?? "",
        tags: JSON.stringify(recipe.tags ?? []),
        ingredients: JSON.stringify(recipe.ingredients ?? []),
        instructions: JSON.stringify(recipe.instructions ?? []),
        photoUri:
          recipe.photoUri ??
          "/Users/merethe/Desktop/Apps/nommie/assets/images/default_images/default1.jpg",
      },
    });
  };

  return (
    <View style={styles.card}>
      {meals.map((meal) => (
        <View key={meal.type} style={styles.mealRow}>
          <Text style={styles.mealLabel}>{labelFor(meal.type)}</Text>

          {meal.recipe ? (
            <View style={styles.mealFilled}>
              <Text style={styles.recipeTitle}>{meal.recipe.title}</Text>

              <View style={styles.actions}>
                <Pressable onPress={() => openRecipe(meal.recipe!.id)}>
                  <Text style={styles.actionText}>
                    {t("common.open") || "Open"}
                  </Text>
                </Pressable>

                <Pressable onPress={() => router.push("/pages/mealPlan")}>
                  <Text style={styles.actionText}>
                    {t("common.swap") || "Swap"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <StyledButton
              title={t("meals.planMeal") || "Plan meal"}
              onPress={() => router.push("/pages/mealPlan")}
              size="small"
            />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 14,
  },
  mealRow: { gap: 6 },
  mealLabel: { fontSize: 14, fontWeight: "700", opacity: 0.8 },
  mealFilled: { gap: 6 },
  recipeTitle: { fontSize: 16, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 16 },
  actionText: { fontSize: 13, fontWeight: "600", opacity: 0.7 },
});
