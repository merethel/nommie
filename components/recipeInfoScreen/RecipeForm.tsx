// components/recipeInfoScreen/RecipeForm.tsx
import StyledButton from "@/components/common/StyledButton";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { parseIngredients } from "@/utils/hooks/useRecipeEditor";
import { Ionicons } from "@expo/vector-icons";
import { t } from "i18next";
import React from "react";
import { Pressable, View as RNView, StyleSheet, TextInput } from "react-native";

type Props = {
  isEditing: boolean;

  isFavorite: boolean;
  onToggleFavorite: () => void;

  title: string;
  setTitle: (v: string) => void;

  description: string;
  setDescription: (v: string) => void;

  tagsText: string;
  setTagsText: (v: string) => void;

  ingredientsText: string;
  setIngredientsText: (v: string) => void;

  instructions: string;
  setInstructions: (v: string) => void;

  onSave: () => void;
  onDelete: () => void;
};

export default function RecipeForm({
  isEditing,
  isFavorite,
  onToggleFavorite,
  title,
  setTitle,
  description,
  setDescription,
  tagsText,
  setTagsText,
  ingredientsText,
  setIngredientsText,
  instructions,
  setInstructions,
  onSave,
  onDelete,
}: Props) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  return (
    <View
      style={[
        styles.content,
        { paddingTop: isEditing ? 12 : HEADER_HEIGHT - 90 },
      ]}
      pointerEvents="box-none"
    >
      {/* Title */}
      <View style={styles.block}>
        {isEditing ? (
          <>
            <Text style={styles.label}>{t("createRecipe.titleLabel")}</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: c.card,
                  borderColor: c.border,
                  color: c.text,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder={t("createRecipe.titlePlaceholder")}
              placeholderTextColor={c.muted}
            />
          </>
        ) : (
          <View style={styles.titleRow}>
            <Text style={styles.bigTitle}>{title}</Text>

            <Pressable
              onPress={onToggleFavorite}
              hitSlop={10}
              style={styles.heartBtn}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? "#E11D48" : c.text}
              />
            </Pressable>
          </View>
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
              style={[
                styles.input,
                {
                  backgroundColor: c.card,
                  borderColor: c.border,
                  color: c.text,
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder={t("createRecipe.descriptionPlaceholder")}
              placeholderTextColor={c.muted}
            />
          </>
        ) : (
          <Text style={styles.bodyText}>{description || "—"}</Text>
        )}
      </View>

      {/* Tags */}
      <View>
        {isEditing ? (
          <>
            <Text style={styles.sectionTitle}>
              {t("createRecipe.tagsLabel")}
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.multiline,
                {
                  backgroundColor: c.cardLight,
                  borderColor: c.border,
                  color: c.text,
                },
              ]}
              value={tagsText}
              onChangeText={setTagsText}
              placeholder={t("createRecipe.tagsPlaceholder")}
              placeholderTextColor={c.muted}
              multiline
            />
          </>
        ) : (
          <View style={styles.chipsWrap}>
            {parseIngredients(tagsText).map((item: string, idx: number) => (
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
        )}
      </View>

      {/* Ingredients */}
      <View
        style={[
          styles.card,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
      >
        <Text style={styles.sectionTitle}>
          {t("createRecipe.ingredientsLabel")}
        </Text>

        {isEditing ? (
          <TextInput
            style={[
              styles.input,
              styles.multiline,
              {
                backgroundColor: c.cardLight,
                borderColor: c.border,
                color: c.text,
              },
            ]}
            value={ingredientsText}
            onChangeText={setIngredientsText}
            placeholder={t("createRecipe.ingredientsPlaceholder")}
            placeholderTextColor={c.muted}
            multiline
          />
        ) : (
          <View style={[styles.bulletList, { backgroundColor: "transparent" }]}>
            {parseIngredients(ingredientsText).map(
              (item: string, idx: number) => (
                <View
                  key={`${item}-${idx}`}
                  style={[styles.bulletRow, { backgroundColor: "transparent" }]}
                >
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ),
            )}
          </View>
        )}
      </View>

      {/* Instructions */}
      <View
        style={[
          styles.card,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
      >
        <Text style={styles.sectionTitle}>
          {t("createRecipe.instructionsLabel")}
        </Text>

        {isEditing ? (
          <TextInput
            style={[
              styles.input,
              styles.multiline,
              { minHeight: 140 },
              {
                backgroundColor: c.cardLight,
                borderColor: c.border,
                color: c.text,
              },
            ]}
            value={instructions}
            onChangeText={setInstructions}
            placeholder={t("createRecipe.instructionsPlaceholder")}
            placeholderTextColor={c.muted}
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
  },
  block: { marginBottom: 14, backgroundColor: "transparent" },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    opacity: 0.85,
  },

  titleRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  heartBtn: { padding: 6 },

  bigTitle: {
    fontSize: 24,
    fontWeight: "800",
    flex: 1,
    minWidth: 0,
  },

  bodyText: { fontSize: 14, opacity: 0.9 },

  card: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
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
  },
  chipText: { fontSize: 12 },

  instructions: { fontSize: 14, lineHeight: 20, opacity: 0.9 },

  saveWrap: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  bulletList: {
    marginTop: 6,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },

  bullet: {
    marginRight: 8,
    fontSize: 16,
    lineHeight: 20,
  },

  bulletText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1, // wraps nicely to next line if long
  },
});
