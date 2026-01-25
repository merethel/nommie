import { ScrollView, StyleSheet } from "react-native";

export default function ScrollViewContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>{children}</ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    flex: 1,
    padding: 16,
    gap: 12,
  },
});
