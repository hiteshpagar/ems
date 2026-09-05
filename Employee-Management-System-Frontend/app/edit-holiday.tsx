import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import DatePickerField from "../components/DatePickerField";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import API from "../services/api";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

const HOLIDAY_TYPES = ["Public", "Optional", "Company"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function getErrorMessage(error: any) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default function EditHolidayScreen() {
  const { id } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [type, setType] = useState(HOLIDAY_TYPES[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchHoliday = useCallback(async () => {
    try {
      const response = await API.get(`/holidays/${id}`);
      const holiday = response.data;

      setName(holiday.name || "");
      setHolidayDate(holiday.holidayDate || "");
      setType(holiday.type || HOLIDAY_TYPES[0]);
      setDescription(holiday.description || "");
    } catch (error) {
      console.log("Error loading holiday:", error);
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHoliday();
  }, [fetchHoliday]);

  const handleUpdateHoliday = async () => {
    const trimmedName = name.trim();
    const trimmedDate = holidayDate.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || !trimmedDate || !type) {
      Alert.alert("Required Fields", "Please fill all required fields.");
      return;
    }

    if (!DATE_PATTERN.test(trimmedDate)) {
      Alert.alert("Invalid Date", "Please select a valid holiday date.");
      return;
    }

    try {
      setSaving(true);
      await API.put(`/holidays/${id}`, {
        name: trimmedName,
        holidayDate: trimmedDate,
        type,
        description: trimmedDescription,
      });

      Alert.alert("Success", "Holiday updated successfully.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.log("Error updating holiday:", error);
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <AppHeader title="Edit Holiday" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading holiday details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader
        title="Edit Holiday"
        subtitle={`Update "${name}"`}
        showBack
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <CustomInput
            label="Holiday Name"
            placeholder="e.g. New Year's Day"
            value={name}
            onChangeText={setName}
            required
          />

          <DatePickerField
            label="Holiday Date"
            placeholder="Select holiday date"
            value={holidayDate}
            onChange={setHolidayDate}
            required
          />

          <View style={styles.pickerField}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Holiday Type</Text>
              <Text style={styles.requiredStar}> *</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={type}
                onValueChange={(value) => setType(value)}
              >
                {HOLIDAY_TYPES.map((holidayType) => (
                  <Picker.Item
                    key={holidayType}
                    label={`${holidayType} Holiday`}
                    value={holidayType}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <CustomInput
            label="Description"
            placeholder="Optional notes or details about the holiday"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <CustomButton
            title="Update Holiday"
            onPress={handleUpdateHoliday}
            loading={saving}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.card,
  },
  pickerField: {
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: AppColors.borderStrong,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.surface,
    overflow: "hidden",
  },
  submitBtn: {
    marginTop: 8,
  },
});
