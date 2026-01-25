import { StyleSheet, Text, TouchableOpacity } from "react-native";

type StyledButtonProps = {
  title: string;
  onPress?: () => void;
};

export default function StyledButton({
  title,
  onPress,
  ...props
}: StyledButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} {...props}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#6200ee",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
