import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { getRecipeById } from "@/utils/recipes/recipeStorage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
    Dimensions,
    Image,
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
  };
};

type Props = {
  meals: MealSlot[];
};

const FALLBACK_PHOTO =
  "/Users/merethe/Desktop/Apps/nommie/assets/images/default_images/default1.jpg";

export default function MealsCarousel({ meals }: Props) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  const width = Dimensions.get("window").width;
  const pageWidth = Math.min(width - 32, 360); // fits inside your padding nicely
  const sidePadding = (width - pageWidth) / 2;

  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

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
    if (meal.recipe?.id) {
      openRecipe(meal.recipe.id);
    } else {
      router.push("/pages/mealPlan");
    }
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={pageWidth}
        snapToAlignment="center"
        contentContainerStyle={{ paddingHorizontal: sidePadding }}
        onMomentumScrollEnd={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          const next = Math.round(x / pageWidth);
          setIndex(next);
        }}
      >
        {items.map((meal) => {
          const title = meal.recipe?.title ?? "";
          const photoUri = meal.recipe ? FALLBACK_PHOTO : undefined; // later you can store photoUri in meal plan
          const hasRecipe = !!meal.recipe;

          return (
            <Pressable
              key={meal.type}
              onPress={() => onPressSlide(meal)}
              style={[
                styles.page,
                {
                  width: pageWidth,
                  borderColor: c.border,
                  backgroundColor: c.card,
                },
              ]}
            >
              <RNView style={styles.imageWrap}>
                {hasRecipe ? (
                  <Image
                    source={{ uri: photoUri || FALLBACK_PHOTO }}
                    style={styles.image}
                  />
                ) : (
                  <RNView style={[styles.empty, { borderColor: c.border }]}>
                    <Ionicons name="add" size={44} color={c.muted} />
                  </RNView>
                )}
              </RNView>

              <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
                {hasRecipe ? title : "Add meal"}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Dots */}
      <RNView style={styles.dotsRow}>
        {items.map((_, i) => (
          <RNView
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === index ? c.text : c.border },
            ]}
          />
        ))}
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    backgroundColor: "transparent",
  },

  page: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginHorizontal: 0,
  },

  imageWrap: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 10,
  },

  image: {
    width: "100%",
    height: 220,
  },

  empty: {
    height: 220,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },

  dotsRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    opacity: 0.9,
  },
});
