import { DEFAULT_RECIPE_IMAGE } from "@/constants/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme,
} from "react-native";

import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import StyledButton from "@/components/common/StyledButton";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Recipe } from "@/src/types/recipe";
import { t } from "i18next";

const RECIPES_KEY = "nommie_recipes";

function parseToList(input: string): string[] {
  // supports commas or new lines
  return input
    .split(/\n|,/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function CreateRecipeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    const newRecipe: Recipe = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      title: title.trim(),
      description: description.trim(),
      tags: parseToList(tags),
      ingredients: parseToList(ingredients),
      instructions: parseToList(instructions),
      createdAt: Date.now(),
      photoUri: photoUri ?? undefined,
    };

    const existing = await AsyncStorage.getItem(RECIPES_KEY);
    const recipes: Recipe[] = existing ? JSON.parse(existing) : [];
    const updated = [newRecipe, ...recipes];
    await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(updated));

    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title: t("createRecipe.screenTitle") }} />

      <ScrollViewContainer>
        <Text style={styles.label}>{t("createRecipe.photoLabel")}</Text>

        <Pressable style={styles.imagePicker} onPress={pickImage}>
          <Image
            source={photoUri ? { uri: photoUri } : DEFAULT_RECIPE_IMAGE}
            style={styles.image}
            resizeMode="cover"
          />

          {!photoUri && (
            <View style={styles.overlay}>
              <Text style={styles.imagePlaceholder}>
                {t("createRecipe.addPhoto")}
              </Text>
            </View>
          )}
        </Pressable>

        <Text style={styles.label}>{t("createRecipe.titleLabel")}</Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: c.border, backgroundColor: c.card },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder={t("createRecipe.titlePlaceholder")}
        />

        <Text style={styles.label}>{t("createRecipe.descriptionLabel")}</Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: c.border, backgroundColor: c.card },
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder={t("createRecipe.descriptionPlaceholder")}
        />

        <Text style={styles.label}>{t("createRecipe.tagsLabel")}</Text>
        <TextInput
          style={[
            styles.input,
            styles.multiline,
            { borderColor: c.border, backgroundColor: c.card },
          ]}
          value={tags}
          onChangeText={setTags}
          placeholder={t("createRecipe.tagsPlaceholder")}
          multiline
        />

        <Text style={styles.label}>{t("createRecipe.ingredientsLabel")}</Text>
        <TextInput
          style={[
            styles.input,
            styles.multiline,
            { borderColor: c.border, backgroundColor: c.card },
          ]}
          value={ingredients}
          onChangeText={setIngredients}
          placeholder={t("createRecipe.ingredientsPlaceholder")}
          multiline
        />

        <Text style={styles.label}>{t("createRecipe.instructionsLabel")}</Text>
        <TextInput
          style={[
            styles.input,
            styles.multiline,
            { borderColor: c.border, backgroundColor: c.card },
          ]}
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
      </ScrollViewContainer>
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, marginBottom: 4, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  buttons: { gap: 12, marginTop: 8 },
  imagePicker: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    color: "#fff",
    fontWeight: "700",
    opacity: 0.9,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
});
