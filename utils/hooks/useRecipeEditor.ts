// hooks/useRecipeEditor.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { t } from "i18next";
import { useState } from "react";
import { Alert } from "react-native";

const RECIPES_KEY = "nommie_recipes";

export type Recipe = {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string;
  tags: string[];
  createdAt?: number;
  photoUri?: string;
};

export function parseIngredients(input: string): string[] {
  return input
    .split(/\n|,/g)
    .map((s: string) => s.trim())
    .filter(Boolean);
}

export type RecipeInitial = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  ingredients: string[];
  instructions: string;
  photoUri: string;
};

export function useRecipeEditor(initial: RecipeInitial) {
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [tagsText, setTagsText] = useState(initial.tags.join(", "));
  const [ingredientsText, setIngredientsText] = useState(
    initial.ingredients.join(", "),
  );
  const [instructions, setInstructions] = useState(initial.instructions);
  const [photoUri, setPhotoUri] = useState(initial.photoUri);

  function reset() {
    setTitle(initial.title);
    setDescription(initial.description);
    setTagsText(initial.tags.join(", "));
    setIngredientsText(initial.ingredients.join(", "));
    setInstructions(initial.instructions);
    setPhotoUri(initial.photoUri);
    setIsEditing(false);
  }

  async function save() {
    const updated: Partial<Recipe> = {
      title: title.trim(),
      description: description.trim(),
      tags: parseIngredients(tagsText),
      ingredients: parseIngredients(ingredientsText),
      instructions: instructions.trim(),
      photoUri:
        photoUri ||
        "/Users/merethe/Desktop/Apps/nommie/assets/images/default_images/default1.jpg",
    };

    if (!updated.title) {
      Alert.alert(t("createRecipe.validation.titleRequired"));
      return;
    }

    try {
      const json = await AsyncStorage.getItem(RECIPES_KEY);
      const recipes: Recipe[] = json ? JSON.parse(json) : [];

      let nextRecipes: Recipe[];

      if (initial.id) {
        nextRecipes = recipes.map((r) =>
          r.id === initial.id ? ({ ...r, ...updated } as Recipe) : r,
        );
      } else {
        nextRecipes = recipes.map((r) =>
          r.title === initial.title ? ({ ...r, ...updated } as Recipe) : r,
        );
      }

      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(nextRecipes));

      setIsEditing(false);

      router.setParams({
        title: updated.title,
        description: updated.description ?? "",
        tags: JSON.stringify(updated.tags ?? []),
        ingredients: JSON.stringify(updated.ingredients ?? []),
        instructions: updated.instructions ?? "",
        photoUri: updated.photoUri ?? "",
      });
    } catch (e) {
      console.warn("Failed to save recipe:", e);
      Alert.alert("Could not save changes");
    }
  }

  async function deleteRecipe() {
    try {
      const json = await AsyncStorage.getItem(RECIPES_KEY);
      const recipes: Recipe[] = json ? JSON.parse(json) : [];

      const nextRecipes = recipes.filter(
        (r) => r.id !== initial.id && r.title !== initial.title,
      );

      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(nextRecipes));

      router.back();
    } catch (e) {
      console.warn("Failed to delete recipe:", e);
      Alert.alert("Could not delete recipe");
    }
  }

  function confirmDelete() {
    Alert.alert(
      "Delete recipe",
      "Are you sure you want to delete this recipe?",
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: deleteRecipe,
        },
      ],
    );
  }

  return {
    // mode
    isEditing,
    setIsEditing,
    reset,

    // fields
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
    photoUri,
    setPhotoUri,

    // actions
    save,
    confirmDelete,
  };
}
