import StyledButton from "@/components/common/StyledButton";
import { View } from "@/components/Themed";
import { useFocusEffect } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, useColorScheme } from "react-native";

import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import CookedPodium from "@/components/home/CookedPodium";
import QuickActionsRow from "@/components/home/QuickActionsRow";
import TopHeroCarousel from "@/components/home/TopHeroCarousel";

import Colors from "@/constants/Colors";
import { MealType, readTodayMealPlan } from "@/utils/mealPlan/mealPlanStorage";
import {
  getTopCookedRecipes,
  TopCookedRecipe,
} from "@/utils/recipes/getTopCookedRecipes";

type MealSlot = {
  type: MealType;
  recipe?: { id: string; title: string };
};

export default function TabOneScreen() {
  const { t } = useTranslation();

  const [meals, setMeals] = useState<MealSlot[]>([
    { type: "breakfast" },
    { type: "lunch" },
    { type: "dinner" },
  ]);

  const [topCooked, setTopCooked] = useState<TopCookedRecipe[]>([]);

  const c = Colors[useColorScheme() ?? "light"];

  const loadToday = useCallback(async () => {
    const plan = await readTodayMealPlan();

    setMeals([
      { type: "breakfast", recipe: plan.breakfast ?? undefined },
      { type: "lunch", recipe: plan.lunch ?? undefined },
      { type: "dinner", recipe: plan.dinner ?? undefined },
    ]);

    const top = await getTopCookedRecipes(3);
    setTopCooked(top);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadToday();
    }, [loadToday]),
  );

  return (
    <ScrollViewContainer
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 0, marginTop: 0 }}
    >
      <Stack.Screen />

      <View style={{ flex: 1, marginHorizontal: -16 }}>
        <TopHeroCarousel meals={meals} height={240} />
      </View>

      <View style={styles.editPlanWrap}>
        <StyledButton
          title={t("meals.todaysMealPlan") || "Edit meal plan"}
          onPress={() => router.push("/pages/mealPlan")}
          style={[styles.editPlanButton, { backgroundColor: c.card }]}
        />
      </View>

      <QuickActionsRow />

      {topCooked.length > 0 && (
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
    </ScrollViewContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  actionsBlock: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  editPlanWrap: {
    width: "110%",
    padding: 0,
    marginTop: -13,
    marginLeft: -16,
  },
  editPlanButton: {
    padding: 0,
    margin: 0,
    width: "100%",
    marginTop: 0,
    borderRadius: 0,
    textAlign: "center",
    alignContent: "center",
    alignItems: "center",
  },
  addRecipeText: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
  },
});
