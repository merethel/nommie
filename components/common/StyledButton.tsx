import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

type ButtonSize = "small" | "default";

type StyledButtonProps = {
  title: string;
  onPress?: () => void;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
};

export default function StyledButton({
  title,
  onPress,
  size = "default",
  style,
}: StyledButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, size === "small" && styles.smallButton, style]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, size === "small" && styles.smallText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },

  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  smallText: {
    fontSize: 12,
  },
});
