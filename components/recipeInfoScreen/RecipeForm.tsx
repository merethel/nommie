// components/recipe/RecipeForm.tsx
import StyledButton from "@/components/common/StyledButton";
import { Text, View } from "@/components/Themed";
import { parseIngredients } from "@/utils/hooks/useRecipeEditor";
import { t } from "i18next";
import React from "react";
import { View as RNView, StyleSheet, TextInput } from "react-native";

type Props = {
  isEditing: boolean;

  title: string;
  setTitle: (v: string) => void;

  description: string;
  setDescription: (v: string) => void;

  ingredientsText: string;
  setIngredientsText: (v: string) => void;

  instructions: string;
  setInstructions: (v: string) => void;

  onSave: () => void;
  onDelete: () => void;
};

export default function RecipeForm({
  isEditing,
  title,
  setTitle,
  description,
  setDescription,
  ingredientsText,
  setIngredientsText,
  instructions,
  setInstructions,
  onSave,
  onDelete,
}: Props) {
  return (
    <View style={styles.content} pointerEvents="box-none">
      {/* Title */}
      <View style={styles.block}>
        {isEditing ? (
          <>
            <Text style={styles.label}>{t("createRecipe.titleLabel")}</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder={t("createRecipe.titlePlaceholder")}
            />
          </>
        ) : (
          <Text style={styles.bigTitle}>{title}</Text>
        )}
      </View>

      {/* Description */}
      <View style={styles.block}>
        {isEditing ? (
          <>
            <Text style={styles.label}>
              {t("createRecipe.descriptionLabel")}
            </Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder={t("createRecipe.descriptionPlaceholder")}
            />
          </>
        ) : (
          <Text style={styles.bodyText}>{description || "—"}</Text>
        )}
      </View>

      {/* Ingredients */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t("createRecipe.ingredientsLabel")}
        </Text>

        {isEditing ? (
          <TextInput
            style={[styles.input, styles.multiline]}
            value={ingredientsText}
            onChangeText={setIngredientsText}
            placeholder={t("createRecipe.ingredientsPlaceholder")}
            multiline
          />
        ) : (
          <View style={styles.chipsWrap}>
            {parseIngredients(ingredientsText).map((item, idx) => (
              <View key={`${item}-${idx}`} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t("createRecipe.instructionsLabel")}
        </Text>

        {isEditing ? (
          <TextInput
            style={[styles.input, styles.multiline, { minHeight: 140 }]}
            value={instructions}
            onChangeText={setInstructions}
            placeholder={t("createRecipe.instructionsPlaceholder")}
            multiline
          />
        ) : (
          <Text style={styles.instructions}>{instructions || "—"}</Text>
        )}
      </View>

      {/* Save / Delete */}
      {isEditing && (
        <RNView style={styles.saveWrap}>
          <StyledButton title={t("common.save")} onPress={onSave} />
          <StyledButton title={t("common.delete")} onPress={onDelete} />
        </RNView>
      )}
    </View>
  );
}

const HEADER_HEIGHT = 260;

const styles = StyleSheet.create({
  content: {
    zIndex: 1,
    backgroundColor: "transparent",
    paddingTop: HEADER_HEIGHT - 90,
  },
  block: { marginBottom: 14, backgroundColor: "transparent" },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    opacity: 0.85,
  },
  bigTitle: { fontSize: 24, fontWeight: "800" },
  bodyText: { fontSize: 14, opacity: 0.9 },

  card: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    marginTop: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
  },
  multiline: { minHeight: 90, textAlignVertical: "top" },

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

  instructions: { fontSize: 14, lineHeight: 20, opacity: 0.9 },

  saveWrap: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
});
