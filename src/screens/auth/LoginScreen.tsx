// src/screens/auth/LoginScreen.tsx
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
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useAuth } from "../../context/AuthContext";

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, isLoading } = useAuth();
  
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setError("");
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || "Invalid username or password");
      Alert.alert("Login Failed", error || "Invalid username or password");
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleCreateAccount = () => {
    navigation.navigate("RegisterStep1");
  };

  const handleStaffLogin = () => {
    navigation.navigate("StaffLogin");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.logoText}>
                <Text style={styles.logoClinic}>Clinic</Text>
                <Text style={styles.logoConnect}>Connect</Text>
              </Text>
              <Text style={styles.tagline}>Connecting Patients With Healthcare</Text>
              <View style={styles.pillsRow}>
                <Text style={styles.pill}>BOOK</Text>
                <Text style={styles.pillDot}>✦</Text>
                <Text style={styles.pill}>CARE</Text>
                <Text style={styles.pillDot}>✦</Text>
                <Text style={styles.pill}>CONNECT</Text>
              </View>
            </View>

            <View style={styles.body}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>USERNAME</Text>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    setError("");
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  placeholder="Enter your username or email"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>PASSWORD</Text>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError("");
                  }}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                />

                <TouchableOpacity
                  onPress={handleForgotPassword}
                  style={styles.forgotWrapper}
                >
                  <Text style={styles.forgotText}>FORGOT PASSWORD?</Text>
                </TouchableOpacity>
              </View>

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              <TouchableOpacity 
                style={[styles.btnPrimary, isLoading && styles.btnDisabled]} 
                onPress={handleSignIn}
                disabled={isLoading}
              >
                <Text style={styles.btnPrimaryText}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.orDivider}>OR</Text>

              <TouchableOpacity 
                style={styles.btnSecondary} 
                onPress={handleCreateAccount}
                disabled={isLoading}
              >
                <Text style={styles.btnSecondaryText}>Create an account</Text>
              </TouchableOpacity>

              <View style={styles.staffRow}>
                <Text style={styles.staffText}>Staff? </Text>
                <TouchableOpacity onPress={handleStaffLogin}>
                  <Text style={styles.staffLink}>Sign in with staff ID</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  card: {
    width: 300,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    backgroundColor: "#d4b896",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  logoText: {
    fontSize: 26,
    fontWeight: "bold",
  },
  logoClinic: {
    color: "#1e2a3a",
  },
  logoConnect: {
    color: "#7a8c3a",
  },
  tagline: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#7a8c3a",
    marginTop: 4,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  pillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pill: {
    fontSize: 8,
    fontWeight: "700",
    color: "#1e2a3a",
    letterSpacing: 1,
  },
  pillDot: {
    fontSize: 7,
    color: "#1e2a3a",
    opacity: 0.5,
  },
  body: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#555555",
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d0d0cb",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
    color: "#1e2a3a",
  },
  inputError: {
    borderColor: "#E53935",
  },
  forgotWrapper: {
    alignSelf: "flex-end",
    marginTop: 4,
  },
  forgotText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#444444",
    letterSpacing: 0.6,
  },
  errorText: {
    fontSize: 12,
    color: "#E53935",
    marginBottom: 8,
    textAlign: "center",
  },
  btnPrimary: {
    width: "100%",
    backgroundColor: "#1e2a3a",
    borderRadius: 6,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPrimaryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  orDivider: {
    textAlign: "center",
    fontSize: 12,
    color: "#999999",
    marginVertical: 10,
  },
  btnSecondary: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#1e2a3a",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnSecondaryText: {
    color: "#1e2a3a",
    fontSize: 14,
    fontWeight: "600",
  },
  staffRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  staffText: {
    fontSize: 11,
    color: "#444444",
  },
  staffLink: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1e2a3a",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;