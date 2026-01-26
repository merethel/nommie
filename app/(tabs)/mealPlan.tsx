import { useFocusEffect } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import HeaderPillButton from "@/components/navigation/HeaderPillButton";
import { Text, View } from "@/components/Themed";

import MealPlanEditor from "@/components/mealPlan/MealPlanEditor";
import WeekOverviewStrip from "@/components/mealPlan/WeekOverviewStrip";

import {
  DayMealPlan,
  readMealPlanDay,
  todayKey,
} from "@/utils/mealPlan/mealPlanStorage";
import { weekDateKeysFrom } from "@/utils/mealPlan/weekUtils";

function weekdayLabels(t: (k: string) => string) {
  // keep simple + stable; replace with i18n if you want
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
}

export default function MealPlanTab() {
  const { t } = useTranslation();
  const today = useMemo(() => todayKey(), []);
  const weekKeys = useMemo(() => weekDateKeysFrom(new Date()), []);

  const [weekPlans, setWeekPlans] = useState<Record<string, DayMealPlan>>({});

  const loadWeek = useCallback(async () => {
    const pairs = await Promise.all(
      weekKeys.map(async (k) => [k, await readMealPlanDay(k)] as const),
    );
    const map: Record<string, DayMealPlan> = {};
    for (const [k, v] of pairs) map[k] = v;
    setWeekPlans(map);
  }, [weekKeys]);

  useFocusEffect(
    useCallback(() => {
      loadWeek();
    }, [loadWeek]),
  );

  const week = useMemo(() => {
    const labels = weekdayLabels(t);
    return weekKeys.map((k, i) => ({
      dateKey: k,
      label: labels[i] ?? k,
      isToday: k === today,
      plan: weekPlans[k] ?? {},
    }));
  }, [weekKeys, weekPlans, today, t]);

  return (
    <ScrollViewContainer
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>
            {t("meals.planTitle") || "Meal plan"}
          </Text>
          <Text style={styles.sub}>{t("meals.today") || "Today"}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <HeaderPillButton
            label={t("meals.calendar") || "Calendar"}
            onPress={() => router.push("/pages/mealPlan")}
          />
        </View>
      </View>

      {/* TODAY */}
      <View style={{ gap: 10 }}>
        <Text style={styles.sectionTitle}>Today</Text>
        <MealPlanEditor dateKey={today} />
      </View>

      {/* WEEK */}
      <WeekOverviewStrip
        week={week}
        onPressDay={(dateKey) =>
          router.push({
            pathname: "/pages/mealPlan/edit",
            params: { date: dateKey },
          })
        }
      />
    </ScrollViewContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 12, paddingBottom: 24, gap: 16 },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "800" },
  sub: { opacity: 0.7, marginTop: 4 },

  sectionTitle: { fontSize: 16, fontWeight: "800", opacity: 0.9 },
});
