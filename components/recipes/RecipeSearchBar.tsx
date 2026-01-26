import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { t } from "i18next";
import React from "react";
import { Keyboard, Pressable, StyleSheet, TextInput } from "react-native";

type Props = {
  query: string;
  onChangeQuery: (v: string) => void;
  resultCount?: number;
  showResultCount?: boolean;
};

export default function RecipeSearchBar({
  query,
  onChangeQuery,
  resultCount,
  showResultCount = true,
}: Props) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  const clearSearch = () => {
    onChangeQuery("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.searchBlock}>
      <View style={styles.inputWrap}>
        <TextInput
          value={query}
          onChangeText={onChangeQuery}
          placeholder={t("recipes.searchPlaceholder") || "Search recipes…"}
          placeholderTextColor={c.muted}
          style={[
            styles.searchInput,
            { backgroundColor: c.card, borderColor: c.border, color: c.text },
          ]}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {query.length > 0 && (
          <Pressable onPress={clearSearch} hitSlop={10} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={c.muted} />
          </Pressable>
        )}
      </View>

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
    marginTop: 20,
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
    paddingRight: 36,
  },
  clearBtn: {
    position: "absolute",
    right: 10,
  },
  resultCount: {
    fontSize: 12,
  },
});
