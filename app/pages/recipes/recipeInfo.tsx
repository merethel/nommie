import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import HeaderTextButton from "@/components/navigation/HeaderTextButton";
import RecipeForm from "@/components/recipeInfoScreen/RecipeForm";
import WavyHeaderImage from "@/components/recipeInfoScreen/WavyHeaderImage";
import { useRecipeEditor } from "@/utils/hooks/useRecipeEditor";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { t } from "i18next";
import React, { useMemo } from "react";
import { StyleSheet } from "react-native";

export default function RecipeInfo() {
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    description?: string;
    ingredients?: string;
    instructions?: string;
    photoUri?: string;
  }>();
  const router = useRouter();

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
      photoUri: params.photoUri ?? "",
      title: params.title ?? "",
      description: params.description ?? "",
      ingredients: initialIngredients,
      instructions: params.instructions ?? "",
    }),
    [
      params.id,
      params.photoUri,
      params.title,
      params.description,
      initialIngredients,
      params.instructions,
    ],
  );

  const editor = useRecipeEditor(initial);

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
        />
      </ScrollViewContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 35 },
});
