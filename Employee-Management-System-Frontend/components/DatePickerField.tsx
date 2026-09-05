import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { AppColors, AppRadius } from "../constants/theme";
import { formatDate, fromIsoDate, toIsoDate } from "../utils/date";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  containerStyle?: ViewStyle;
  error?: string;
};

export default function DatePickerField({
  value,
  onChange,
  label,
  placeholder = "Select date",
  required = false,
  minimumDate,
  maximumDate,
  containerStyle,
  error,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required ? <Text style={styles.requiredStar}> *</Text> : null}
        </View>
      ) : null}

      <TouchableOpacity
        style={[
          styles.field,
          Boolean(error) && styles.fieldError,
        ]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {open ? (
        <DateTimePicker
          value={fromIsoDate(value)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={(_, selectedDate) => {
            if (Platform.OS !== "ios") setOpen(false);
            if (selectedDate) onChange(toIsoDate(selectedDate));
          }}
        />
      ) : null}

      {Platform.OS === "ios" && open ? (
        <TouchableOpacity onPress={() => setOpen(false)} style={styles.done}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
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
  field: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: AppColors.borderStrong,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.surface,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldError: {
    borderColor: AppColors.danger,
  },
  value: {
    color: AppColors.text,
    fontSize: 15,
  },
  placeholder: {
    color: AppColors.textMuted,
  },
  icon: {
    fontSize: 16,
    opacity: 0.8,
  },
  done: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  doneText: {
    color: AppColors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  errorText: {
    color: AppColors.danger,
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});
