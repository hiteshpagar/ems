import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import {
  Briefcase,
  Building2,
  Calendar,
  CreditCard,
  HeartHandshake,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react-native";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import DatePickerField from "../components/DatePickerField";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";
import { isValidEmail, isValidName, isValidPhone } from "../utils/validators";

interface Department {
  id: number;
  name: string;
}

interface Designation {
  id: number;
  name: string;
  departmentId: number;
  departmentName: string;
}

export default function EditEmployeeScreen() {
  const { id } = useLocalSearchParams();

  // Section 1: Personal Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("Male");
  const [bloodGroup, setBloodGroup] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("Single");
  const [photoUrl, setPhotoUrl] = useState("");
  const [newImageUri, setNewImageUri] = useState("");

  // Section 2: Employment Details
  const [employeeId, setEmployeeId] = useState("");
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [designationId, setDesignationId] = useState<number | null>(null);
  const [employmentType, setEmploymentType] = useState("Full-Time");
  const [joiningDate, setJoiningDate] = useState("");
  const [workLocation, setWorkLocation] = useState("Head Office");
  const [status, setStatus] = useState("Active");

  // Section 3: Compensation & Banking
  const [salary, setSalary] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [panNumber, setPanNumber] = useState("");

  // Section 4: Residential Address
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");

  // Section 5: Emergency Contact
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactRelation, setEmergencyContactRelation] = useState("Parent");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  // Masters & Status
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const filteredDesignations = useMemo(
    () =>
      designations.filter(
        (designation) => designation.departmentId === departmentId
      ),
    [departmentId, designations]
  );

  const selectedDepartment = departments.find(
    (department) => department.id === departmentId
  );

  const selectedDesignation = designations.find(
    (designation) => designation.id === designationId
  );

  const fetchEmployeeData = useCallback(async () => {
    try {
      const [employeeResponse, departmentResponse, designationResponse] =
        await Promise.all([
          API.get(`/employees/${id}`),
          API.get<Department[]>("/departments"),
          API.get<Designation[]>("/designations"),
        ]);

      const emp = employeeResponse.data;
      const departmentData = Array.isArray(departmentResponse.data)
        ? departmentResponse.data
        : [];
      const designationData = Array.isArray(designationResponse.data)
        ? designationResponse.data
        : [];

      const matchedDepartment = departmentData.find(
        (department) => department.name === emp.department
      );
      const matchedDesignation = designationData.find(
        (designation) =>
          designation.name === emp.designation &&
          designation.departmentId === matchedDepartment?.id
      );

      setDepartments(departmentData);
      setDesignations(designationData);

      // Populate all fields
      setName(emp.name || "");
      setEmail(emp.email || "");
      setPhone(emp.phone || "");
      setPersonalEmail(emp.personalEmail || "");
      setDateOfBirth(emp.dateOfBirth || "");
      setGender(emp.gender || "Male");
      setBloodGroup(emp.bloodGroup || "");
      setMaritalStatus(emp.maritalStatus || "Single");
      setPhotoUrl(emp.photoUrl || "");

      setEmployeeId(emp.employeeId || "");
      setDepartmentId(matchedDepartment?.id ?? departmentData[0]?.id ?? null);
      setDesignationId(matchedDesignation?.id ?? null);
      setEmploymentType(emp.employmentType || "Full-Time");
      setJoiningDate(emp.joiningDate || "");
      setWorkLocation(emp.workLocation || "Head Office");
      setStatus(emp.status || "Active");

      setSalary(emp.salary ? emp.salary.toString() : "");
      setBankName(emp.bankName || "");
      setBankAccountNumber(emp.bankAccountNumber || "");
      setIfscCode(emp.ifscCode || "");
      setPanNumber(emp.panNumber || "");

      setAddress(emp.address || "");
      setCity(emp.city || "");
      setState(emp.state || "");
      setPostalCode(emp.postalCode || "");
      setCountry(emp.country || "India");

      setEmergencyContactName(emp.emergencyContactName || "");
      setEmergencyContactRelation(emp.emergencyContactRelation || "Parent");
      setEmergencyContactPhone(emp.emergencyContactPhone || "");
    } catch (error) {
      console.log("Error loading employee data:", error);
      Alert.alert("Error", "Failed to load employee details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!newImageUri) return photoUrl;

    const formData = new FormData();
    formData.append("file", {
      uri: newImageUri,
      name: "profile.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const response = await API.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.photoUrl || photoUrl;
    } catch (error) {
      console.log("Image upload failed:", error);
      return photoUrl;
    }
  };

  const handleUpdateEmployee = async () => {
    const cleanName = name.trim();
    if (!cleanName || !isValidName(cleanName)) {
      Alert.alert("Invalid Name", "Employee full name must be at least 2 characters.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid official email address.");
      return;
    }

    if (phone.trim() && !isValidPhone(phone.trim())) {
      Alert.alert("Invalid Phone", "Please enter a valid contact phone number (10-15 digits).");
      return;
    }

    if (personalEmail.trim() && !isValidEmail(personalEmail.trim())) {
      Alert.alert("Invalid Alternate Email", "Please enter a valid personal email or leave blank.");
      return;
    }

    if (!selectedDepartment || !selectedDesignation) {
      Alert.alert(
        "Department Required",
        "Please select an assigned department and designation."
      );
      return;
    }

    const cleanSalary = Number(salary);
    if (!salary || isNaN(cleanSalary) || cleanSalary < 0) {
      Alert.alert("Invalid Salary", "Please specify a valid basic monthly salary.");
      return;
    }

    if (emergencyContactPhone.trim() && !isValidPhone(emergencyContactPhone.trim())) {
      Alert.alert(
        "Invalid Emergency Phone",
        "Please enter a valid 10-15 digit phone for the emergency contact."
      );
      return;
    }

    try {
      setSaving(true);
      const updatedPhotoUrl = await uploadImage();

      const payload = {
        name: cleanName,
        email: cleanEmail,
        phone: phone.trim() || undefined,
        personalEmail: personalEmail.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        bloodGroup: bloodGroup || undefined,
        maritalStatus: maritalStatus || undefined,
        photoUrl: updatedPhotoUrl || undefined,

        employeeId: employeeId.trim() || undefined,
        department: selectedDepartment.name,
        designation: selectedDesignation.name,
        employmentType: employmentType || "Full-Time",
        joiningDate: joiningDate || undefined,
        workLocation: workLocation || "Head Office",
        status: status || "Active",

        salary: cleanSalary,
        bankName: bankName.trim() || undefined,
        bankAccountNumber: bankAccountNumber.trim() || undefined,
        ifscCode: ifscCode.trim().toUpperCase() || undefined,
        panNumber: panNumber.trim().toUpperCase() || undefined,

        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        country: country.trim() || "India",

        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContactRelation: emergencyContactRelation || undefined,
        emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      };

      await API.put(`/employees/${id}`, payload);

      Alert.alert("Success", "Employee profile updated successfully.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update employee.";
      Alert.alert("Update Error", message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <AppHeader title="Edit Employee" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading profile data...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader
        title="Edit Employee"
        subtitle={`Updating ${name || "profile"}`}
        showBack
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: PERSONAL INFORMATION */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.sectionIconBox, { backgroundColor: "#EFF6FF" }]}>
              <User size={18} color="#173B7A" />
            </View>
            <Text style={styles.sectionHeading}>1. Personal Information</Text>
          </View>

          {/* Photo Picker */}
          <View style={styles.photoSection}>
            <Text style={styles.label}>Profile Avatar</Text>
            <View style={styles.photoRow}>
              {newImageUri || photoUrl ? (
                <Image
                  source={{ uri: newImageUri || photoUrl }}
                  style={styles.previewImage}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <User size={26} color="#94A3B8" />
                </View>
              )}
              <TouchableOpacity
                style={styles.pickButton}
                onPress={pickImage}
                activeOpacity={0.7}
              >
                <Text style={styles.pickButtonText}>
                  {newImageUri || photoUrl ? "Change Avatar" : "Upload Picture"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <CustomInput
            label="Full Legal Name"
            placeholder="e.g. Rachel Adams"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            required
          />

          <CustomInput
            label="Official Work Email"
            placeholder="rachel.adams@company.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            required
          />

          <CustomInput
            label="Contact Phone Number"
            placeholder="9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <CustomInput
            label="Personal / Alternate Email"
            placeholder="rachel.personal@gmail.com"
            value={personalEmail}
            onChangeText={setPersonalEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <DatePickerField
            label="Date of Birth"
            value={dateOfBirth}
            onChange={setDateOfBirth}
            placeholder="Select birth date"
          />

          <View style={styles.pickerField}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={(val) => setGender(val)}
                style={styles.picker}
                dropdownIconColor="#173B7A"
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
          </View>

          <View style={styles.pickerField}>
            <Text style={styles.label}>Blood Group</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={bloodGroup}
                onValueChange={(val) => setBloodGroup(val)}
                style={styles.picker}
                dropdownIconColor="#173B7A"
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Select Blood Group (Optional)" value="" />
                <Picker.Item label="A+" value="A+" />
                <Picker.Item label="A-" value="A-" />
                <Picker.Item label="B+" value="B+" />
                <Picker.Item label="B-" value="B-" />
                <Picker.Item label="O+" value="O+" />
                <Picker.Item label="O-" value="O-" />
                <Picker.Item label="AB+" value="AB+" />
                <Picker.Item label="AB-" value="AB-" />
              </Picker>
            </View>
          </View>

          <View style={styles.pickerField}>
            <Text style={styles.label}>Marital Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={maritalStatus}
                onValueChange={(val) => setMaritalStatus(val)}
                style={styles.picker}
                dropdownIconColor="#173B7A"
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Single" value="Single" />
                <Picker.Item label="Married" value="Married" />
                <Picker.Item label="Divorced" value="Divorced" />
                <Picker.Item label="Widowed" value="Widowed" />
              </Picker>
            </View>
          </View>
        </View>

        {/* SECTION 2: EMPLOYMENT & JOB DETAILS */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.sectionIconBox, { backgroundColor: "#EEF2FF" }]}>
              <Briefcase size={18} color="#4F46E5" />
            </View>
            <Text style={styles.sectionHeading}>2. Employment & Job Role</Text>
          </View>

          <CustomInput
            label="Employee ID / Code"
            placeholder="e.g. EMP-2024-001"
            value={employeeId}
            onChangeText={setEmployeeId}
            autoCapitalize="characters"
          />

          <View style={styles.pickerField}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Department</Text>
              <Text style={styles.requiredStar}> *</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={departmentId}
                onValueChange={(value) => setDepartmentId(value)}
                enabled={departments.length > 0}
                style={styles.picker}
                dropdownIconColor="#173B7A"
                itemStyle={styles.pickerItem}
              >
                {departments.map((dept) => (
                  <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.pickerField}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Designation</Text>
              <Text style={styles.requiredStar}> *</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={designationId}
                onValueChange={(value) => setDesignationId(value)}
                enabled={filteredDesignations.length > 0}
                style={styles.picker}
                dropdownIconColor="#173B7A"
                itemStyle={styles.pickerItem}
              >
                {filteredDesignations.map((desig) => (
                  <Picker.Item key={desig.id} label={desig.name} value={desig.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.pickerField}>
            <Text style={styles.label}>Employment Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={employmentType}
                onValueChange={(val) => setEmploymentType(val)}
                style={styles.picker}
                dropdownIconColor="#173B7A"
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Full-Time" value="Full-Time" />
                <Picker.Item label="Part-Time" value="Part-Time" />
                <Picker.Item label="Contract" value="Contract" />
                <Picker.Item label="Internship" value="Intern" />
              </Picker>
            </View>
          </View>

          <DatePickerField
            label="Date of Joining"
            value={joiningDate}
            onChange={setJoiningDate}
            placeholder="Select joining date"
          />

          <View style={styles.pickerField}>
            <Text style={styles.label}>Work Location</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={workLocation}
                onValueChange={(val) => setWorkLocation(val)}
                style={styles.picker}
                dropdownIconColor="#173B7A"
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Head Office" value="Head Office" />
                <Picker.Item label="Branch Office" value="Branch Office" />
                <Picker.Item label="Remote" value="Remote" />
                <Picker.Item label="Hybrid" value="Hybrid" />
              </Picker>
            </View>
          </View>

          <View style={styles.pickerField}>
            <Text style={styles.label}>Employment Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={status}
                onValueChange={(val) => setStatus(val)}
                style={styles.picker}
                dropdownIconColor="#173B7A"
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Active" value="Active" />
                <Picker.Item label="On Probation" value="Probation" />
                <Picker.Item label="Inactive" value="Inactive" />
              </Picker>
            </View>
          </View>
        </View>

        {/* SECTION 3: COMPENSATION & BANKING */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.sectionIconBox, { backgroundColor: "#ECFDF5" }]}>
              <CreditCard size={18} color="#059669" />
            </View>
            <Text style={styles.sectionHeading}>3. Compensation & Banking</Text>
          </View>

          <CustomInput
            label="Monthly Basic Salary (₹)"
            placeholder="e.g. 50000"
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
            required
          />

          <CustomInput
            label="Bank Name"
            placeholder="e.g. HDFC Bank, SBI, ICICI"
            value={bankName}
            onChangeText={setBankName}
            autoCapitalize="words"
          />

          <CustomInput
            label="Bank Account Number"
            placeholder="e.g. 50100234567890"
            value={bankAccountNumber}
            onChangeText={setBankAccountNumber}
            keyboardType="numeric"
          />

          <CustomInput
            label="IFSC Code"
            placeholder="e.g. HDFC0001234"
            value={ifscCode}
            onChangeText={setIfscCode}
            autoCapitalize="characters"
          />

          <CustomInput
            label="PAN / Tax ID Number"
            placeholder="e.g. ABCDE1234F"
            value={panNumber}
            onChangeText={setPanNumber}
            autoCapitalize="characters"
          />
        </View>

        {/* SECTION 4: RESIDENTIAL ADDRESS */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.sectionIconBox, { backgroundColor: "#FEF3C7" }]}>
              <MapPin size={18} color="#D97706" />
            </View>
            <Text style={styles.sectionHeading}>4. Residential Address</Text>
          </View>

          <CustomInput
            label="Street Address"
            placeholder="Apartment, building, street address"
            value={address}
            onChangeText={setAddress}
          />

          <CustomInput
            label="City"
            placeholder="e.g. Mumbai, Bangalore"
            value={city}
            onChangeText={setCity}
          />

          <CustomInput
            label="State / Province"
            placeholder="e.g. Maharashtra, Karnataka"
            value={state}
            onChangeText={setState}
          />

          <CustomInput
            label="Postal / PIN Code"
            placeholder="e.g. 400001"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="numeric"
          />

          <CustomInput
            label="Country"
            placeholder="India"
            value={country}
            onChangeText={setCountry}
          />
        </View>

        {/* SECTION 5: EMERGENCY CONTACT */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.sectionIconBox, { backgroundColor: "#FEE2E2" }]}>
              <HeartHandshake size={18} color="#DC2626" />
            </View>
            <Text style={styles.sectionHeading}>5. Emergency Contact</Text>
          </View>

          <CustomInput
            label="Emergency Contact Name"
            placeholder="e.g. John Adams"
            value={emergencyContactName}
            onChangeText={setEmergencyContactName}
            autoCapitalize="words"
          />

          <View style={styles.pickerField}>
            <Text style={styles.label}>Relationship</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={emergencyContactRelation}
                onValueChange={(val) => setEmergencyContactRelation(val)}
                style={styles.picker}
                dropdownIconColor="#173B7A"
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Parent" value="Parent" />
                <Picker.Item label="Spouse" value="Spouse" />
                <Picker.Item label="Sibling" value="Sibling" />
                <Picker.Item label="Friend" value="Friend" />
                <Picker.Item label="Guardian" value="Guardian" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
          </View>

          <CustomInput
            label="Emergency Contact Phone"
            placeholder="e.g. 9876500000"
            value={emergencyContactPhone}
            onChangeText={setEmergencyContactPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* UPDATE BUTTON */}
        <CustomButton
          title="Save Changes"
          onPress={handleUpdateEmployee}
          loading={saving}
          style={styles.submitButton}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    paddingBottom: 10,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0E2A5D",
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
    marginBottom: 6,
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
    minHeight: 56,
    justifyContent: "center",
  },
  picker: {
    width: "100%",
    ...Platform.select({
      android: {
        height: 56,
        color: AppColors.text,
      },
      ios: {
        height: 50,
      },
      default: {
        height: 54,
      },
    }),
  },
  pickerItem: {
    fontSize: 14,
    height: 56,
    color: AppColors.text,
  },
  photoSection: {
    marginBottom: 16,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: AppColors.surfaceMuted,
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AppColors.surfaceMuted,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  pickButton: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: AppRadius.md,
  },
  pickButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#173B7A",
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: "#173B7A",
  },
});
