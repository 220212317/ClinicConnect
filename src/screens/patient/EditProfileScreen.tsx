import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  password: string;
}

interface EditProfileScreenProps {
  onSave?: (profile: ProfileData) => void;
  onBack?: () => void;
  initialData?: ProfileData;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  onSave,
  onBack,
  initialData,
}) => {
  const [fullName, setFullName] = useState<string>(initialData?.fullName ?? "");
  const [email, setEmail] = useState<string>(initialData?.email ?? "");
  const [phone, setPhone] = useState<string>(initialData?.phone ?? "");
  const [dateOfBirth, setDateOfBirth] = useState<string>(initialData?.dateOfBirth ?? "");
  const [address, setAddress] = useState<string>(initialData?.address ?? "");
  const [password, setPassword] = useState<string>(initialData?.password ?? "");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSave = () => {
    const profileData: ProfileData = {
      fullName,
      email,
      phone,
      dateOfBirth,
      address,
      password,
    };
    if (onSave) {
      onSave(profileData);
    } else {
      console.log("Profile saved:", profileData);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      console.log("Back tapped");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>

          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Edit Profile</Text>
            </TouchableOpacity>

            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {fullName ? fullName.charAt(0).toUpperCase() : "👤"}
                </Text>
              </View>
              <View style={styles.cameraBadge}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
              <Text style={styles.photoHint}>Tap to change photo</Text>
            </View>
          </View>

          <View style={styles.body}>

            <View style={styles.formGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
                placeholder="e.g. Jane Doe"
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="e.g. jane@email.com"
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="e.g. 071 234 5678"
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>DATE OF BIRTH</Text>
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="e.g. 01 Jan 2000"
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>ADDRESS</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={address}
                onChangeText={setAddress}
                placeholder="e.g. 12 Main Road, Cape Town"
                placeholderTextColor="#aaa"
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Enter new password"
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeIcon}>
                    {showPassword ? "🙈" : "👁️"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
              <Text style={styles.btnSaveText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnCancel} onPress={handleBack}>
              <Text style={styles.btnCancelText}>Cancel</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e8d5b7",
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 40,
  },
  header: {
    width: "100%",
    backgroundColor: "#d4b896",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 60,
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backArrow: {
    fontSize: 18,
    color: "#1e2a3a",
    marginRight: 6,
  },
  backText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e2a3a",
  },
  avatarContainer: {
    alignItems: "center",
    position: "absolute",
    bottom: -50,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#c0b8a8",
    borderWidth: 3,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 32,
    color: "#1e2a3a",
    fontWeight: "700",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 22,
    right: -4,
    backgroundColor: "#1e2a3a",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    fontSize: 12,
  },
  photoHint: {
    fontSize: 10,
    color: "#1e2a3a",
    marginTop: 54,
    opacity: 0.7,
  },
  body: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 32,
    minHeight: 600,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#555555",
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1e2a3a",
    backgroundColor: "#fafafa",
  },
  inputMultiline: {
    height: 80,
    paddingTop: 10,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  eyeButton: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderLeftWidth: 0,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fafafa",
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIcon: {
    fontSize: 16,
  },
  btnSave: {
    width: "100%",
    backgroundColor: "#1e2a3a",
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  btnSaveText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  btnCancel: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#1e2a3a",
    borderRadius: 6,
    paddingVertical: 13,
    alignItems: "center",
  },
  btnCancelText: {
    color: "#1e2a3a",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default EditProfileScreen;