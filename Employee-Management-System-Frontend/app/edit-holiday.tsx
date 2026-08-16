import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
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
import API from "../services/api";

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

  const fetchHoliday = useCallback(async () => {
    try {
      const response = await API.get(`/holidays/${id}`);
      const holiday = response.data;

      setName(holiday.name);
      setHolidayDate(holiday.holidayDate);
      setType(holiday.type || HOLIDAY_TYPES[0]);
      setDescription(holiday.description || "");
    } catch (error) {
      console.log(error);
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
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    if (!DATE_PATTERN.test(trimmedDate)) {
      Alert.alert("Error", "Please select a valid holiday date.");
      return;
    }

    try {
      await API.put(`/holidays/${id}`, {
        name: trimmedName,
        holidayDate: trimmedDate,
        type,
        description: trimmedDescription,
      });

      Alert.alert("Success", "Holiday updated successfully.");
      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", getErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2F80ED" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Edit Holiday</Text>
          <Text style={styles.headerSubtitle}>Update holiday master data</Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <Text style={styles.label}>Holiday Name</Text>
          <CustomInput
            placeholder="Enter Holiday Name"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Holiday Date</Text>
            <DatePickerField value={holidayDate} onChange={setHolidayDate} label="Holiday date" />

          <Text style={styles.label}>Holiday Type</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={type}
              onValueChange={(value) => setType(value)}
              style={styles.picker}
            >
              {HOLIDAY_TYPES.map((holidayType) => (
                <Picker.Item
                  key={holidayType}
                  label={holidayType}
                  value={holidayType}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Description</Text>
          <CustomInput
            placeholder="Enter Description"
            value={description}
            onChangeText={setDescription}
          />

          <CustomButton title="Update Holiday" onPress={handleUpdateHoliday} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4F6FB",
  },

  header: {
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 5,
  },

  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 10,
    color: "#444",
  },

  pickerBox: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    justifyContent: "center",
    marginBottom: 15,
    overflow: "hidden",
  },

  picker: {
    color: "#111827",
  },
});
