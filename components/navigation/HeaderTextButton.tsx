// components/navigation/HeaderTextButton.tsx
import { Text } from "@/components/Themed";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
};

export default function HeaderTextButton({ label, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.headerBtn} hitSlop={10}>
      <Text style={styles.headerBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerBtn: {
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerBtnText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
