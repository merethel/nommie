import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import { LanguageProvider } from "@/src/i18n/LanguageProvider";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

/* ------------------------------------------------------------------ */
/* Global Back Button                                                  */
/* ------------------------------------------------------------------ */
function HeaderBackButton() {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.back()} hitSlop={10}>
      <Ionicons
        name="chevron-back"
        size={30}
        color="#fff"
        style={styles.backIcon}
      />
    </Pressable>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

/* ------------------------------------------------------------------ */
/* Root Stack                                                         */
/* ------------------------------------------------------------------ */
function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <LanguageProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            // header basics
            headerShown: true,
            headerTransparent: true,
            title: "",

            // remove bottom border / shadow
            headerShadowVisible: false, // iOS
            headerStyle: {
              shadowColor: "transparent",
            } as any, // Android (TS-safe)

            // global back button
            headerLeft: () => <HeaderBackButton />,
          }}
        >
          {/* Tabs manage their own headers */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Other screens automatically inherit header styles */}
        </Stack>
      </ThemeProvider>
    </LanguageProvider>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  backIcon: {
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
