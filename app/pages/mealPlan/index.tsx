import { useFocusEffect } from "@react-navigation/native";
import { Stack, router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";

import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import { Text, View } from "@/components/Themed";
import {
  readMealPlansByDate,
  todayKey,
} from "@/utils/mealPlan/mealPlanStorage";

export default function MealPlanCalendarPage() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<Record<string, any>>({});

  const load = useCallback(async () => {
    const all = await readMealPlansByDate();
    setPlans(all);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    for (const key of Object.keys(plans)) {
      const p = plans[key];
      const hasAny = !!p?.breakfast || !!p?.lunch || !!p?.dinner;
      if (!hasAny) continue;
      marks[key] = { marked: true, dotColor: "#F2B84B" };
    }
    const tk = todayKey();
    marks[tk] = {
      ...(marks[tk] ?? {}),
      selected: true,
      selectedColor: "rgba(242,184,75,0.18)",
    };
    return marks;
  }, [plans]);

  return (
    <ScrollViewContainer contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: t("meals.calendar") || "Calendar" }} />

      <View style={styles.header}>
        <Text style={styles.sub}>
          {t("meals.tapDayToEdit") || "Tap a day to edit meal plan"}
        </Text>
      </View>

      <View style={styles.calendarWrap}>
        <Calendar
          markedDates={markedDates}
          onDayPress={(day) => {
            router.push({
              pathname: "/pages/mealPlan/edit",
              params: { date: day.dateString },
            });
          }}
        />
      </View>
    </ScrollViewContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 12, paddingBottom: 24 },
  header: { marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "800" },
  sub: { opacity: 0.7, marginTop: 50 },
  calendarWrap: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    overflow: "hidden",
  },
});
