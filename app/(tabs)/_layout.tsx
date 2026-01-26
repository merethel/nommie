import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { t } from "i18next";
import React from "react";

import CustomTabBar from "@/components/navigation/CustomTabBar";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={26} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <Tabs
      tabBar={(props) => (
        <CustomTabBar
          {...props}
          inactiveColor={
            colorScheme === "dark"
              ? "rgba(255,255,255,0.65)"
              : "rgba(0,0,0,0.55)"
          }
          // activeColor={theme.text} // optional if you want
        />
      )}
      screenOptions={{
        headerTitle: " ",
        headerTransparent: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: " ",
          headerTitle: " ",
          headerTransparent: true,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />

      <Tabs.Screen
        name="two"
        options={{
          title: t("tabs.recipes"),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="cutlery" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: t("tabs.favorites"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={26}
              color={focused ? theme.accent : color}
              style={{ marginBottom: -2 }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
