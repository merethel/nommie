import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TextInput } from "react-native";

import StyledButton from "@/components/StyledButton";
import { Text, View } from "@/components/Themed";
import { t } from "i18next";

const RECIPES_KEY = "nommie_recipes";

type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string[]; // store as array
  instructions: string;
  createdAt: number;
};

function parseIngredients(input: string): string[] {
  // supports commas or new lines
  return input
    .split(/\n|,/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function CreateRecipeScreen() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");

  async function handleSave() {
    const newRecipe: Recipe = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      title: title.trim(),
      description: description.trim(),
      ingredients: parseIngredients(ingredients),
      instructions: instructions.trim(),
      createdAt: Date.now(),
    };

    const existing = await AsyncStorage.getItem(RECIPES_KEY);
    const recipes: Recipe[] = existing ? JSON.parse(existing) : [];

    // add newest first
    const updated = [newRecipe, ...recipes];
    await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(updated));

    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title: t("createRecipe.screenTitle") }} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>{t("createRecipe.titleLabel")}</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder={t("createRecipe.titlePlaceholder")}
        />

        <Text style={styles.label}>{t("createRecipe.descriptionLabel")}</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder={t("createRecipe.descriptionPlaceholder")}
        />

        <Text style={styles.label}>{t("createRecipe.ingredientsLabel")}</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={ingredients}
          onChangeText={setIngredients}
          placeholder={t("createRecipe.ingredientsPlaceholder")}
          multiline
        />

        <Text style={styles.label}>{t("createRecipe.instructionsLabel")}</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={instructions}
          onChangeText={setInstructions}
          placeholder={t("createRecipe.instructionsPlaceholder")}
          multiline
        />

        <View style={styles.buttons}>
          <StyledButton title={t("createRecipe.save")} onPress={handleSave} />
          <StyledButton
            title={t("createRecipe.cancel")}
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontSize: 14, marginBottom: 4, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  buttons: { gap: 12, marginTop: 8 },
});
