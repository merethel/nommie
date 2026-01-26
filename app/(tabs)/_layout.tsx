import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { t } from "i18next";
import React from "react";

import CustomTabBar from "@/components/navigation/CustomTabBar"; // <-- ADD THIS

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
      // 👇 THIS is the key change
      tabBar={(props) => (
        <CustomTabBar
          {...props}
          // optional: pass theme colors into your custom bar

          inactiveColor={
            colorScheme === "dark"
              ? "rgba(255,255,255,0.65)"
              : "rgba(0,0,0,0.55)"
          }
        />
      )}
      screenOptions={{
        headerTitle: " ",
        headerTransparent: true,
        // These are mostly ignored once you override tabBar, but keeping header settings is fine.
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
    </Tabs>
  );
}
