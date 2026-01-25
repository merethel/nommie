import { StyleSheet } from "react-native";

import ScreenContainer from "@/components/common/ScreenConatiner";
import StyledButton from "@/components/common/StyledButton";
import { Text, View } from "@/components/Themed";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function TabOneScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: t("tabs.home") }} />
      <Text style={styles.title}>{t("tabs.home")}</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <View>
        <StyledButton
          title={t("createRecipe.screenTitle")}
          onPress={() => router.push("../pages/recipes/createRecipe")}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
