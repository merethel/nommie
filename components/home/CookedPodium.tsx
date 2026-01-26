import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import React, { useEffect, useMemo, useRef } from "react";
import {
    Animated,
    Image,
    Pressable,
    View as RNView,
    StyleSheet,
    useColorScheme,
} from "react-native";

export type PodiumItem = {
  id: string;
  title: string;
  cookedCount: number;
  photoUri?: string;
};

type Props = {
  items: PodiumItem[]; // sorted desc
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
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

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

  // podium geometry (image sits ON the podium, with bars underneath)
  const podiumHeights = useMemo(() => ({ 1: 60, 2: 46, 3: 38 }), []);
  const baseHeight = 16; // base strip under all columns

  const anims = useRef(ORDER.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    anims.forEach((a) => a.setValue(0));

    Animated.stagger(
      300,
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
    <View
      style={[
        styles.wrap,
        { backgroundColor: c.cardLight, borderColor: c.border },
      ]}
    >
      <Text style={[styles.header, { color: c.text }]}>{title}</Text>

      {/* PODIUM */}
      <RNView style={styles.podiumStage}>
        {/* columns */}
        <RNView style={styles.columns}>
          {slots.map((slot, idx) => {
            const a = anims[idx];

            const translateY = a.interpolate({
              inputRange: [0, 1],
              outputRange: [18, 0],
            });
            const opacity = a.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            });
            const scale = a.interpolate({
              inputRange: [0, 1],
              outputRange: [0.96, 1],
            });

            const pressableDisabled = !slot.item || !onPressItem;
            const columnHeight = podiumHeights[slot.rank];

            // theme-ish podium colors
            const columnColor =
              slot.rank === 1
                ? c.primary
                : slot.rank === 2
                  ? c.secondary
                  : c.tint;

            return (
              <RNView key={slot.rank} style={styles.columnSlot}>
                {/* Image + small label (sits above column) */}
                <Animated.View
                  style={[
                    styles.winnerWrap,
                    { opacity, transform: [{ translateY }, { scale }] },
                  ]}
                >
                  <Pressable
                    disabled={pressableDisabled}
                    onPress={() => slot.item && onPressItem?.(slot.item)}
                    style={[
                      styles.avatarPress,
                      { borderColor: c.border, backgroundColor: c.card },
                    ]}
                  >
                    {slot.item?.photoUri ? (
                      <Image
                        source={{ uri: slot.item.photoUri }}
                        style={styles.avatarImg}
                      />
                    ) : (
                      <RNView
                        style={[
                          styles.avatarFallback,
                          { backgroundColor: c.card },
                        ]}
                      >
                        <Text
                          style={[styles.avatarFallbackText, { color: c.text }]}
                        >
                          {slot.rank}
                        </Text>
                      </RNView>
                    )}
                  </Pressable>

                  <Text
                    numberOfLines={1}
                    style={[styles.winnerTitle, { color: c.text }]}
                  >
                    {slot.item?.title ?? "—"}
                  </Text>
                  <Text style={[styles.winnerCount, { color: c.muted }]}>
                    {slot.item ? `${slot.item.cookedCount}x` : ""}
                  </Text>
                </Animated.View>

                {/* Podium column (bar) */}
                <Animated.View
                  style={[
                    styles.column,
                    {
                      height: columnHeight,
                      backgroundColor: columnColor,
                      opacity,
                      transform: [{ translateY }, { scale }],
                    },
                  ]}
                >
                  <RNView
                    style={[
                      styles.rankPill,
                      { backgroundColor: c.card, borderColor: c.border },
                    ]}
                  >
                    <Text style={[styles.rankPillText, { color: c.text }]}>
                      {slot.rank}
                    </Text>
                  </RNView>

                  {/* subtle top edge like a “cap” */}
                  <RNView
                    style={[
                      styles.cap,
                      { backgroundColor: c.cardLight, opacity: 0.22 },
                    ]}
                  />
                </Animated.View>
              </RNView>
            );
          })}
        </RNView>
      </RNView>

      {/* CLICKABLE LIST */}

      {/* <RNView style={styles.list}>
        {items.map((it, idx) => (
          <Pressable
            key={it.id}
            onPress={() => onPressItem?.(it)}
            style={({ pressed }) => [
              styles.listRow,
              {
                backgroundColor: c.card,
                borderColor: c.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <RNView style={styles.listLeft}>
              <RNView
                style={[
                  styles.listIndexPill,
                  { backgroundColor: c.cardLight, borderColor: c.border },
                ]}
              >
                <Text style={[styles.listIndexText, { color: c.text }]}>
                  {idx + 1}
                </Text>
              </RNView>

              {it.photoUri ? (
                <Image source={{ uri: it.photoUri }} style={styles.listThumb} />
              ) : (
                <RNView
                  style={[
                    styles.listThumbFallback,
                    { backgroundColor: c.cardLight },
                  ]}
                />
              )}

              <Text
                numberOfLines={1}
                style={[styles.listTitle, { color: c.text }]}
              >
                {it.title}
              </Text>
            </RNView>

            <RNView
              style={[
                styles.countPill,
                { backgroundColor: c.cardLight, borderColor: c.border },
              ]}
            >
              <Text style={[styles.listCount, { color: c.text }]}>
                {it.cookedCount}x
              </Text>
            </RNView>
          </Pressable>
        ))}
      </RNView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    marginTop: 24,
    padding: 14,
    borderWidth: 1,
  },
  header: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
    opacity: 0.95,
  },

  podiumStage: {
    marginTop: 6,
    marginBottom: 14,
  },
  columns: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 6,
  },
  columnSlot: {
    flex: 1,
    alignItems: "center",
  },

  winnerWrap: {
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  avatarPress: {
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontWeight: "900",
    fontSize: 16,
  },
  winnerTitle: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
    paddingHorizontal: 6,
  },
  winnerCount: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "800",
  },

  column: {
    width: "100%",
    borderRadius: 14,
    justifyContent: "flex-start",
    paddingTop: 10,
    overflow: "hidden",
  },
  cap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 10,
  },
  rankPill: {
    alignSelf: "center",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  rankPillText: {
    fontWeight: "900",
    fontSize: 12,
  },

  baseStrip: {
    marginTop: 10,
    width: "100%",
    borderRadius: 12,
  },

  list: {
    gap: 10,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  listLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 12,
  },
  listIndexPill: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  listIndexText: {
    fontWeight: "900",
    fontSize: 12,
  },
  listThumb: {
    width: 30,
    height: 30,
    borderRadius: 10,
  },
  listThumbFallback: {
    width: 30,
    height: 30,
    borderRadius: 10,
    opacity: 0.7,
  },
  listTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
  },
  countPill: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  listCount: {
    fontSize: 13,
    fontWeight: "900",
  },
});
