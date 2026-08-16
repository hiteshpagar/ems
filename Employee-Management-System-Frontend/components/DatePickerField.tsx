import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppColors } from "../constants/theme";
import { formatDate, fromIsoDate, toIsoDate } from "../utils/date";

type Props = { value: string; onChange: (value: string) => void; label?: string; minimumDate?: Date };

export default function DatePickerField({ value, onChange, label, minimumDate }: Props) {
  const [open, setOpen] = useState(false);
  return <View>
    <TouchableOpacity style={styles.field} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={label ?? "Choose date"}>
      <Text style={[styles.value, !value && styles.placeholder]}>{value ? formatDate(value) : "MM/DD/YYYY"}</Text>
      <Text style={styles.icon}>▣</Text>
    </TouchableOpacity>
    {open ? <DateTimePicker
      value={fromIsoDate(value)} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} minimumDate={minimumDate}
      onChange={(_, selectedDate) => { if (Platform.OS !== "ios") setOpen(false); if (selectedDate) onChange(toIsoDate(selectedDate)); }}
    /> : null}
    {Platform.OS === "ios" && open ? <TouchableOpacity onPress={() => setOpen(false)} style={styles.done}><Text style={styles.doneText}>Done</Text></TouchableOpacity> : null}
  </View>;
}

const styles = StyleSheet.create({
  field: { minHeight: 46, borderWidth: 1, borderColor: AppColors.borderStrong, borderRadius: 8, backgroundColor: AppColors.surface, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  value: { color: AppColors.text, fontSize: 15 }, placeholder: { color: AppColors.textMuted }, icon: { color: AppColors.primary, fontSize: 17 },
  done: { alignSelf: "flex-end", paddingHorizontal: 12, paddingVertical: 8, marginTop: -6, marginBottom: 8 }, doneText: { color: AppColors.primary, fontWeight: "600" },
});
