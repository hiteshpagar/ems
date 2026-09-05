import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { AppColors, AppRadius } from "../constants/theme";

export interface CustomInputProps extends TextInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function CustomInput({
  label,
  required = false,
  error,
  helperText,
  containerStyle,
  labelStyle,
  leftIcon,
  rightIcon,
  style,
  onFocus,
  onBlur,
  ...restProps
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, labelStyle]}>{label}</Text>
          {required ? <Text style={styles.requiredStar}> *</Text> : null}
        </View>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          Boolean(error) && styles.inputError,
          restProps.editable === false && styles.inputDisabled,
        ]}
      >
        {leftIcon ? <View style={styles.leftIconWrapper}>{leftIcon}</View> : null}

        <TextInput
          {...restProps}
          style={[styles.input, style]}
          placeholderTextColor={AppColors.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          accessibilityLabel={restProps.accessibilityLabel ?? label ?? restProps.placeholder}
        />

        {rightIcon ? <View style={styles.rightIconWrapper}>{rightIcon}</View> : null}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  requiredStar: {
    color: AppColors.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.borderStrong,
    borderRadius: AppRadius.md,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  inputFocused: {
    borderColor: AppColors.primary,
    borderWidth: 1.5,
  },
  inputError: {
    borderColor: AppColors.danger,
    borderWidth: 1.5,
  },
  inputDisabled: {
    backgroundColor: AppColors.surfaceMuted,
    borderColor: AppColors.border,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: AppColors.text,
    paddingVertical: 10,
  },
  leftIconWrapper: {
    marginRight: 8,
  },
  rightIconWrapper: {
    marginLeft: 8,
  },
  errorText: {
    color: AppColors.danger,
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  helperText: {
    color: AppColors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
});
