import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import React, { useEffect, useMemo } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

/* ───────────────────────── constants (NO hooks here) ───────────────────────── */

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BAR_MARGIN_H = 18;
const BAR_HEIGHT = 64;
const BAR_RADIUS = 28;

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

/* ───────────────────────── types ───────────────────────── */

type CustomTabBarProps = BottomTabBarProps & {
  activeColor?: string;
  inactiveColor?: string;
};

/* ───────────────────────── component ───────────────────────── */

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
  insets,
  activeColor,
  inactiveColor,
}: CustomTabBarProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // ✅ MUCH darker active icon
  const finalActiveColor = activeColor ?? theme.tabIconActive;

  const finalInactiveColor = inactiveColor ?? theme.tabIconDefault;

  const tabCount = state.routes.length;
  const barWidth = SCREEN_WIDTH;
  const slotWidth = barWidth / tabCount;

  const x = useSharedValue(slotWidth * state.index + slotWidth / 2);

  useEffect(() => {
    x.value = withSpring(slotWidth * state.index + slotWidth / 2, {
      damping: 16,
      stiffness: 160,
      mass: 0.6,
    });
  }, [state.index, slotWidth]);

  const blobW = Math.min(64, slotWidth * 0.75);
  const blobH = 42;

  const blobPath = useMemo(() => {
    const w = blobW;
    const h = blobH;
    return `
      M ${w * 0.15} ${h * 0.55}
      C ${w * 0.15} ${h * 0.15}, ${w * 0.35} ${h * 0.05}, ${w * 0.5} ${h * 0.05}
      C ${w * 0.65} ${h * 0.05}, ${w * 0.85} ${h * 0.15}, ${w * 0.85} ${h * 0.55}
      C ${w * 0.85} ${h * 0.9}, ${w * 0.65} ${h * 0.98}, ${w * 0.5} ${h * 0.98}
      C ${w * 0.35} ${h * 0.98}, ${w * 0.15} ${h * 0.9}, ${w * 0.15} ${h * 0.55}
      Z
    `;
  }, [blobW, blobH]);

  const blobStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: x.value - blobW / 2 }, { translateY: 10 }],
    };
  });

  return (
    <View
      style={[styles.wrap, { bottom: insets.bottom }]} // ✅ flush to bottom (safe-area aware)
      pointerEvents="box-none"
    >
      <View style={[styles.barOuter, { width: barWidth, height: BAR_HEIGHT }]}>
        <BlurView
          intensity={scheme === "dark" ? 45 : 55}
          tint={scheme === "dark" ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        >
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor:
                scheme === "dark"
                  ? "rgba(246,196,83,0.08)"
                  : "rgba(244,169,56,0.10)",
            }}
          />
        </BlurView>

        <Animated.View style={[styles.blob, blobStyle]} pointerEvents="none">
          <AnimatedSvg width={blobW} height={blobH}>
            <Path
              d={blobPath}
              fill={
                scheme === "dark"
                  ? "rgba(246,196,83,0.28)"
                  : "rgba(244,169,56,0.28)"
              }
            />
          </AnimatedSvg>
        </Animated.View>

        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const focused = state.index === index;

            return (
              <TabButton
                key={route.key}
                width={slotWidth}
                focused={focused}
                onPress={() => navigation.navigate(route.name)}
                renderIcon={options.tabBarIcon}
                activeColor={finalActiveColor}
                inactiveColor={finalInactiveColor}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

/* ───────────────────────── tab button ───────────────────────── */

function TabButton({
  width,
  focused,
  onPress,
  renderIcon,
  activeColor,
  inactiveColor,
}: {
  width: number;
  focused: boolean;
  onPress: () => void;
  renderIcon?: BottomTabBarProps["descriptors"][string]["options"]["tabBarIcon"];
  activeColor: string;
  inactiveColor: string;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.item, { width }]}>
      {renderIcon?.({
        focused,
        color: focused ? activeColor : inactiveColor,
        size: 24,
      })}
    </Pressable>
  );
}

/* ───────────────────────── styles ───────────────────────── */

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  barOuter: {
    borderRadius: BAR_RADIUS,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(244,169,56,0.3)",
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  item: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  blob: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
