import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { t } from "i18next";
import { useMemo, useState } from "react";

import {
    Alert,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
} from "react-native";

import StyledButton from "@/components/common/StyledButton";
import { Text, View } from "@/components/Themed";
import Svg, { ClipPath, Defs, Path, Image as SvgImage } from "react-native-svg";

const RECIPES_KEY = "nommie_recipes";

type Recipe = {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string;
  createdAt?: number;
  photoUri?: string;
};

function parseIngredients(input: string): string[] {
  return input
    .split(/\n|,/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_HEIGHT = 260;
const BLEED = 28;

export default function RecipeInfo() {
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    description?: string;
    ingredients?: string; // JSON string
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

  const [isEditing, setIsEditing] = useState(false);

  // editable fields
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [ingredientsText, setIngredientsText] = useState(
    initial.ingredients.join(", "),
  );
  const [instructions, setInstructions] = useState(initial.instructions);
  const [photoUri, setPhotoUri] = useState(initial.photoUri);

  function onCancelEdit() {
    setTitle(initial.title);
    setDescription(initial.description);
    setIngredientsText(initial.ingredients.join(", "));
    setInstructions(initial.instructions);
    setIsEditing(false);
    setPhotoUri(initial.photoUri);
  }

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

  function onPressHeaderImage() {
    if (!isEditing) return;
    void pickImage();
  }

  function removeImage() {
    setPhotoUri("");
  }

  async function onSave() {
    const updated: Partial<Recipe> = {
      title: title.trim(),
      description: description.trim(),
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

      let nextRecipes: Recipe[] | null = null;

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
        ingredients: JSON.stringify(updated.ingredients ?? []),
        instructions: updated.instructions ?? "",
        photoUri: updated.photoUri ?? "",
      });
    } catch (e) {
      console.warn("Failed to save recipe:", e);
      Alert.alert("Could not save changes");
    }
  }

  const svgW = SCREEN_WIDTH + BLEED * 2;
  const svgH = HEADER_HEIGHT;

  const wavePath = `
  M ${svgW} 0
  H -10
  V ${svgH - 170}
  C ${svgW * 0.15} ${svgH},
    ${svgW * 0.45} ${svgH - 10},
    ${svgW * 0.6} ${svgH - 17}
  C ${svgW * 0.85} ${svgH - 30},
    ${svgW * 0.9} ${svgH + 3},
    ${svgW} ${svgH}
  Z
`;

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerShown: true,
          headerBackground: () => null,
          headerBackButtonDisplayMode: "minimal",
          headerTintColor: "#000",
          headerTransparent: true,

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
        {/* WAVY HEADER IMAGE */}
        {!!photoUri ? (
          <View
            style={[
              styles.wavyHeaderWrap,
              isEditing && styles.wavyHeaderWrapEditing,
              { backgroundColor: "transparent" },
            ]}
          >
            {/* Tap image to change (only in edit mode) */}
            <Pressable onPress={onPressHeaderImage} disabled={!isEditing}>
              <Svg
                width={svgW}
                height={svgH - 23}
                viewBox={`0 0 ${svgW} ${svgH}`}
              >
                <Defs>
                  <ClipPath id="wavyClip">
                    <Path d={wavePath} />
                  </ClipPath>
                </Defs>

                <SvgImage
                  href={{ uri: photoUri }}
                  width="100%"
                  height="100%"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath="url(#wavyClip)"
                />
              </Svg>
            </Pressable>

            {isEditing && (
              <Pressable
                onPress={removeImage}
                hitSlop={10}
                style={styles.removeBadge}
              >
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            )}
          </View>
        ) : (
          isEditing && (
            <Pressable onPress={pickImage} style={styles.placeholderWrap}>
              <View style={styles.placeholderCard}>
                <Text style={styles.placeholderText}>
                  {t("createRecipe.addPhoto")}
                </Text>
              </View>
            </Pressable>
          )
        )}

        {/* CONTENT ABOVE HEADER
            box-none allows taps to pass through empty areas to the header in edit mode,
            while inputs/buttons still receive touches.
        */}
        <View style={styles.content} pointerEvents="box-none">
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
            <Text style={styles.label}>
              {t("createRecipe.descriptionLabel")}
            </Text>
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

          {/* Save / Delete */}
          {isEditing && (
            <View style={styles.saveWrap}>
              <StyledButton title={t("common.save")} onPress={onSave} />
              <StyledButton
                title={t("common.delete")}
                onPress={() => {
                  Alert.alert(
                    "Delete recipe",
                    "Are you sure you want to delete this recipe?",
                    [
                      { text: t("common.cancel"), style: "cancel" },
                      {
                        text: t("common.delete"),
                        style: "destructive",
                        onPress: async () => {
                          try {
                            const json =
                              await AsyncStorage.getItem(RECIPES_KEY);
                            const recipes: Recipe[] = json
                              ? JSON.parse(json)
                              : [];

                            const nextRecipes = recipes.filter(
                              (r) =>
                                r.id !== initial.id &&
                                r.title !== initial.title,
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
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 28,
    position: "relative",
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

  // Wavy header behind content by default
  wavyHeaderWrap: {
    position: "absolute",
    top: -BLEED,
    left: -BLEED,
    right: -BLEED,
    height: HEADER_HEIGHT, // keeps hit area consistent
    zIndex: 0,
  },

  // In edit mode, bring it above so it can receive taps
  wavyHeaderWrapEditing: {
    zIndex: 5,
  },

  // Placeholder if there is no photo yet
  placeholderWrap: {
    position: "absolute",
    top: -BLEED,
    left: -BLEED,
    right: -BLEED,
    height: HEADER_HEIGHT,
    zIndex: 5, // it should be tappable in edit mode
  },
  placeholderCard: {
    height: HEADER_HEIGHT,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  placeholderText: {
    opacity: 0.7,
    fontWeight: "700",
  },

  // Content above header
  content: {
    zIndex: 1,
    backgroundColor: "transparent",
    paddingTop: HEADER_HEIGHT - 120,
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

  removeBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  removeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 18,
  },
});
