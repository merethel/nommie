import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number; // optional icon size
};

export default function IconButton({ icon, onPress, size = 28 }: Props) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: c.card,
          borderColor: c.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={size} color={c.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
