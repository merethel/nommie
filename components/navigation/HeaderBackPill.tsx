import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

type Props = {
  onPress?: () => void;
};

export default function HeaderBackPill({ onPress }: Props) {
  const router = useRouter();
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      hitSlop={10}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: c.card,
          borderColor: c.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Ionicons name="chevron-back" size={18} color={c.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",

    // subtle shadow (iOS)
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },

    // subtle shadow (Android)
    elevation: 3,
  },
});
