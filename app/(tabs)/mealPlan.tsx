import { Stack, router } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import MealPlanEditor from "@/components/mealPlan/MealPlanEditor";
import HeaderPillButton from "@/components/navigation/HeaderPillButton";
import { Text, View } from "@/components/Themed";
import { todayKey } from "@/utils/mealPlan/mealPlanStorage";

export default function MealPlanTab() {
  const { t } = useTranslation();
  const dateKey = useMemo(() => todayKey(), []);

  return (
    <ScrollViewContainer
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>
            {t("meals.planTitle") || "Meal plan"}
          </Text>
          <Text style={styles.sub}>{t("meals.today") || "Today"}</Text>
        </View>

        <HeaderPillButton
          label={t("meals.calendar") || "Calendar"}
          onPress={() => router.push("/pages/mealPlan")}
        />
      </View>

      <MealPlanEditor dateKey={dateKey} />
    </ScrollViewContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 12, paddingBottom: 24 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "800" },
  sub: { opacity: 0.7, marginTop: 4 },
});
