import { Text, View } from "@/components/Themed";
import React, { useEffect, useMemo, useRef } from "react";
import {
    Animated,
    Image,
    Pressable,
    View as RNView,
    StyleSheet,
} from "react-native";

export type PodiumItem = {
  id: string;
  title: string;
  cookedCount: number;
  photoUri?: string;
};

type Props = {
  items: PodiumItem[]; // already sorted desc
  title?: string;
  onPressItem?: (item: PodiumItem) => void;
};

type Slot = {
  rank: 1 | 2 | 3;
  item?: PodiumItem;
};

// visual order: 2nd (left), 1st (center), 3rd (right)
const ORDER: Array<1 | 2 | 3> = [2, 1, 3];

export default function CookedPodium({
  items,
  title = "Most cooked",
  onPressItem,
}: Props) {
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

  const heightsByRank = useMemo(() => ({ 1: 150, 2: 120, 3: 100 }), []);
  const anims = useRef(ORDER.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    anims.forEach((a) => a.setValue(0));
    Animated.stagger(
      140,
      anims.map((a) =>
        Animated.spring(a, {
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

      {/* Podium */}
      <RNView style={styles.row}>
        {slots.map((slot, idx) => {
          const a = anims[idx];
          const blockHeight = heightsByRank[slot.rank];

          const translateY = a.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          });
          const opacity = a.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });
          const scale = a.interpolate({
            inputRange: [0, 1],
            outputRange: [0.92, 1],
          });

          const pressableDisabled = !slot.item || !onPressItem;

          return (
            <RNView key={slot.rank} style={styles.slot}>
              {/* Avatar (recipe image) */}
              <Animated.View
                style={[
                  styles.avatarWrap,
                  { opacity, transform: [{ translateY }, { scale }] },
                ]}
              >
                <Pressable
                  disabled={pressableDisabled}
                  onPress={() => slot.item && onPressItem?.(slot.item)}
                  style={styles.avatarPress}
                >
                  {slot.item?.photoUri ? (
                    <Image
                      source={{ uri: slot.item.photoUri }}
                      style={styles.avatarImg}
                    />
                  ) : (
                    <RNView style={styles.avatarFallback}>
                      <Text style={styles.avatarFallbackText}>{slot.rank}</Text>
                    </RNView>
                  )}
                </Pressable>

                <RNView style={styles.meta}>
                  <Text numberOfLines={1} style={styles.recipeTitle}>
                    {slot.item?.title ?? "—"}
                  </Text>
                  <Text style={styles.countText}>
                    {slot.item ? `${slot.item.cookedCount}x` : ""}
                  </Text>
                </RNView>
              </Animated.View>

              {/* Podium block */}
              <Animated.View
                style={[
                  styles.block,
                  {
                    height: blockHeight,
                    opacity,
                    transform: [{ translateY }, { scale }],
                  },
                ]}
              >
                <RNView style={styles.rankBadge}>
                  <Text style={styles.rankBadgeText}>{slot.rank}</Text>
                </RNView>
              </Animated.View>
            </RNView>
          );
        })}
      </RNView>

      {/* Clickable list underneath */}
      <RNView style={styles.list}>
        {items.map((it, idx) => (
          <Pressable
            key={it.id}
            onPress={() => onPressItem?.(it)}
            style={({ pressed }) => [
              styles.listRow,
              pressed && styles.listRowPressed,
            ]}
          >
            <RNView style={styles.listLeft}>
              <Text style={styles.listIndex}>{idx + 1}</Text>
              {it.photoUri ? (
                <Image source={{ uri: it.photoUri }} style={styles.listThumb} />
              ) : (
                <RNView style={styles.listThumbFallback} />
              )}
              <Text numberOfLines={1} style={styles.listTitle}>
                {it.title}
              </Text>
            </RNView>

            <Text style={styles.listCount}>{it.cookedCount}x</Text>
          </Pressable>
        ))}
      </RNView>
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
    marginBottom: 14,
  },
  slot: {
    flex: 1,
    alignItems: "center",
  },

  avatarWrap: {
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  avatarPress: {
    borderRadius: 28,
    overflow: "hidden",
  },
  avatarImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.9,
  },
  avatarFallbackText: {
    fontWeight: "900",
    fontSize: 16,
  },
  meta: {
    marginTop: 8,
    alignItems: "center",
    paddingHorizontal: 6,
    width: "100%",
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
    justifyContent: "flex-start",
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.9,
    alignSelf: "center",
  },
  rankBadgeText: {
    fontWeight: "900",
    fontSize: 12,
  },

  list: {
    gap: 8,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    opacity: 0.92,
  },
  listRowPressed: {
    opacity: 0.7,
  },
  listLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 12,
  },
  listIndex: {
    width: 18,
    textAlign: "center",
    fontWeight: "900",
    opacity: 0.7,
  },
  listThumb: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  listThumbFallback: {
    width: 28,
    height: 28,
    borderRadius: 8,
    opacity: 0.3,
  },
  listTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    opacity: 0.9,
  },
  listCount: {
    fontSize: 13,
    fontWeight: "900",
    opacity: 0.75,
  },
});
