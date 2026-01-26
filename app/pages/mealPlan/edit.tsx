import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import MealPlanEditor from "@/components/mealPlan/MealPlanEditor";
import { Text } from "@/components/Themed";

export default function MealPlanEditPage() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ date?: string }>();
  const dateKey = params.date ?? "";

  return (
    <ScrollViewContainer
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.container}
    >
      <Stack.Screen
        options={{ title: t("meals.editMealPlan") || "Edit meal plan" }}
      />

      <Text style={styles.title}>{dateKey}</Text>

      <MealPlanEditor dateKey={dateKey} />
    </ScrollViewContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 12, paddingBottom: 24 },
  title: { fontSize: 18, fontWeight: "800", marginBottom: 8, opacity: 0.85 },
});
