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
    marginTop: 12,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
