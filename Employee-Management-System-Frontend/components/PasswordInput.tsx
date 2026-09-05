import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import CustomInput, { CustomInputProps } from "./CustomInput";
import { AppColors } from "../constants/theme";

export default function PasswordInput(props: CustomInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <CustomInput
      {...props}
      secureTextEntry={!showPassword}
      rightIcon={
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          activeOpacity={0.7}
          style={styles.toggleButton}
          accessibilityRole="button"
          accessibilityLabel={showPassword ? "Hide password" : "Show password"}
        >
          <Text style={styles.toggleText}>{showPassword ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      }
    />
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.primary,
  },
});
