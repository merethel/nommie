import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, TextInput } from "react-native";

import StyledButton from "@/components/StyledButton";
import { Text, View } from "@/components/Themed";

export default function CreateRecipeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");

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
          <StyledButton
            title={t("createRecipe.save")}
            onPress={() => {
              console.log({ title, description, ingredients, instructions });
              router.back();
            }}
          />

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
