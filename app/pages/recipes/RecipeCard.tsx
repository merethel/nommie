import { Text, View } from "@/components/Themed";
import { t } from "i18next";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";

type Props = {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string;
};

export function RecipeCard({
  title,
  description,
  ingredients,
  instructions,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const visibleIngredients = useMemo(() => {
    if (expanded) return ingredients;
    return ingredients.slice(0, 6); // show a few when collapsed
  }, [expanded, ingredients]);

  const hasMoreIngredients = ingredients.length > visibleIngredients.length;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {!!description?.trim() && (
          <Text style={styles.description}>{description.trim()}</Text>
        )}
      </View>

      {/* Ingredients */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("createRecipe.ingredientsLabel")}
        </Text>
        <View style={styles.chipsWrap}>
          {visibleIngredients.map((item, idx) => (
            <View key={`${item}-${idx}`} style={styles.chip}>
              <Text style={styles.chipText}>{item}</Text>
            </View>
          ))}

          {!expanded && hasMoreIngredients && (
            <View style={[styles.chip, styles.moreChip]}>
              <Text style={styles.chipText}>
                +{ingredients.length - visibleIngredients.length}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("createRecipe.instructionsLabel")}
        </Text>
        <Text style={styles.instructions} numberOfLines={expanded ? 0 : 3}>
          {instructions}
        </Text>
      </View>

      {/* Footer actions */}
      <Pressable onPress={() => setExpanded((v) => !v)} style={styles.toggle}>
        <Text style={styles.toggleText}>
          {expanded ? "Show less" : "Show more"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 10,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    marginTop: 4,
    opacity: 0.75,
  },
  section: {
    marginTop: 10,
    backgroundColor: "transparent",
  },
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
  moreChip: {
    backgroundColor: "#eef2ff",
    borderColor: "#e0e7ff",
  },
  chipText: {
    fontSize: 12,
  },
  instructions: {
    opacity: 0.9,
    lineHeight: 18,
  },
  toggle: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
