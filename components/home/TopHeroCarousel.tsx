import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { DEFAULT_RECIPE_IMAGE, PLAN_MEAL_IMAGE } from "@/constants/images";
import { getRecipeById } from "@/utils/recipes/recipeStorage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

  // ✅ auto-advance: pause while user interacts
  const isInteractingRef = useRef(false);

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
        photoUri: recipe.photoUri ?? "",
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

  // ✅ auto-advance: robust "go to index"
  const goToIndex = useCallback(
    (nextIdx: number, animated = true) => {
      scrollRef.current?.scrollTo({
        x: nextIdx * pageWidth,
        y: 0,
        animated,
      });
      setIndex(nextIdx);
    },
    [pageWidth],
  );

  // ✅ auto-advance every 3 seconds
  useEffect(() => {
    if (items.length <= 1) return;

    const id = setInterval(() => {
      if (isInteractingRef.current) return;

      setIndex((prev) => {
        const next = (prev + 1) % items.length;
        scrollRef.current?.scrollTo({
          x: next * pageWidth,
          y: 0,
          animated: true,
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(id);
  }, [items.length, pageWidth]);

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
        // ✅ auto-advance: pause while user swipes/touches
        onScrollBeginDrag={() => {
          isInteractingRef.current = true;
        }}
        onScrollEndDrag={() => {
          // momentum may continue; release a bit later
          setTimeout(() => {
            isInteractingRef.current = false;
          }, 350);
        }}
        onTouchStart={() => {
          isInteractingRef.current = true;
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            isInteractingRef.current = false;
          }, 350);
        }}
      >
        {items.map((meal) => {
          const hasRecipe = !!meal.recipe;
          const imgSource = hasRecipe
            ? meal.recipe?.photoUri
              ? { uri: meal.recipe.photoUri }
              : DEFAULT_RECIPE_IMAGE
            : PLAN_MEAL_IMAGE;

          return (
            <Pressable
              key={meal.type}
              onPress={() => onPressSlide(meal)}
              style={{ width: pageWidth }}
            >
              <ImageBackground
                source={imgSource}
                style={[styles.hero, { height }]}
                imageStyle={styles.heroImage}
                resizeMode="cover"
              >
                {!hasRecipe && (
                  <RNView style={styles.emptyOverlay}>
                    <Ionicons
                      name="add"
                      size={64}
                      color="#fff"
                      shadowColor="#000"
                      shadowOffset={{ width: 0, height: 2 }}
                      shadowOpacity={0.8}
                      shadowRadius={4}
                    />
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
  },

  dotActive: { backgroundColor: "#fff" },
  dotInactive: { backgroundColor: "rgba(255,255,255,0.45)" },

  bottomDivider: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.9,
  },
});
