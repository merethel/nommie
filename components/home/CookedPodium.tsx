import { Text, View } from "@/components/Themed";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

export type PodiumItem = {
  id: string;
  title: string;
  cookedCount: number;
};

type Props = {
  items: PodiumItem[]; // expects top 3 (or fewer)
  title?: string;
};

type Slot = {
  rank: 1 | 2 | 3;
  item?: PodiumItem;
};

// visual order: 2nd (left), 1st (center), 3rd (right)
const ORDER: Array<1 | 2 | 3> = [2, 1, 3];

export default function CookedPodium({ items, title = "Most cooked" }: Props) {
  const slots: Slot[] = useMemo(() => {
    const first = items[0];
    const second = items[1];
    const third = items[2];
    const byRank: Record<number, PodiumItem | undefined> = {
      1: first,
      2: second,
      3: third,
    };

    return ORDER.map((rank) => ({
      rank: rank as 1 | 2 | 3,
      item: byRank[rank],
    }));
  }, [items]);

  // target heights for podium blocks
  const heightsByRank = useMemo(() => ({ 1: 140, 2: 110, 3: 90 }), []);
  const anims = useRef(
    ORDER.map(() => ({
      // 0 -> 1
      t: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    // reset
    anims.forEach((a) => a.t.setValue(0));

    // staggered "reveal"
    Animated.stagger(
      120,
      anims.map((a) =>
        Animated.spring(a.t, {
          toValue: 1,
          useNativeDriver: true,
          friction: 7,
          tension: 80,
        }),
      ),
    ).start();
  }, [anims, items]);

  if (!items.length) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.header}>{title}</Text>

      <View style={styles.row}>
        {slots.map((slot, idx) => {
          const a = anims[idx].t;
          const blockHeight = heightsByRank[slot.rank];

          // animation: rise + scale + fade
          const translateY = a.interpolate({
            inputRange: [0, 1],
            outputRange: [28, 0],
          });
          const scaleY = a.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1],
          });
          const opacity = a.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          return (
            <View key={slot.rank} style={styles.slot}>
              {/* label above block */}
              <Animated.View
                style={[
                  styles.labelWrap,
                  { opacity, transform: [{ translateY }] },
                ]}
              >
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{slot.rank}</Text>
                </View>

                <Text numberOfLines={1} style={styles.recipeTitle}>
                  {slot.item?.title ?? "—"}
                </Text>
                <Text style={styles.countText}>
                  {slot.item ? `${slot.item.cookedCount}x` : ""}
                </Text>
              </Animated.View>

              {/* podium block */}
              <Animated.View
                style={[
                  styles.block,
                  {
                    height: blockHeight,
                    opacity,
                    transform: [{ translateY }, { scaleY }],
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 18,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 18,
  },
  header: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
    opacity: 0.9,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 6,
  },
  slot: {
    flex: 1,
    alignItems: "center",
  },
  labelWrap: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    opacity: 0.9,
  },
  badgeText: {
    fontWeight: "900",
    fontSize: 12,
  },
  recipeTitle: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    opacity: 0.9,
  },
  countText: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
    opacity: 0.7,
  },
  block: {
    width: "100%",
    borderRadius: 14,
    opacity: 0.95,
  },
});
