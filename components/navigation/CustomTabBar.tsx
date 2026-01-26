import MaskedView from "@react-native-masked-view/masked-view";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import React, { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, { Defs, G, Mask, Path, Rect } from "react-native-svg";

import { useColorScheme } from "@/components/useColorScheme";
import {
  buildNotchMaskPath,
  buildNotchStrokePath,
} from "@/utils/navigation/notchPaths";

/* ───────────────────────── constants ───────────────────────── */

const BAR_HEIGHT = 64;

const NOTCH_DEPTH = 50;
const MAX_NOTCH_WIDTH = 120;

const LIFT_Y = 18;

const BAR_SPRING = { damping: 16, stiffness: 180, mass: 0.6 } as const;
const LIFT_SPRING = { damping: 14, stiffness: 220, mass: 0.55 } as const;

const AnimatedG = Animated.createAnimatedComponent(G);

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
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const { width: barWidth } = useWindowDimensions();

  const tabCount = state.routes.length || 1;
  const slotWidth = barWidth / tabCount;

  const finalActiveColor = activeColor ?? (scheme === "dark" ? "#fff" : "#000");
  const finalInactiveColor =
    inactiveColor ??
    (scheme === "dark" ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.55)");

  const notchW = Math.min(MAX_NOTCH_WIDTH, slotWidth * 1.15);

  const notchMaskPath = useMemo(
    () => buildNotchMaskPath(notchW, NOTCH_DEPTH),
    [notchW],
  );

  const notchStrokePath = useMemo(
    () => buildNotchStrokePath(notchW, NOTCH_DEPTH),
    [notchW],
  );

  // Active center X
  const centerX = useSharedValue(slotWidth * state.index + slotWidth / 2);

  useEffect(() => {
    centerX.value = withSpring(
      slotWidth * state.index + slotWidth / 2,
      BAR_SPRING,
    );
  }, [state.index, slotWidth, centerX]);

  const notchGProps = useAnimatedProps(() => ({
    transform: [{ translateX: centerX.value - notchW / 2 }],
  }));

  const notchBorderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: centerX.value - notchW / 2 }],
  }));

  const blurIntensity = scheme === "dark" ? 45 : 55;
  const blurTint = scheme === "dark" ? "dark" : "light";

  return (
    <View
      style={[styles.wrap, { paddingBottom: insets.bottom }]}
      pointerEvents="box-none"
    >
      <View style={[styles.container, { width: barWidth, height: BAR_HEIGHT }]}>
        {/* Blur + border + notch cutout */}
        <MaskedView
          style={styles.barShell}
          maskElement={
            <Svg width={barWidth} height={BAR_HEIGHT}>
              <Defs>
                <Mask id="cut">
                  <Rect width={barWidth} height={BAR_HEIGHT} fill="white" />
                  <AnimatedG animatedProps={notchGProps}>
                    <Path d={notchMaskPath} fill="black" />
                  </AnimatedG>
                </Mask>
              </Defs>
              <Rect
                width={barWidth}
                height={BAR_HEIGHT}
                fill="black"
                mask="url(#cut)"
              />
            </Svg>
          }
        >
          <BlurView
            intensity={blurIntensity}
            tint={blurTint}
            style={StyleSheet.absoluteFill}
          />

          {/* Masked bar border (won't cross notch) */}
          <View pointerEvents="none" style={styles.barBorder} />
        </MaskedView>

        {/* Curved notch border (no top line) */}
        <Animated.View
          style={[styles.notchBorder, notchBorderStyle]}
          pointerEvents="none"
        >
          <Svg width={notchW} height={NOTCH_DEPTH}>
            <Path
              d={notchStrokePath}
              fill="transparent"
              stroke="rgba(242,184,75,0.55)"
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>

        {/* Tabs */}
        <View style={styles.tabsLayer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const focused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabButton
                key={route.key}
                width={slotWidth}
                focused={focused}
                onPress={onPress}
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

type TabButtonProps = {
  width: number;
  focused: boolean;
  onPress: () => void;
  renderIcon?: BottomTabBarProps["descriptors"][string]["options"]["tabBarIcon"];
  activeColor: string;
  inactiveColor: string;
};

function TabButton({
  width,
  focused,
  onPress,
  renderIcon,
  activeColor,
  inactiveColor,
}: TabButtonProps) {
  const lift = useSharedValue(0);

  useEffect(() => {
    lift.value = withSpring(focused ? 1 : 0, LIFT_SPRING);
  }, [focused, lift]);

  const liftStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -LIFT_Y * lift.value },
      { scale: 1 + 0.08 * lift.value },
    ],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + 0.8 * lift.value,
    transform: [{ scale: 0.9 + 0.18 * lift.value }],
  }));

  return (
    <Pressable onPress={onPress} style={[styles.item, { width }]} hitSlop={10}>
      <Animated.View style={liftStyle}>
        <View style={styles.badgeWrap} pointerEvents="none">
          <Animated.View style={[styles.badge, badgeStyle]} />
          <View style={styles.iconCenter}>
            {renderIcon?.({
              focused,
              color: focused ? activeColor : inactiveColor,
              size: 24,
            })}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

/* ───────────────────────── styles ───────────────────────── */

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  container: {
    position: "relative",
    overflow: "visible",
  },
  barShell: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  barBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: "rgba(242,184,75,0.28)",
    // keep square if that's what you want
    borderRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  notchBorder: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  tabsLayer: {
    flex: 1,
    flexDirection: "row",
    overflow: "visible",
  },
  item: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeWrap: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.99)",
    borderWidth: 1,
    borderColor: "rgba(242,184,75,0.55)",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
});
