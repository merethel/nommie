import { Text, View } from "@/components/Themed";
import { router } from "expo-router";
import { t } from "i18next";
import { useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string;
};

export function RecipeCard({
  id,
  title,
  description,
  ingredients,
  instructions,
}: Props) {
  const [expanded] = useState(false);

  const visibleIngredients = useMemo(() => {
    if (expanded) return ingredients;
    return ingredients.slice(0, 6);
  }, [expanded, ingredients]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/pages/recipes/recipeInfo",
          params: {
            id,
            title,
            description: description ?? "",
            ingredients: JSON.stringify(ingredients),
            instructions,
          },
        })
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {!!description?.trim() && (
          <Text style={styles.description}>{description.trim()}</Text>
        )}
      </View>

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
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  header: { marginBottom: 10, backgroundColor: "transparent" },
  title: { fontSize: 16, fontWeight: "700" },
  description: { marginTop: 4, opacity: 0.75 },
  section: { marginTop: 10, backgroundColor: "transparent" },
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
});
