import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import HeaderBackPill from "@/components/navigation/HeaderBackPill";
import HeaderPillButton from "@/components/navigation/HeaderPillButton";
import RecipeForm from "@/components/recipeInfoScreen/RecipeForm";
import WavyHeaderImage from "@/components/recipeInfoScreen/WavyHeaderImage";
import CookedCounter from "@/components/recipes/CookedCounter";
import { RECIPES_KEY } from "@/constants/storageKeys";
import { Recipe } from "@/src/types/recipe";
import { useRecipeEditor } from "@/utils/hooks/useRecipeEditor";
import { syncTodayMealPlanRecipe } from "@/utils/mealPlan/mealPlanStorage";
import {
  decrementCookedCount,
  getCookedCount,
  incrementCookedCount,
} from "@/utils/recipes/recipeCooked";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams } from "expo-router";
import { t } from "i18next";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet } from "react-native";

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

function snapshotFromEditor(e: any) {
  return {
    title: e.title ?? "",
    description: e.description ?? "",
    tagsText: e.tagsText ?? "",
    ingredientsText: e.ingredientsText ?? "",
    instructionsText: e.instructionsText ?? "",
    photoUri: e.photoUri ?? "",
  };
}

function snapshotsEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function RecipeInfo() {
  // ✅ only pass { id } when navigating
  const params = useLocalSearchParams<{ id?: string }>();
  const recipeId = params.id ?? "";

  // ✅ initial is a shell; real data comes from storage
  const initial = useMemo(
    () => ({
      id: recipeId,
      photoUri: "",
      title: "",
      description: "",
      tags: [] as string[],
      ingredients: [] as string[],
      instructions: [] as string[],
    }),
    [recipeId],
  );

  const editor = useRecipeEditor(initial);

  const [storedRecipe, setStoredRecipe] = useState<Recipe | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cookedCount, setCookedCount] = useState<number>(0);

  // snapshot when you START editing (used for Cancel + dirty check)
  const [editSnapshot, setEditSnapshot] = useState(() =>
    snapshotFromEditor(editor),
  );

  const isDirty = editor.isEditing
    ? !snapshotsEqual(editSnapshot, snapshotFromEditor(editor))
    : false;

  // ✅ Load recipe + cooked count on focus
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        if (!recipeId) return;

        const recipes = await readRecipes();
        const stored = recipes.find((r) => r.id === recipeId) ?? null;
        const count = await getCookedCount(recipeId);

        if (cancelled) return;

        setStoredRecipe(stored);
        setIsFavorite(!!stored?.isFavorite);
        setCookedCount(count);
      })();

      return () => {
        cancelled = true;
      };
    }, [recipeId]),
  );

  // ✅ Hydrate the editor ONCE per loaded recipe (prevents infinite re-render loop)
  const hydratedKeyRef = useRef<string>("");

  useEffect(() => {
    if (!storedRecipe) return;
    if (editor.isEditing) return;

    // If you have storedRecipe.updatedAt, use that instead.
    // This key just needs to change when the stored recipe changes.
    const key = `${storedRecipe.id}:${storedRecipe.createdAt ?? ""}:${
      storedRecipe.title ?? ""
    }:${storedRecipe.photoUri ?? ""}`;

    if (hydratedKeyRef.current === key) return;
    hydratedKeyRef.current = key;

    editor.setTitle(storedRecipe.title ?? "");
    editor.setDescription(storedRecipe.description ?? "");
    editor.setPhotoUri(storedRecipe.photoUri ?? "");
    editor.setTagsText((storedRecipe.tags ?? []).join("\n"));
    editor.setIngredientsText((storedRecipe.ingredients ?? []).join("\n"));
    editor.setInstructionsText((storedRecipe.instructions ?? []).join("\n"));

    setEditSnapshot(snapshotFromEditor(editor));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedRecipe, editor.isEditing]);

  const toggleFavorite = useCallback(async () => {
    if (!recipeId) return;

    const next = !isFavorite;
    setIsFavorite(next);

    const recipes = await readRecipes();
    const idx = recipes.findIndex((r) => r.id === recipeId);

    const favoritedAt = next ? Date.now() : undefined;

    if (idx >= 0) {
      recipes[idx] = { ...recipes[idx], isFavorite: next, favoritedAt };
    } else {
      recipes.push({
        id: recipeId,
        title: editor.title,
        description: editor.description,
        tags: editor.tagsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        ingredients: editor.ingredientsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        instructions: editor.instructionsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        photoUri: editor.photoUri,
        createdAt: Date.now(),
        isFavorite: next,
        favoritedAt,
      });
    }

    await writeRecipes(recipes);
  }, [recipeId, isFavorite, editor]);

  const onStartEdit = useCallback(() => {
    // optional: mark hydration as "locked" during editing
    hydratedKeyRef.current = "editing";
    setEditSnapshot(snapshotFromEditor(editor));
    editor.setIsEditing(true);
  }, [editor]);

  const onCancelEdit = useCallback(() => {
    editor.reset();
    setTimeout(() => setEditSnapshot(snapshotFromEditor(editor)), 0);
  }, [editor]);

  const onSaveEdit = useCallback(async () => {
    await editor.save();

    await syncTodayMealPlanRecipe({
      id: recipeId,
      title: editor.title,
      photoUri: editor.photoUri,
    });

    setEditSnapshot(snapshotFromEditor(editor));
    editor.setIsEditing(false);

    // refresh stored recipe so UI reflects latest saved data
    const recipes = await readRecipes();
    setStoredRecipe(recipes.find((r) => r.id === recipeId) ?? null);
  }, [editor, recipeId]);

  const onCookedPlus = useCallback(async () => {
    if (!recipeId) return;
    const next = await incrementCookedCount(recipeId);
    setCookedCount(next);
  }, [recipeId]);

  const onCookedMinus = useCallback(async () => {
    if (!recipeId) return;
    const next = await decrementCookedCount(recipeId);
    setCookedCount(next);
  }, [recipeId]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerLeft: () =>
            editor.isEditing && isDirty ? (
              <HeaderPillButton
                label={t("common.cancel") || "Cancel"}
                onPress={onCancelEdit}
              />
            ) : (
              <HeaderBackPill />
            ),
          headerRight: () =>
            editor.isEditing ? (
              isDirty ? (
                <HeaderPillButton
                  label={t("common.save") || "Save"}
                  onPress={onSaveEdit}
                />
              ) : null
            ) : (
              <HeaderPillButton
                label={t("common.edit") || "Edit"}
                onPress={onStartEdit}
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
          tagsText={editor.tagsText}
          setTagsText={editor.setTagsText}
          ingredientsText={editor.ingredientsText}
          setIngredientsText={editor.setIngredientsText}
          instructionsText={editor.instructionsText}
          setInstructionsText={editor.setInstructionsText}
          onSave={onSaveEdit}
          onDelete={editor.confirmDelete}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />

        {!editor.isEditing && (
          <CookedCounter
            value={cookedCount}
            onIncrement={onCookedPlus}
            onDecrement={onCookedMinus}
            title={t("recipes.cookedCount") || "Times cooked"}
          />
        )}
      </ScrollViewContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 35 },
});
