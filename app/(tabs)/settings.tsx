import { Text, View } from "@/components/Themed";
import { useLanguage } from "@/src/i18n/LanguageProvider";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet } from "react-native";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t("settings.screenTitle") }} />

      <Text style={styles.header}>{t("settings.language")}</Text>

      <View style={styles.row}>
        <LangButton
          label={t("settings.english")}
          active={language === "en"}
          onPress={() => setLanguage("en")}
        />
        <LangButton
          label={t("settings.danish")}
          active={language === "da"}
          onPress={() => setLanguage("da")}
        />
      </View>
    </View>
  );
}

function LangButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, active && styles.buttonActive]}
    >
      <Text style={[styles.buttonText, active && styles.buttonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  header: { fontSize: 16, fontWeight: "700" },
  row: { flexDirection: "row", gap: 12 },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buttonActive: {
    borderColor: "#333",
  },
  buttonText: { fontWeight: "600" },
  buttonTextActive: { fontWeight: "800" },
});
