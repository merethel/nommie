// components/recipeInfoScreen/RecipeForm.tsx
import StyledButton from "@/components/common/StyledButton";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { parseToList } from "@/utils/hooks/useRecipeEditor";
import { Ionicons } from "@expo/vector-icons";
import { t } from "i18next";
import React, { useMemo } from "react";
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

  instructionsText: string;
  setInstructionsText: (v: string) => void;

  onSave: () => void;
  onDelete: () => void;
};

const HEADER_HEIGHT = 260;
type ThemeColors = (typeof Colors)["light"];

type SectionKey =
  | "title"
  | "description"
  | "tags"
  | "ingredients"
  | "instructions";

type SectionSpec = {
  key: SectionKey;
  label: string;
  placeholder: string;
  value: string;
  setValue: (v: string) => void;
  multiline?: boolean;
  inputVariant?: "default" | "light";
  showLabelWhenReadOnly?: boolean;
  wrapReadOnlyInCard?: boolean; // ✅ control per section
  renderReadOnly: (c: ThemeColors) => React.ReactNode;
};

function Field({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      {children}
    </View>
  );
}

function Card({ c, children }: { c: ThemeColors; children: React.ReactNode }) {
  return (
    <View
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
    >
      {children}
    </View>
  );
}

function EmptyDash({ c }: { c: ThemeColors }) {
  return <Text style={[styles.bodyText, { color: c.muted }]}>—</Text>;
}

