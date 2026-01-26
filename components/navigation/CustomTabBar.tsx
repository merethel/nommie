import MaskedView from "@react-native-masked-view/masked-view";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import React, { useEffect, useMemo } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, { Defs, G, Mask, Path, Rect } from "react-native-svg";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

/* ───────────────────────── constants ───────────────────────── */

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BAR_HEIGHT = 64;
const BAR_RADIUS = 28;

const NOTCH_DEPTH = 50;
const LIFT_Y = 18;

const AnimatedG = Animated.createAnimatedComponent(G);

/* ───────────────────────── notch path (local coords) ───────────────────────── */
// This is the “bite” shape drawn in its own little box [0..w, 0..h]
function buildNotchPath(w: number, h: number) {
  return `
    M 0 0
    C ${w * 0.18} 0, ${w * 0.22} ${h}, ${w * 0.5} ${h}
    C ${w * 0.78} ${h}, ${w * 0.82} 0, ${w} 0
    L 0 0
    Z
  `;
}

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
  const scheme = useColorScheme() ?? "light";
  const theme = Colors[scheme];

  const finalActiveColor = activeColor ?? theme.tabIconActive;
  const finalInactiveColor = inactiveColor ?? theme.tabIconDefault;

  const tabCount = state.routes.length;
  const barWidth = SCREEN_WIDTH;
  const slotWidth = barWidth / tabCount;

  const notchW = Math.min(120, slotWidth * 1.15);
  const notchPath = useMemo(
    () => buildNotchPath(notchW, NOTCH_DEPTH),
    [notchW],
  );

  // Active center X (within barWidth coordinates)
  const x = useSharedValue(slotWidth * state.index + slotWidth / 2);

  useEffect(() => {
    x.value = withSpring(slotWidth * state.index + slotWidth / 2, {
      damping: 16,
      stiffness: 180,
      mass: 0.6,
    });
  }, [state.index, slotWidth]);

  // notch left position
  const notchLeft = useSharedValue(x.value - notchW / 2);

  useEffect(() => {
    notchLeft.value = withSpring(x.value - notchW / 2, {
      damping: 16,
      stiffness: 180,
      mass: 0.6,
    });
  }, [x.value]); // (reanimated value, ok)

  // For SVG we’ll drive translateX via animatedProps (reliable for masks)
  const notchGProps = useAnimatedProps(() => ({
    transform: [{ translateX: x.value - notchW / 2 }],
  }));

  // Border outline can use regular animated style wrapper
  const notchBorderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value - notchW / 2 }],
  }));

  return (
    <View
      style={[styles.wrap, { paddingBottom: insets.bottom }]}
      pointerEvents="box-none"
    >
      <View style={[styles.container, { width: barWidth, height: BAR_HEIGHT }]}>
        {/* ✅ TRUE hole: MaskedView uses alpha; this SVG mask produces transparent notch pixels */}
        <MaskedView
          style={[styles.barShell, { borderRadius: BAR_RADIUS }]}
          maskElement={
            <Svg width={barWidth} height={BAR_HEIGHT}>
              <Defs>
                <Mask id="cut">
                  {/* visible area = opaque */}
                  <Rect
                    x="0"
                    y="0"
                    width={barWidth}
                    height={BAR_HEIGHT}
                    fill="white"
                  />
                  {/* notch area = transparent (black in SVG mask) */}
                  <AnimatedG animatedProps={notchGProps}>
                    <Path d={notchPath} fill="black" />
                  </AnimatedG>
                </Mask>
              </Defs>

              {/* Output alpha for MaskedView: a solid rect with the mask applied */}
              <Rect
                x="0"
                y="0"
                width={barWidth}
                height={BAR_HEIGHT}
                fill="black" // color irrelevant; alpha comes from mask
                mask="url(#cut)"
              />
            </Svg>
          }
        >
          <BlurView
            intensity={scheme === "dark" ? 45 : 55}
            tint={scheme === "dark" ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        </MaskedView>

        {/* Notch outline (so the cutout is visible) */}
        <Animated.View
          style={[styles.notchBorder, notchBorderStyle]}
          pointerEvents="none"
        >
          <Svg width={notchW} height={NOTCH_DEPTH}>
            <Path
              d={notchPath}
              fill="transparent"
              stroke="rgba(242,184,75,0.55)"
              strokeWidth={1}
            />
          </Svg>
        </Animated.View>

        {/* Bar border */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderWidth: 1,
              borderColor: "rgba(242,184,75,0.28)",
              borderRadius: BAR_RADIUS,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          ]}
        />

        {/* Tabs (icons can escape upward) */}
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
  const lift = useSharedValue(0);

  useEffect(() => {
    lift.value = withSpring(focused ? 1 : 0, {
      damping: 14,
      stiffness: 220,
      mass: 0.55,
    });
  }, [focused]);

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
