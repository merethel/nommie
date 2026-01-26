import IconButton from "@/components/common/IconButton";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

type Action = {
  key: string;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function QuickActionsRow() {
  const { t } = useTranslation();

  const actions: Action[] = [
    {
      key: "add",
      labelKey: "common.add",
      icon: "add-circle-outline",
      onPress: () => router.push("/pages/recipes/createRecipe"),
    },
    {
      key: "plan",
      labelKey: "common.plan",
      icon: "calendar-outline",
      onPress: () => router.push("/pages/mealPlan"),
    },
    {
      key: "favorites",
      labelKey: "common.favorites",
      icon: "heart-outline",
      onPress: () => router.push("/pages/mealPlan"),
    },
    {
      key: "shopping",
      labelKey: "common.shopping",
      icon: "cart-outline",
      onPress: () => router.push("/pages/mealPlan"),
    },
  ];

  return (
    <View style={styles.row}>
      {actions.map((a) => (
        <View key={a.key} style={styles.item}>
          <IconButton icon={a.icon} onPress={a.onPress} />
          <Text style={styles.label}>{t(a.labelKey)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  item: {
    alignItems: "center",
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    opacity: 0.85,
  },
});