function ThemedInput({
  c,
  value,
  onChangeText,
  placeholder,
  multiline,
  variant = "default",
}: {
  c: ThemeColors;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  variant?: "default" | "light";
}) {
  const backgroundColor = variant === "light" ? c.cardLight : c.card;

  return (
    <TextInput
      style={[
        styles.input,
        multiline && styles.multiline,
        { backgroundColor, borderColor: c.border, color: c.text },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={c.muted}
      multiline={multiline}
    />
  );
}

function ReadOnlyChips({ c, items }: { c: ThemeColors; items: string[] }) {
  if (!items.length) return <EmptyDash c={c} />;
  return (
    <View style={styles.chipsWrap}>
      {items.map((item, idx) => (
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
  );
}

function ReadOnlyBullets({ c, items }: { c: ThemeColors; items: string[] }) {
  if (!items.length) return <EmptyDash c={c} />;
  return (
    <View style={styles.list}>
      {items.map((item, idx) => (
        <View key={`${item}-${idx}`} style={styles.bulletRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function ReadOnlyNumbered({ c, items }: { c: ThemeColors; items: string[] }) {
  if (!items.length) return <EmptyDash c={c} />;
  return (
    <View style={styles.list}>
      {items.map((item, idx) => (
        <View key={`${item}-${idx}`} style={styles.instructionRow}>
          <Text style={styles.instructionNumber}>{idx + 1}.</Text>
          <Text style={styles.instructionText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export default function RecipeForm(props: Props) {
  const {
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
    instructionsText,
    setInstructionsText,
    onSave,
    onDelete,
  } = props;

  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  const paddingTop = isEditing ? 12 : HEADER_HEIGHT - 90;

  const parsed = useMemo(
    () => ({
      tags: parseToList(tagsText),
      ingredients: parseToList(ingredientsText),
      instructions: parseToList(instructionsText),
    }),
    [tagsText, ingredientsText, instructionsText],
  );

  const sections: SectionSpec[] = useMemo(
    () => [
      {
        key: "title",
        label: t("createRecipe.titleLabel"),
        placeholder: t("createRecipe.titlePlaceholder"),
        value: title,
        setValue: setTitle,
        inputVariant: "default",
        showLabelWhenReadOnly: false,
        wrapReadOnlyInCard: false, // ✅ no card
        renderReadOnly: () => (
          <View style={styles.titleRow}>
            <Text style={styles.bigTitle}>{title}</Text>

            <Pressable
              onPress={onToggleFavorite}
              hitSlop={10}
              style={styles.iconBtn}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? "#E11D48" : c.text}
              />
            </Pressable>
          </View>
        ),
      },
      {
        key: "description",
        label: t("createRecipe.descriptionLabel"),
        placeholder: t("createRecipe.descriptionPlaceholder"),
        value: description,
        setValue: setDescription,
        inputVariant: "default",
        showLabelWhenReadOnly: false,
        wrapReadOnlyInCard: false, // ✅ no card
        renderReadOnly: (theme) =>
          description ? (
            <Text style={styles.bodyText}>{description}</Text>
          ) : (
            <EmptyDash c={theme} />
          ),
      },
      {
        key: "tags",
        label: t("createRecipe.tagsLabel"),
        placeholder: t("createRecipe.tagsPlaceholder"),
        value: tagsText,
        setValue: setTagsText,
        multiline: true,
        inputVariant: "light",
        wrapReadOnlyInCard: false, // ✅ no card
        renderReadOnly: (theme) => (
          <ReadOnlyChips c={theme} items={parsed.tags} />
        ),
      },
      {
        key: "ingredients",
        label: t("createRecipe.ingredientsLabel"),
        placeholder: t("createRecipe.ingredientsPlaceholder"),
        value: ingredientsText,
        setValue: setIngredientsText,
        multiline: true,
        inputVariant: "light",
        wrapReadOnlyInCard: true, // ✅ card only here
        renderReadOnly: (theme) => (
          <ReadOnlyBullets c={theme} items={parsed.ingredients} />
        ),
      },
      {
        key: "instructions",
        label: t("createRecipe.instructionsLabel"),
        placeholder: t("createRecipe.instructionsPlaceholder"),
        value: instructionsText,
        setValue: setInstructionsText,
        multiline: true,
        inputVariant: "light",
        wrapReadOnlyInCard: true, // ✅ and here
        renderReadOnly: (theme) => (
          <ReadOnlyNumbered c={theme} items={parsed.instructions} />
        ),
      },
    ],
    [
      title,
      setTitle,
      description,
      setDescription,
      tagsText,
      setTagsText,
      ingredientsText,
      setIngredientsText,
      instructionsText,
      setInstructionsText,
      parsed.tags,
      parsed.ingredients,
      parsed.instructions,
      isFavorite,
      onToggleFavorite,
      c.text,
    ],
  );

  return (
    <View style={[styles.content, { paddingTop }]} pointerEvents="box-none">
      {sections.map((s) => {
        const showLabel = isEditing || s.showLabelWhenReadOnly !== false;
        const label = showLabel ? s.label : undefined;

        const body = isEditing ? (
          <ThemedInput
            c={c}
            value={s.value}
            onChangeText={s.setValue}
            placeholder={s.placeholder}
            multiline={s.multiline}
            variant={s.inputVariant ?? "default"}
          />
        ) : s.wrapReadOnlyInCard ? (
          <Card c={c}>{s.renderReadOnly(c)}</Card>
        ) : (
          s.renderReadOnly(c)
        );

        return (
          <Field key={s.key} label={label}>
            {body}
          </Field>
        );
      })}

      {isEditing && (
        <RNView style={styles.actions}>
          <StyledButton title={t("common.save")} onPress={onSave} />
          <StyledButton title={t("common.delete")} onPress={onDelete} />
        </RNView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    zIndex: 1,
    backgroundColor: "transparent",
  },

  section: {
    marginBottom: 14,
    backgroundColor: "transparent",
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    opacity: 0.85,
  },

  card: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },

  titleRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  iconBtn: { padding: 6 },

  bigTitle: {
    fontSize: 24,
    fontWeight: "800",
    flex: 1,
    minWidth: 0,
  },

  bodyText: {
    fontSize: 14,
    opacity: 0.9,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },

  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
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
  },

  chipText: { fontSize: 12 },

  list: {
    marginTop: 6,
    backgroundColor: "transparent",
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    backgroundColor: "transparent",
  },

  bullet: {
    marginRight: 8,
    fontSize: 16,
    lineHeight: 20,
  },

  bulletText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },

  instructionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "transparent",
  },

  instructionNumber: {
    marginRight: 10,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 22,
  },

  instructionText: {
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },

  actions: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
});
