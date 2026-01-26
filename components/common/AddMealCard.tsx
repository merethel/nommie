import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { View } from "../Themed";

type Props = {
  onPress: () => void;
};

export default function AddMealCard({ onPress }: Props) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: c.border,
          backgroundColor: c.cardLight,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.plusWrap, { backgroundColor: c.cardLight }]}>
        <Ionicons name="add" size={36} color={c.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    width: 160,
  },

  // MUST match SmallCard image size
  plusWrap: {
    height: 186, // same as SmallCard image height
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
});
