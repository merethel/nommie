import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { DEFAULT_RECIPE_IMAGE } from "@/constants/images";
import { PlannedRecipeRef } from "@/utils/mealPlan/mealPlanStorage";
import { t } from "i18next";

export default function MealPlanSlotCard({
  icon,
  label,
  recipe,
  hint,
  onPress,
  onSwap,
  onClear,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  recipe?: PlannedRecipeRef | null;
  hint?: string;
  onPress: () => void; // choose or open
  onSwap?: () => void;
  onClear?: () => void;
}) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: c.card,
          borderColor: c.border,
        },
      ]}
    >
      <View style={[styles.topRow, { backgroundColor: c.card }]}>
        <View style={[styles.labelRow, { backgroundColor: c.card }]}>
          <Ionicons name={icon} size={16} color={c.muted} />
          <Text style={styles.label}>{label}</Text>
        </View>

        {!!recipe && (
          <View style={styles.actionRow}>
            {!!onSwap && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onSwap();
                }}
                hitSlop={10}
              >
                <Text style={[styles.actionText, { color: c.muted }]}>
                  Swap
                </Text>
              </Pressable>
            )}
            {!!onClear && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                hitSlop={10}
              >
                <Text style={[styles.actionText, styles.danger]}>Clear</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      <View style={[styles.bodyRow, { backgroundColor: c.card }]}>
        <Image
          source={
            recipe?.photoUri ? { uri: recipe.photoUri } : DEFAULT_RECIPE_IMAGE
          }
          style={styles.thumb}
        />

        <View style={{ flex: 1, backgroundColor: c.card }}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe?.title
              ? recipe.title
              : t("meals.chooseRecipe") || "Choose a recipe"}
          </Text>
          {!!hint && (
            <Text style={[styles.hint, { color: c.muted }]} numberOfLines={1}>
              {hint}
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={16} color={c.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 13, fontWeight: "800", opacity: 0.9 },

  actionRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  actionText: { fontSize: 12, fontWeight: "800" },
  danger: { color: "#E11D48" },

  bodyRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  thumb: { width: 54, height: 54, borderRadius: 12 },
  title: { fontSize: 15, fontWeight: "800" },
  hint: { marginTop: 4, fontSize: 12, opacity: 0.9 },
});
