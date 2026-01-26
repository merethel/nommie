import StyledButton from "@/components/common/StyledButton";
import { Text, View } from "@/components/Themed";
import { useFocusEffect } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import TodaysMealPlan from "@/components/home/TodaysMealPlan";
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
    <ScrollViewContainer>
      <Stack.Screen options={{ title: t("tabs.home") }} />

      <Text style={styles.title}>{t("home.today") || "Today"}</Text>

      <TodaysMealPlan meals={meals} />

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
    marginBottom: 12,
  },
  actionsBlock: {
    marginTop: 24,
  },
});
