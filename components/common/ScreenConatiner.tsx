import { StyleSheet } from "react-native";
import { View } from "../Themed";

export default function ScreenContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    flex: 1,
    padding: 16,
    gap: 12,
  },
});
