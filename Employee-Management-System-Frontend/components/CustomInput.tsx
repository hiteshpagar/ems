import { StyleSheet, TextInput, TextInputProps } from "react-native";
import { AppColors } from "../constants/theme";

export default function CustomInput(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      style={[styles.input, props.style]}
      placeholderTextColor={AppColors.textMuted}
      accessibilityLabel={props.accessibilityLabel ?? props.placeholder}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: AppColors.borderStrong,
    backgroundColor: AppColors.surface,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 15,
    color: AppColors.text,
  },
});
