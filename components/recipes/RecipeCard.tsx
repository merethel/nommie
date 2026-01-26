import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { DEFAULT_RECIPE_IMAGE } from "@/constants/images";
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
  instructions: string[];
  photoUri?: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddToMealPlan?: (id: string) => void;
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
  onAddToMealPlan,
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
          params: { id },
        })
      }
    >
      <View style={styles.header}>
        <Image
          source={photoUri ? { uri: photoUri } : DEFAULT_RECIPE_IMAGE}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={4} ellipsizeMode="tail">
            {title}
          </Text>

          <View style={styles.actions}>
            {!!onAddToMealPlan && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onAddToMealPlan(id);
                }}
                hitSlop={10}
                style={styles.iconBtn}
              >
                <Ionicons name="add-circle-outline" size={20} color={c.text} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite(id);
              }}
              hitSlop={10}
              style={styles.iconBtn}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isFavorite ? "#E11D48" : c.text}
              />
            </TouchableOpacity>
          </View>
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
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "transparent",
  },
  iconBtn: {
    padding: 6,
    flexShrink: 0,
  },
});
