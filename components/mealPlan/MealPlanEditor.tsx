import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import RecipeSearchBar from "@/components/recipes/RecipeSearchBar";
import { RECIPES_KEY } from "@/constants/storageKeys";
import { Recipe } from "@/src/types/recipe";
import { filterRecipes } from "@/utils/recipes/searchRecipes";

import HeaderPillButton from "@/components/navigation/HeaderPillButton";
import {
    clearMealPlanDay,
    DayMealPlan,
    MealType,
    PlannedRecipeRef,
    readMealPlanDay,
    writeMealPlanDay,
} from "@/utils/mealPlan/mealPlanStorage";

function slotLabel(t: (k: string) => string, type: MealType) {
  if (type === "breakfast") return t("meals.breakfast") || "Breakfast";
  if (type === "lunch") return t("meals.lunch") || "Lunch";
  return t("meals.dinner") || "Dinner";
}

function plansEqual(a: DayMealPlan, b: DayMealPlan) {
  return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});
}

type Props = {
  dateKey: string; // YYYY-MM-DD
  headerRightSlot?: (args: {
    isDirty: boolean;
    onSave: () => void;
  }) => React.ReactNode;
  showClearDay?: boolean;
};

export default function MealPlanEditor({
  dateKey,
  headerRightSlot,
  showClearDay = true,
}: Props) {
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
    await writeMealPlanDay(dateKey, draftPlan);
    setSavedPlan(draftPlan);
    setActiveSlot(null);
    setQuery("");
  }, [dateKey, draftPlan]);

  const onClearDay = useCallback(async () => {
    await clearMealPlanDay(dateKey);
    setSavedPlan({});
    setDraftPlan({});
    setActiveSlot(null);
    setQuery("");
  }, [dateKey]);

  return (
    <View style={{ gap: 12 }}>
      {/* optional header right injection (for Stack header in pages) */}
      {headerRightSlot?.({ isDirty, onSave: onSaveChanges })}

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

      {showClearDay && (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <HeaderPillButton
            label={t("common.cancel") || "Cancel"}
            onPress={onCancelChanges}
            disabled={!isDirty}
          />
          <HeaderPillButton
            label={t("common.save") || "Save"}
            onPress={onSaveChanges}
            disabled={!isDirty}
          />
          <HeaderPillButton
            label={t("common.clear") || "Clear day"}
            onPress={onClearDay}
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
    marginTop: 4,
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
});
