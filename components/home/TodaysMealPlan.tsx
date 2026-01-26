import SmallCard from "@/components/common/SmallCard";
import StyledButton from "@/components/common/StyledButton";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { getRecipeById } from "@/utils/recipes/recipeStorage";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  View as RNView,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from "react-native";
import AddMealCard from "../common/AddMealCard";

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
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

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
    <View style={[styles.card]}>
      {/* Horizontal cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {meals.map((meal) => (
          <RNView key={meal.type} style={styles.mealCard}>
            <Text style={styles.mealLabel}>{labelFor(meal.type)}</Text>

            {meal.recipe ? (
              <SmallCard
                title={meal.recipe.title}
                onPress={() => openRecipe(meal.recipe!.id)}
              />
            ) : (
              <AddMealCard onPress={() => router.push("/pages/mealPlan")} />
            )}
          </RNView>
        ))}
      </ScrollView>

      {/* Change plan button */}
      <RNView style={styles.footer}>
        <StyledButton
          title={t("meals.todaysMealPlan") || "Change today's meal plan"}
          onPress={() => router.push("/pages/mealPlan")}
          size="small"
        />
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    paddingTop: 0,
    borderColor: "transparent",
  },

  scrollContent: {
    flexDirection: "row",
    gap: 20,
    paddingRight: 8,
  },

  mealCard: {
    width: 160,
    gap: 8,
  },

  mealLabel: {
    fontSize: 14,
    fontWeight: "700",
    opacity: 0.8,
    textAlign: "center",
  },

  footer: {},
});
