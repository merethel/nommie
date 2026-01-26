import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { DayMealPlan } from "@/utils/mealPlan/mealPlanStorage";

type WeekDayItem = {
  dateKey: string; // YYYY-MM-DD
  label: string; // Mon, Tue...
  isToday: boolean;
  plan: DayMealPlan;
};

export default function WeekOverviewStrip({
  week,
  onPressDay,
}: {
  week: WeekDayItem[];
  onPressDay: (dateKey: string) => void;
}) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  const plannedCount = useMemo(() => {
    return week.reduce((acc, d) => {
      const hasAny = !!d.plan?.breakfast || !!d.plan?.lunch || !!d.plan?.dinner;
      return acc + (hasAny ? 1 : 0);
    }, 0);
  }, [week]);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.hTitle}>This week</Text>
        <Text style={[styles.hSub, { color: c.muted }]}>
          {plannedCount} / 7 days planned
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
      >
        {week.map((d) => {
          const b = d.plan?.breakfast;
          const l = d.plan?.lunch;
          const di = d.plan?.dinner;

          return (
            <Pressable
              key={d.dateKey}
              onPress={() => onPressDay(d.dateKey)}
              style={[
                styles.row,
                d.isToday
                  ? {
                      backgroundColor:
                        scheme === "dark"
                          ? "rgba(242,184,75,0.10)"
                          : "rgba(242,184,75,0.08)",
                    }
                  : null,
              ]}
            >
              <View style={styles.left}>
                <Text
                  style={[
                    styles.dayLabel,
                    d.isToday ? styles.dayLabelToday : null,
                  ]}
                >
                  {d.label}
                </Text>
                <Text style={[styles.dateKey, { color: c.muted }]}>
                  {d.dateKey.slice(5)}
                </Text>
              </View>

              <View style={styles.meals}>
                <MealDot label="B" filled={!!b} />
                <MealDot label="L" filled={!!l} />
                <MealDot label="D" filled={!!di} />
              </View>

              <Ionicons name="chevron-forward" size={16} color={c.muted} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MealDot({ label, filled }: { label: string; filled: boolean }) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  return (
    <View
      style={[
        styles.dot,
        {
          borderColor: c.border,
          backgroundColor: filled ? "rgba(242,184,75,0.35)" : "transparent",
        },
      ]}
    >
      <Text style={[styles.dotText, { color: c.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  hTitle: { fontSize: 16, fontWeight: "800" },
  hSub: { fontSize: 12, opacity: 0.9 },

  card: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  left: { width: 86 },
  dayLabel: { fontSize: 14, fontWeight: "800" },
  dayLabelToday: { color: "#F2B84B" },
  dateKey: { marginTop: 2, fontSize: 12, opacity: 0.8 },

  meals: { flex: 1, flexDirection: "row", gap: 8, alignItems: "center" },

  dot: {
    width: 30,
    height: 26,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dotText: { fontSize: 11, fontWeight: "800" },
});
