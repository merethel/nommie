import StyledButton from "@/components/common/StyledButton";
import { View } from "@/components/Themed";
import { useFocusEffect } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import TopHeroCarousel from "@/components/home/TopHeroCarousel";
import { MealType, readTodayMealPlan } from "@/utils/mealPlan/mealPlanStorage";

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

  const loadToday = useCallback(async () => {
    const plan = await readTodayMealPlan();
    setMeals([
      { type: "breakfast", recipe: plan.breakfast ?? undefined },
      { type: "lunch", recipe: plan.lunch ?? undefined },
      { type: "dinner", recipe: plan.dinner ?? undefined },
    ]);
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
      <View style={styles.actionsBlock}>
        <StyledButton
          title={t("createRecipe.screenTitle")}
          onPress={() => router.push("../pages/recipes/createRecipe")}
        />
      </View>
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
  },
});
