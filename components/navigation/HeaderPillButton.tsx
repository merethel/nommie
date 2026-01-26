import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
};

export default function HeaderPillButton({ label, onPress }: Props) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={[
        styles.pill,
        {
          backgroundColor: c.card, // stays white-ish in light, darker in dark mode
          borderColor: c.border,
        },
      ]}
    >
      <Text style={[styles.text, { color: c.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3, // Android
  },
  text: {
    fontSize: 14,
    fontWeight: "700",
    opacity: 0.9,
  },
});
