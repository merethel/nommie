import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet } from "react-native";

import ScrollViewContainer from "@/components/common/ScrollViewContainer";
import HeaderPillButton from "@/components/navigation/HeaderPillButton";
import RecipeSearchBar from "@/components/recipes/RecipeSearchBar";
import { Text, View } from "@/components/Themed";

import {
    DayMealPlan,
    MealType,
    PlannedRecipeRef,
    readTodayMealPlan,
    writeTodayMealPlan,
} from "@/utils/mealPlan/mealPlanStorage";

import { RECIPES_KEY } from "@/constants/storageKeys";
import { Recipe } from "@/src/types/recipe";
import { filterRecipes } from "@/utils/recipes/searchRecipes";

function slotLabel(t: (k: string) => string, type: MealType) {
  if (type === "breakfast") return t("meals.breakfast") || "Breakfast";
  if (type === "lunch") return t("meals.lunch") || "Lunch";
  return t("meals.dinner") || "Dinner";
}

function plansEqual(a: DayMealPlan, b: DayMealPlan) {
  return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});
}

export default function MealPlanTabScreen() {
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

    const today = await readTodayMealPlan();
    setSavedPlan(today);
    setDraftPlan(today);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(
    () => filterRecipes(recipes, query),
    [recipes, query],
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

  const onClearSlot = useCallback(
    (type: MealType) => {
      setDraftPlan((prev) => ({
        ...prev,
        [type]: null,
      }));
      if (activeSlot === type) setActiveSlot(null);
    },
    [activeSlot],
  );

  const onCancelChanges = useCallback(() => {
    setDraftPlan(savedPlan);
    setActiveSlot(null);
    setQuery("");
  }, [savedPlan]);

  const onSaveChanges = useCallback(async () => {
    await writeTodayMealPlan(draftPlan);
    setSavedPlan(draftPlan);
    setActiveSlot(null);
    setQuery("");
  }, [draftPlan]);

  return (
    <ScrollViewContainer
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ padding: 16, paddingTop: 12 }}
    >
      {/* Header row inside the screen (since tab headers vary) */}
      <View style={styles.topRow}>
        <Text style={styles.title}>{t("meals.planTitle") || "Meal plan"}</Text>

        <View style={styles.topActions}>
          {/* Optional: open calendar page */}
          <HeaderPillButton
            label={t("meals.calendar") || "Calendar"}
            onPress={() => router.push("/pages/mealPlan")}
          />

          {isDirty ? (
            <HeaderPillButton
              label={t("common.save") || "Save"}
              onPress={onSaveChanges}
            />
          ) : null}
        </View>
      </View>

      {/* Today slots */}
      <View style={styles.card}>
        {(["breakfast", "lunch", "dinner"] as MealType[]).map((type) => {
          const slot = (draftPlan as any)[type] ?? null;
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

      {isDirty && (
        <View style={styles.bottomActions}>
          <Pressable onPress={onCancelChanges} style={styles.bottomBtn}>
            <Text style={styles.bottomBtnText}>
              {t("common.cancel") || "Cancel"}
            </Text>
          </Pressable>

          <Pressable onPress={onSaveChanges} style={styles.bottomBtn}>
            <Text style={styles.bottomBtnText}>
              {t("common.save") || "Save"}
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollViewContainer>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "800" },
  topActions: { flexDirection: "row", gap: 8 },

  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 14,
  },
  slotRow: { gap: 6 },
  slotLabel: { fontSize: 14, fontWeight: "700", opacity: 0.8 },
  slotFilled: { gap: 6 },
  slotTitle: { fontSize: 16, fontWeight: "600" },
  slotActions: { flexDirection: "row", gap: 16 },
  actionText: { fontSize: 13, fontWeight: "600", opacity: 0.7 },
  dangerText: { opacity: 0.9 },
  pickingHint: { fontSize: 12, opacity: 0.6, marginTop: 2 },

  pickerCard: {
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 10,
  },
  pickerTitle: { fontSize: 16, fontWeight: "700" },
  helperText: { opacity: 0.7, paddingVertical: 8 },
  pickRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  pickTitle: { fontSize: 15, fontWeight: "600" },
  pickSubtitle: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  closePickerBtn: { paddingVertical: 10, alignSelf: "flex-start" },
  closePickerText: { fontSize: 13, fontWeight: "700", opacity: 0.7 },

  bottomActions: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  bottomBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  bottomBtnText: {
    fontSize: 14,
    fontWeight: "700",
    opacity: 0.8,
  },
});
