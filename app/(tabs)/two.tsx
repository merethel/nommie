import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import NotFoundScreen from "../+not-found";

export default function TabTwoScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("tabs.recipes")}</Text>
      <NotFoundScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold" },
});
