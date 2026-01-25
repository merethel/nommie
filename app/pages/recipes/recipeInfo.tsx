import RecipeForm from "@/components/recipeInfoScreen/RecipeForm";
import WavyHeaderImage from "@/components/recipeInfoScreen/WavyHeaderImage";
import { Text } from "@/components/Themed";
import { useRecipeEditor } from "@/utils/hooks/useRecipeEditor";
import { Stack, useLocalSearchParams } from "expo-router";
import { t } from "i18next";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";

export default function RecipeInfo() {
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    description?: string;
    ingredients?: string;
    instructions?: string;
    photoUri?: string;
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
          headerShown: true,
          headerBackButtonDisplayMode: "minimal",
          headerTintColor: "#000",
          headerTransparent: true,
          headerRight: () => (
            <Pressable
              onPress={() =>
                editor.isEditing ? editor.reset() : editor.setIsEditing(true)
              }
              style={styles.headerBtn}
            >
              <Text style={styles.headerBtnText}>
                {editor.isEditing ? t("common.cancel") : t("common.edit")}
              </Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
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
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 28, position: "relative" },
  headerBtn: { marginRight: 12, paddingHorizontal: 8, paddingVertical: 6 },
  headerBtnText: { fontSize: 15, fontWeight: "600" },
});
