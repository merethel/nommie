import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { getRecipeById } from "@/utils/recipes/recipeStorage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View as RNView,
  ScrollView,
  StyleSheet,
} from "react-native";

export type MealType = "breakfast" | "lunch" | "dinner";

export type MealSlot = {
  type: MealType;
  recipe?: {
    id: string;
    title: string;
    photoUri?: string;
  };
};

type Props = {
  meals: MealSlot[];
  height?: number;
};

const FALLBACK_PHOTO =
  "/Users/merethe/Desktop/Apps/nommie/assets/images/default_images/default1.jpg";

function mealLabel(type: MealType) {
  if (type === "breakfast") return "Breakfast";
  if (type === "lunch") return "Lunch";
  return "Dinner";
}

export default function TopHeroCarousel({ meals, height = 220 }: Props) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  const width = Dimensions.get("window").width;
  const pageWidth = width;

  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const items = useMemo(() => meals.slice(0, 3), [meals]);

  const openRecipe = async (id: string) => {
    const recipe = await getRecipeById(id);
    if (!recipe) return;

    router.push({
      pathname: "/pages/recipes/recipeInfo",
      params: {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description ?? "",
        tags: JSON.stringify(recipe.tags ?? []),
        ingredients: JSON.stringify(recipe.ingredients ?? []),
        instructions: JSON.stringify(recipe.instructions ?? []),
        photoUri: recipe.photoUri ?? FALLBACK_PHOTO,
      },
    });
  };

  const onPressSlide = (meal: MealSlot) => {
    if (meal.recipe?.id) openRecipe(meal.recipe.id);
    else router.push("/pages/mealPlan");
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setIndex(Math.round(x / pageWidth));
  };

  // Caption based on current slide (so it also stays fixed)
  const current = items[index];
  const hasRecipe = !!current?.recipe;
  const caption = current
    ? hasRecipe
      ? `${mealLabel(current.type)} · ${current.recipe!.title}`
      : `${mealLabel(current.type)} · Add meal`
    : "";

  return (
    <View style={styles.wrap}>
      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
      >
        {items.map((meal) => {
          const img = meal.recipe?.photoUri ?? FALLBACK_PHOTO;
          const empty = !meal.recipe;

          return (
            <Pressable
              key={meal.type}
              onPress={() => onPressSlide(meal)}
              style={{ width: pageWidth }}
            >
              <ImageBackground
                source={{ uri: img }}
                style={[styles.hero, { height }]}
                imageStyle={styles.heroImage}
                resizeMode="cover"
              >
                {empty && (
                  <RNView style={styles.emptyOverlay}>
                    <Ionicons name="add" size={54} color="#fff" />
                  </RNView>
                )}
              </ImageBackground>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Fixed overlay (caption + dots) */}
      <RNView style={styles.fixedOverlay} pointerEvents="none">
        <RNView style={styles.captionBg} />
        <Text style={styles.captionText} numberOfLines={2}>
          {caption}
        </Text>

        <RNView style={styles.dotsRow}>
          {items.map((_, i) => (
            <RNView
              key={i}
              style={[
                styles.dot,
                i === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </RNView>
      </RNView>

      <RNView style={[styles.bottomDivider, { backgroundColor: c.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    backgroundColor: "transparent",
  },

  hero: {
    width: "100%",
  },

  heroImage: {},

  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
  },

  // This sits on top of the carousel and does NOT move
  fixedOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    overflow: "hidden",
    marginHorizontal: 0,
  },

  captionBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  captionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  dotsRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    marginTop: 14,
  },

  dotActive: { backgroundColor: "#fff" },
  dotInactive: { backgroundColor: "rgba(255,255,255,0.45)" },

  bottomDivider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 26,
    opacity: 0.9,
  },
});
