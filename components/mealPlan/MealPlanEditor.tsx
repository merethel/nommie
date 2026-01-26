import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import MealPlanSlotCard from "@/components/mealPlan/MealPlanSlotCard";
import HeaderPillButton from "@/components/navigation/HeaderPillButton";
import RecipeSearchBar from "@/components/recipes/RecipeSearchBar";

import { RECIPES_KEY } from "@/constants/storageKeys";
import { Recipe } from "@/src/types/recipe";
import { filterRecipes } from "@/utils/recipes/searchRecipes";

import {
    DayMealPlan,
    MealType,
    PlannedRecipeRef,
    readMealPlanDay,
    writeMealPlanDay,
} from "@/utils/mealPlan/mealPlanStorage";

function plansEqual(a: DayMealPlan, b: DayMealPlan) {
  return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});
}

function slotMeta(t: (k: string) => string, type: MealType) {
  if (type === "breakfast") {
    return {
      label: t("meals.breakfast") || "Breakfast",
      icon: "sunny-outline" as const,
      emptyHint: t("meals.chooseRecipe") || "Choose recipe",
    };
  }
  if (type === "lunch") {
    return {
      label: t("meals.lunch") || "Lunch",
      icon: "leaf-outline" as const,
      emptyHint: t("meals.chooseRecipe") || "Choose recipe",
    };
  }
  return {
    label: t("meals.dinner") || "Dinner",
    icon: "restaurant-outline" as const,
    emptyHint: t("meals.chooseRecipe") || "Choose recipe",
  };
}

export default function MealPlanEditor({ dateKey }: { dateKey: string }) {
  const { t } = useTranslation();

  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const [savedPlan, setSavedPlan] = useState<DayMealPlan>({});
  const [draftPlan, setDraftPlan] = useState<DayMealPlan>({});

  const [activeSlot, setActiveSlot] = useState<MealType | null>(null);

  const [query, setQuery] = useState("");

  const isDirty = useMemo(
    () => !plansEqual(savedPlan, draftPlan),
    [savedPlan, draftPlan],
  );

  const load = useCallback(async () => {
    const json = await AsyncStorage.getItem(RECIPES_KEY);
    setRecipes(json ? (JSON.parse(json) as Recipe[]) : []);

    const day = await readMealPlanDay(dateKey);
    setSavedPlan(day);
    setDraftPlan(day);
  }, [dateKey]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(
    () => filterRecipes(recipes, query),
    [recipes, query],
  );

  const onOpenOrPick = useCallback(
    (type: MealType) => {
      const slot = (draftPlan as any)[type] as
        | PlannedRecipeRef
        | null
        | undefined;

      // If filled: open recipe info
      if (slot?.id) {
        router.push({
          pathname: "/pages/recipes/recipeInfo",
          params: { id: slot.id },
        });
        return;
      }

      // If empty: open picker
      setActiveSlot(type);
      setQuery("");
    },
    [draftPlan],
  );

  const onPickRecipe = useCallback(
    (recipe: Recipe) => {
      if (!activeSlot) return;

      const ref: PlannedRecipeRef = {
        id: recipe.id,
        title: recipe.title,
        photoUri: recipe.photoUri ?? "",
      };

      setDraftPlan((prev) => ({
        ...prev,
        [activeSlot]: ref,
      }));

      setActiveSlot(null);
      setQuery("");
    },
    [activeSlot],
  );

  const onClearSlot = useCallback((type: MealType) => {
    setDraftPlan((prev) => ({
      ...prev,
      [type]: null,
    }));
    setActiveSlot((prev) => (prev === type ? null : prev));
  }, []);

  const onSwapSlot = useCallback((type: MealType) => {
    setActiveSlot(type);
    setQuery("");
  }, []);

  const onCancelChanges = useCallback(() => {
    setDraftPlan(savedPlan);
    setActiveSlot(null);
    setQuery("");
  }, [savedPlan]);

  const onSaveChanges = useCallback(async () => {
    await writeMealPlanDay(dateKey, draftPlan);
    setSavedPlan(draftPlan);
    setActiveSlot(null);
    setQuery("");
  }, [dateKey, draftPlan]);

  return (
    <View style={{ gap: 12 }}>
      {/* Slots */}
      <MealPlanSlotCard
        icon={slotMeta(t, "breakfast").icon}
        label={slotMeta(t, "breakfast").label}
        recipe={draftPlan.breakfast ?? null}
        hint={
          draftPlan.breakfast
            ? t("meals.tapToView") || "Tap to view"
            : slotMeta(t, "breakfast").emptyHint
        }
        onPress={() => onOpenOrPick("breakfast")}
        onSwap={draftPlan.breakfast ? () => onSwapSlot("breakfast") : undefined}
        onClear={
          draftPlan.breakfast ? () => onClearSlot("breakfast") : undefined
        }
      />

      <MealPlanSlotCard
        icon={slotMeta(t, "lunch").icon}
        label={slotMeta(t, "lunch").label}
        recipe={draftPlan.lunch ?? null}
        hint={
          draftPlan.lunch
            ? t("meals.tapToView") || "Tap to view"
            : slotMeta(t, "lunch").emptyHint
        }
        onPress={() => onOpenOrPick("lunch")}
        onSwap={draftPlan.lunch ? () => onSwapSlot("lunch") : undefined}
        onClear={draftPlan.lunch ? () => onClearSlot("lunch") : undefined}
      />

      <MealPlanSlotCard
        icon={slotMeta(t, "dinner").icon}
        label={slotMeta(t, "dinner").label}
        recipe={draftPlan.dinner ?? null}
        hint={
          draftPlan.dinner
            ? t("meals.tapToView") || "Tap to view"
            : slotMeta(t, "dinner").emptyHint
        }
        onPress={() => onOpenOrPick("dinner")}
        onSwap={draftPlan.dinner ? () => onSwapSlot("dinner") : undefined}
        onClear={draftPlan.dinner ? () => onClearSlot("dinner") : undefined}
      />

      {/* Dirty actions */}
      {isDirty && (
        <View style={styles.actionsRow}>
          <HeaderPillButton
            label={t("common.cancel") || "Cancel"}
            onPress={onCancelChanges}
          />
          <HeaderPillButton
            label={t("common.save") || "Save"}
            onPress={onSaveChanges}
          />
        </View>
      )}

      {/* Picker */}
      {activeSlot && (
        <View style={styles.pickerCard}>
          <Text style={styles.pickerTitle}>
            {t("meals.pickRecipe") || "Pick a recipe"}
          </Text>

          <RecipeSearchBar
            query={query}
            onChangeQuery={setQuery}
            resultCount={filtered.length}
          />

          {filtered.length === 0 ? (
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
    </View>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },

  pickerCard: {
    marginTop: 6,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 10,
  },
  pickerTitle: { fontSize: 16, fontWeight: "800" },
  helperText: { opacity: 0.7, paddingVertical: 8 },

  pickRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  pickTitle: { fontSize: 15, fontWeight: "700" },
  pickSubtitle: { fontSize: 12, opacity: 0.7, marginTop: 2 },

  closePickerBtn: { paddingVertical: 10, alignSelf: "flex-start" },
  closePickerText: { fontSize: 13, fontWeight: "800", opacity: 0.7 },
});
