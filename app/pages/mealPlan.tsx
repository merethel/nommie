import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Stack } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet } from "react-native";

import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import { Text, View } from "@/components/Themed";

import RecipeSearchBar, {
    RecipeSearchScope,
} from "@/components/recipes/RecipeSearchBar";
import {
    DayMealPlan,
    MealType,
    PlannedRecipeRef,
    readTodayMealPlan,
    setTodayMealSlot,
} from "@/utils/mealPlan/mealPlanStorage";
import { filterRecipes } from "@/utils/recipes/searchRecipes";

const RECIPES_KEY = "nommie_recipes";

type Recipe = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  ingredients: string[];
  instructions: string[];
  photoUri?: string;
  createdAt: number;
  isFavorite?: boolean;
};

function slotLabel(t: (k: string) => string, type: MealType) {
  if (type === "breakfast") return t("meals.breakfast") || "Breakfast";
  if (type === "lunch") return t("meals.lunch") || "Lunch";
  return t("meals.dinner") || "Dinner";
}

export default function MealPlanScreen() {
  const { t } = useTranslation();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plan, setPlan] = useState<DayMealPlan>({});
  const [activeSlot, setActiveSlot] = useState<MealType | null>(null);

  // search UI for picking recipes
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<RecipeSearchScope>({
    text: true,
    tags: true,
    ingredients: true,
  });

  const allOff = !scope.text && !scope.tags && !scope.ingredients;
  const hasQuery = query.trim().length > 0;

  const load = useCallback(async () => {
    const json = await AsyncStorage.getItem(RECIPES_KEY);
    setRecipes(json ? (JSON.parse(json) as Recipe[]) : []);

    const today = await readTodayMealPlan();
    setPlan(today);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(
    () => filterRecipes(recipes, query, scope),
    [recipes, query, scope],
  );

  const onPickRecipe = useCallback(
    async (recipe: Recipe) => {
      if (!activeSlot) return;
      const ref: PlannedRecipeRef = { id: recipe.id, title: recipe.title };
      const next = await setTodayMealSlot(activeSlot, ref);
      setPlan(next);
      setActiveSlot(null);
      setQuery("");
    },
    [activeSlot],
  );

  const onClearSlot = useCallback(
    async (type: MealType) => {
      const next = await setTodayMealSlot(type, null);
      setPlan(next);
      if (activeSlot === type) setActiveSlot(null);
    },
    [activeSlot],
  );

  return (
    <ScrollViewContainer
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Stack.Screen options={{ title: t("meals.planTitle") || "Meal plan" }} />

      {/* Today slots */}
      <View style={styles.card}>
        {(["breakfast", "lunch", "dinner"] as MealType[]).map((type) => {
          const slot = plan[type] ?? null;
          const selected = activeSlot === type;

          return (
            <View key={type} style={styles.slotRow}>
              <Text style={styles.slotLabel}>{slotLabel(t, type)}</Text>

              {slot ? (
                <View style={styles.slotFilled}>
                  <Text style={styles.slotTitle}>{slot.title}</Text>

                  <View style={styles.slotActions}>
                    <Pressable onPress={() => setActiveSlot(type)}>
                      <Text style={styles.actionText}>
                        {t("common.swap") || "Swap"}
                      </Text>
                    </Pressable>

                    <Pressable onPress={() => onClearSlot(type)}>
                      <Text style={[styles.actionText, styles.dangerText]}>
                        {t("common.clear") || "Clear"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable onPress={() => setActiveSlot(type)}>
                  <Text style={styles.actionText}>
                    {t("meals.chooseRecipe") || "Choose recipe"}
                  </Text>
                </Pressable>
              )}

              {selected && (
                <Text style={styles.pickingHint}>
                  {t("meals.pickingFor") || "Picking for"} {slotLabel(t, type)}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Picker */}
      {activeSlot && (
        <View style={styles.pickerCard}>
          <Text style={styles.pickerTitle}>
            {t("meals.pickRecipe") || "Pick a recipe"}
          </Text>

          <RecipeSearchBar
            query={query}
            onChangeQuery={setQuery}
            scope={scope}
            onChangeScope={setScope}
            resultCount={filtered.length}
          />

          {allOff && hasQuery ? (
            <Text style={styles.helperText}>
              {t("recipes.turnOnFilter") ||
                "Choose at least one filter (Text / Tags / Ingredients)."}
            </Text>
          ) : filtered.length === 0 ? (
            <Text style={styles.helperText}>
              {t("recipes.emptySearch") || "No recipes found for your search."}
            </Text>
          ) : (
            filtered.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => onPickRecipe(r)}
                style={styles.pickRow}
              >
                <Text style={styles.pickTitle}>{r.title}</Text>
                {!!r.description && (
                  <Text style={styles.pickSubtitle} numberOfLines={1}>
                    {r.description}
                  </Text>
                )}
              </Pressable>
            ))
          )}

          <Pressable
            onPress={() => setActiveSlot(null)}
            style={styles.closePickerBtn}
          >
            <Text style={styles.closePickerText}>
              {t("common.cancel") || "Cancel"}
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollViewContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 14,
  },

  slotRow: {
    gap: 6,
  },

  slotLabel: {
    fontSize: 14,
    fontWeight: "700",
    opacity: 0.8,
  },

  slotFilled: {
    gap: 6,
  },

  slotTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  slotActions: {
    flexDirection: "row",
    gap: 16,
  },

  actionText: {
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.7,
  },

  dangerText: {
    opacity: 0.9,
  },

  pickingHint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },

  pickerCard: {
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 10,
  },

  pickerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  helperText: {
    opacity: 0.7,
    paddingVertical: 8,
  },

  pickRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },

  pickTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  pickSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },

  closePickerBtn: {
    paddingVertical: 10,
    alignSelf: "flex-start",
  },

  closePickerText: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.7,
  },
});
