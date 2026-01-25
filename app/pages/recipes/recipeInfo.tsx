import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { t } from "i18next";
import { useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
} from "react-native";

import StyledButton from "@/components/common/StyledButton";
import { Text, View } from "@/components/Themed";

const RECIPES_KEY = "nommie_recipes";

type Recipe = {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string;
  createdAt?: number;
};

function parseIngredients(input: string): string[] {
  return input
    .split(/\n|,/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function RecipeInfo() {
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    description?: string;
    ingredients?: string; // JSON string
    instructions?: string;
  }>();

  const initialIngredients = useMemo(() => {
    try {
      return params.ingredients
        ? (JSON.parse(params.ingredients) as string[])
        : [];
    } catch {
      return [];
    }
  }, [params.ingredients]);

  const initial = useMemo(
    () => ({
      id: params.id ?? "",
      title: params.title ?? "",
      description: params.description ?? "",
      ingredients: initialIngredients,
      instructions: params.instructions ?? "",
    }),
    [
      params.id,
      params.title,
      params.description,
      initialIngredients,
      params.instructions,
    ],
  );

  const [isEditing, setIsEditing] = useState(false);

  // editable fields
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [ingredientsText, setIngredientsText] = useState(
    initial.ingredients.join(", "),
  );
  const [instructions, setInstructions] = useState(initial.instructions);

  function onCancelEdit() {
    // reset to initial values
    setTitle(initial.title);
    setDescription(initial.description);
    setIngredientsText(initial.ingredients.join(", "));
    setInstructions(initial.instructions);
    setIsEditing(false);
  }

  async function onSave() {
    const updated: Partial<Recipe> = {
      title: title.trim(),
      description: description.trim(),
      ingredients: parseIngredients(ingredientsText),
      instructions: instructions.trim(),
    };

    if (!updated.title) {
      Alert.alert(t("createRecipe.validation.titleRequired"));
      return;
    }

    // Save to storage
    try {
      const json = await AsyncStorage.getItem(RECIPES_KEY);
      const recipes: Recipe[] = json ? JSON.parse(json) : [];

      let nextRecipes: Recipe[] | null = null;

      //save by id if possible
      if (initial.id) {
        nextRecipes = recipes.map((r) =>
          r.id === initial.id ? ({ ...r, ...updated } as Recipe) : r,
        );
      } else {
        // Fallback: update first match by title if no id exists
        nextRecipes = recipes.map((r) =>
          r.title === initial.title ? ({ ...r, ...updated } as Recipe) : r,
        );
      }

      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(nextRecipes));

      setIsEditing(false);

      // Update the route params so going back/forward shows the new values
      router.setParams({
        title: updated.title,
        description: updated.description ?? "",
        ingredients: JSON.stringify(updated.ingredients ?? []),
        instructions: updated.instructions ?? "",
      });
    } catch (e) {
      console.warn("Failed to save recipe:", e);
      Alert.alert("Could not save changes");
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: title || t("recipes.title"),
          headerRight: () => (
            <Pressable
              onPress={() => (isEditing ? onCancelEdit() : setIsEditing(true))}
              style={styles.headerBtn}
            >
              <Text style={styles.headerBtnText}>
                {isEditing ? t("common.cancel") : t("common.edit")}
              </Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Title */}
        <View style={styles.block}>
          <Text style={styles.label}>{t("createRecipe.titleLabel")}</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder={t("createRecipe.titlePlaceholder")}
            />
          ) : (
            <Text style={styles.bigTitle}>{title}</Text>
          )}
        </View>

        {/* Description */}
        <View style={styles.block}>
          <Text style={styles.label}>{t("createRecipe.descriptionLabel")}</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder={t("createRecipe.descriptionPlaceholder")}
            />
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

        {/* Save button (only in edit mode) */}
        {isEditing && (
          <View style={styles.saveWrap}>
            <StyledButton title={t("common.save")} onPress={onSave} />
            <StyledButton
              title={t("common.delete")}
              onPress={() => {
                //delete recipe
                Alert.alert(
                  "Delete recipe",
                  "Are you sure you want to delete this recipe?",
                  [
                    {
                      text: t("common.cancel"),
                      style: "cancel",
                    },
                    {
                      text: t("common.delete"),
                      style: "destructive",
                      onPress: async () => {
                        try {
                          const json = await AsyncStorage.getItem(RECIPES_KEY);
                          const recipes: Recipe[] = json
                            ? JSON.parse(json)
                            : [];

                          const nextRecipes = recipes.filter(
                            (r) =>
                              r.id !== initial.id && r.title !== initial.title,
                          );

                          await AsyncStorage.setItem(
                            RECIPES_KEY,
                            JSON.stringify(nextRecipes),
                          );

                          router.back();
                        } catch (e) {
                          console.warn("Failed to delete recipe:", e);
                          Alert.alert("Could not delete recipe");
                        }
                      },
                    },
                  ],
                );
              }}
            />
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 28,
  },
  headerBtn: {
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },

  block: {
    marginBottom: 14,
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    opacity: 0.85,
  },
  bigTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  bodyText: {
    fontSize: 14,
    opacity: 0.9,
  },

  card: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
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
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  chipText: {
    fontSize: 12,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },

  saveWrap: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
});
