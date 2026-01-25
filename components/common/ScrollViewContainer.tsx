import { View } from "@/components/Themed";
import { ScrollView, StyleSheet } from "react-native";

export default function ScrollViewContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
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
    paddingTop: 60,
    padding: 16,
    gap: 12,
  },
});
