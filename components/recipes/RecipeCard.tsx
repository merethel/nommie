import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  ingredients: string[];
  instructions: string;
  photoUri?: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export function RecipeCard({
  id,
  title,
  description,
  tags,
  ingredients,
  instructions,
  photoUri,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const [expanded] = useState(false);
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  const visibleTags = useMemo(() => {
    if (expanded) return tags;
    return tags.slice(0, 6);
  }, [expanded, tags]);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
      onPress={() =>
        router.push({
          pathname: "/pages/recipes/recipeInfo",
          params: {
            id,
            title,
            description: description ?? "",
            tags: JSON.stringify(tags),
            ingredients: JSON.stringify(ingredients),
            instructions,
            photoUri:
              photoUri ??
              "/Users/merethe/Desktop/Apps/nommie/assets/images/default_images/default1.jpg",
          },
        })
      }
    >
      <View style={styles.header}>
        {/*image*/}
        {photoUri && (
          <Image
            source={{ uri: photoUri }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={4} ellipsizeMode="tail">
            {title}
          </Text>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation(); // don't navigate
              onToggleFavorite(id);
            }}
            hitSlop={10}
            style={styles.heartBtn}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite ? "#E11D48" : c.text}
            />
          </TouchableOpacity>
        </View>

        {!!description?.trim() && (
          <Text style={styles.description}>{description.trim()}</Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.chipsWrap}>
          {visibleTags.map((item, idx) => (
            <View
              key={`${item}-${idx}`}
              style={[
                styles.chip,
                { backgroundColor: c.secondary, borderColor: c.border },
              ]}
            >
              <Text style={styles.chipText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  header: { marginBottom: 10, backgroundColor: "transparent" },
  description: { marginTop: 4, opacity: 0.75 },
  section: { backgroundColor: "transparent" },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.9,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: "transparent",
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  chipText: { fontSize: 12 },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: "transparent",
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    minWidth: 0,
  },

  heartBtn: {
    padding: 6,
    flexShrink: 0,
  },
});
