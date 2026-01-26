// components/recipes/RecipeSearchBar.tsx
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { t } from "i18next";
import React from "react";
import {
  Keyboard,
  Pressable,
  View as RNView,
  StyleSheet,
  TextInput,
} from "react-native";

export type RecipeSearchScope = {
  text: boolean; // title + description
  tags: boolean;
  ingredients: boolean;
};

type Props = {
  query: string;
  onChangeQuery: (v: string) => void;

  scope: RecipeSearchScope;
  onChangeScope: (next: RecipeSearchScope) => void;

  resultCount?: number;
  showResultCount?: boolean;
};

export default function RecipeSearchBar({
  query,
  onChangeQuery,
  scope,
  onChangeScope,
  resultCount,
  showResultCount = true,
}: Props) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  const toggle = (key: keyof RecipeSearchScope) => {
    onChangeScope({ ...scope, [key]: !scope[key] });
  };

  const clearSearch = () => {
    onChangeQuery("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.searchBlock}>
      {/* Search input + clear button */}
      <View style={styles.inputWrap}>
        <TextInput
          value={query}
          onChangeText={onChangeQuery}
          placeholder={t("recipes.searchPlaceholder") || "Search recipes…"}
          placeholderTextColor={c.muted}
          style={[
            styles.searchInput,
            {
              backgroundColor: c.card,
              borderColor: c.border,
              color: c.text,
            },
          ]}
        />

        {query.length > 0 && (
          <Pressable onPress={clearSearch} hitSlop={10} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={c.muted} />
          </Pressable>
        )}
      </View>

      {/* Scope chips */}
      <RNView style={styles.chipsRow}>
        <Pressable
          onPress={() => toggle("text")}
          style={[
            styles.scopeChip,
            {
              backgroundColor: scope.text ? c.secondary : "transparent",
              borderColor: c.border,
            },
          ]}
        >
          <Text style={styles.scopeChipText}>
            {t("recipes.searchText") || "Text"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => toggle("tags")}
          style={[
            styles.scopeChip,
            {
              backgroundColor: scope.tags ? c.secondary : "transparent",
              borderColor: c.border,
            },
          ]}
        >
          <Text style={styles.scopeChipText}>
            {t("recipes.searchTags") || "Tags"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => toggle("ingredients")}
          style={[
            styles.scopeChip,
            {
              backgroundColor: scope.ingredients ? c.secondary : "transparent",
              borderColor: c.border,
            },
          ]}
        >
          <Text style={styles.scopeChipText}>
            {t("recipes.searchIngredients") || "Ingredients"}
          </Text>
        </Pressable>
      </RNView>

      {/* Result count */}
      {showResultCount &&
        query.trim().length > 0 &&
        typeof resultCount === "number" && (
          <Text style={[styles.resultCount, { color: c.muted }]}>
            {resultCount}{" "}
            {resultCount === 1
              ? t("recipes.oneResult")
              : t("recipes.manyResults")}
          </Text>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBlock: {
    gap: 10,
    marginBottom: 12,
    backgroundColor: "transparent",
  },

  inputWrap: {
    position: "relative",
    justifyContent: "center",
  },

  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingRight: 36, // 👈 space for the X button
  },

  clearBtn: {
    position: "absolute",
    right: 10,
  },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  scopeChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },

  scopeChipText: {
    fontSize: 12,
    fontWeight: "600",
  },

  resultCount: {
    fontSize: 12,
  },
});
