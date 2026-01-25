import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import HeaderTextButton from "@/components/navigation/HeaderTextButton";
import RecipeForm from "@/components/recipeInfoScreen/RecipeForm";
import WavyHeaderImage from "@/components/recipeInfoScreen/WavyHeaderImage";
import { useRecipeEditor } from "@/utils/hooks/useRecipeEditor";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams } from "expo-router";
import { t } from "i18next";
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet } from "react-native";

const RECIPES_KEY = "nommie_recipes";

type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  photoUri?: string;
  createdAt: number;
  isFavorite?: boolean;
};

async function readRecipes(): Promise<Recipe[]> {
  const raw = await AsyncStorage.getItem(RECIPES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Recipe[];
  } catch {
    return [];
  }
}

async function writeRecipes(recipes: Recipe[]) {
  await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

export default function RecipeInfo() {
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    description?: string;
    ingredients?: string;
    instructions?: string;
    photoUri?: string;
    isFavorite?: string; // optional legacy
  }>();

  const recipeId = params.id ?? "";

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
      id: recipeId,
      photoUri: params.photoUri ?? "",
      title: params.title ?? "",
      description: params.description ?? "",
      ingredients: initialIngredients,
      instructions: params.instructions ?? "",
    }),
    [
      recipeId,
      params.photoUri,
      params.title,
      params.description,
      initialIngredients,
      params.instructions,
    ],
  );

  const editor = useRecipeEditor(initial);

  const [isFavorite, setIsFavorite] = useState(params.isFavorite === "true");

  // IMPORTANT: when coming back / reopening, always refresh favorite from AsyncStorage
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        if (!recipeId) return;

        const recipes = await readRecipes();
        const stored = recipes.find((r) => r.id === recipeId);

        if (!cancelled) {
          // Prefer storage value if present
          setIsFavorite(
            stored ? !!stored.isFavorite : params.isFavorite === "true",
          );
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [recipeId, params.isFavorite]),
  );

  const toggleFavorite = useCallback(async () => {
    if (!recipeId) return;

    const next = !isFavorite;
    setIsFavorite(next);

    const recipes = await readRecipes();
    const idx = recipes.findIndex((r) => r.id === recipeId);

    if (idx >= 0) {
      recipes[idx] = { ...recipes[idx], isFavorite: next };
    } else {
      // If it doesn't exist yet, create it (or you can choose to do nothing)
      recipes.push({
        id: recipeId,
        title: editor.title,
        description: editor.description,
        ingredients: editor.ingredientsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        instructions: editor.instructions,
        photoUri: editor.photoUri,
        createdAt: Date.now(),
        isFavorite: next,
      });
    }

    await writeRecipes(recipes);
  }, [
    recipeId,
    isFavorite,
    editor.title,
    editor.description,
    editor.ingredientsText,
    editor.instructions,
    editor.photoUri,
  ]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerRight: () => (
            <HeaderTextButton
              label={editor.isEditing ? t("common.cancel") : t("common.edit")}
              onPress={() =>
                editor.isEditing ? editor.reset() : editor.setIsEditing(true)
              }
            />
          ),
        }}
      />

      <ScrollViewContainer contentContainerStyle={styles.container}>
        <WavyHeaderImage
          isEditing={editor.isEditing}
          photoUri={editor.photoUri}
          onChangePhotoUri={editor.setPhotoUri}
          onRemove={() => editor.setPhotoUri("")}
        />

        <RecipeForm
          isEditing={editor.isEditing}
          title={editor.title}
          setTitle={editor.setTitle}
          description={editor.description}
          setDescription={editor.setDescription}
          ingredientsText={editor.ingredientsText}
          setIngredientsText={editor.setIngredientsText}
          instructions={editor.instructions}
          setInstructions={editor.setInstructions}
          onSave={editor.save}
          onDelete={editor.confirmDelete}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      </ScrollViewContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 35 },
});
