import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import React from "react";
import { Image, Pressable, StyleSheet } from "react-native";

type Props = {
  title: string;
  photoUri?: string;
  onPress?: () => void;
};

const FALLBACK_PHOTO =
  "/Users/merethe/Desktop/Apps/nommie/assets/images/default_images/default1.jpg";

export default function SmallCard({ title, photoUri, onPress }: Props) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c.card,
          borderColor: c.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: photoUri || FALLBACK_PHOTO }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    paddingBottom: 10,
    gap: 10,
    width: 160,
  },

  imageWrap: {
    overflow: "hidden",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  // portrait thumbnail
  image: {
    width: "100%",
    height: 168,
  },

  title: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
