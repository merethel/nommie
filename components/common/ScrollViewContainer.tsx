import { View } from "@/components/Themed";
import React from "react";
import { ScrollView, StyleProp, StyleSheet, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export default function ScrollViewContainer({
  children,
  style,
  contentContainerStyle,
}: Props) {
  return (
    <View style={[styles.root, style]}>
      <ScrollView
        contentContainerStyle={[styles.container, contentContainerStyle]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    marginTop: 20,
    paddingTop: 60,
    padding: 16,
    gap: 12,
  },
});
