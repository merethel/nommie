import { Text } from "@/components/Themed";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export type RecipeSortMode = "newest" | "az" | "mostCooked";

type Props = {
  value: RecipeSortMode;
  onChange: (next: RecipeSortMode) => void;
  resetTo?: RecipeSortMode; // ✅ add (default: "newest")
  showMostCooked?: boolean;
};

export default function RecipeSortBar({
  value,
  onChange,
  resetTo = "newest",
  showMostCooked = true,
}: Props) {
  const handlePress = (next: RecipeSortMode) => {
    // ✅ if tapping active, reset
    onChange(value === next ? resetTo : next);
  };

  return (
    <View style={styles.row}>
      <Pill
        label="Newest"
        active={value === "newest"}
        onPress={() => handlePress("newest")}
      />
      <Pill
        label="A–Z"
        active={value === "az"}
        onPress={() => handlePress("az")}
      />
      {showMostCooked && (
        <Pill
          label="Most cooked"
          active={value === "mostCooked"}
          onPress={() => handlePress("mostCooked")}
        />
      )}
    </View>
  );
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
    >
      <Text style={{ fontWeight: "700", opacity: active ? 1 : 0.7 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillActive: { borderColor: "rgba(242,184,75,0.55)" },
  pillInactive: { borderColor: "rgba(0,0,0,0.12)" },
});
