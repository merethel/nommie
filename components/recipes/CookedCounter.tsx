import HeaderPillButton from "@/components/navigation/HeaderPillButton";
import { Text, View } from "@/components/Themed";
import React from "react";
import { StyleSheet } from "react-native";

type Props = {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  title?: string;
  disabled?: boolean;
};

export default function CookedCounter({
  value,
  onIncrement,
  onDecrement,
  title = "Times cooked",
  disabled = false,
}: Props) {
  return (
    <View>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.row}>
        <HeaderPillButton
          label="−"
          onPress={onDecrement}
          disabled={disabled || value <= 0}
          size="small"
        />
        <Text style={styles.value}>{value}</Text>
        <HeaderPillButton
          label="+"
          onPress={onIncrement}
          disabled={disabled}
          size="small"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    opacity: 0.85,
    paddingLeft: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  value: {
    fontSize: 16,
    fontWeight: "800",
    minWidth: 32,
    textAlign: "center",
  },
});
