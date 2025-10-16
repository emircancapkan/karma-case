import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";
import { authAPI } from "./src/api/apiClient";

type Step = "username" | "password" | "mailVerification" | "code";

interface SignupFormValues {
  username: string;
  password: string;
  mail: string;
  code: string;
}

const validationSchemas = {
  username: Yup.object().shape({
    username: Yup.string()
      .min(5, "Username must be at least 5 characters")
      .required("Username is required"),
  }),
  password: Yup.object().shape({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  }),
  mailVerification: Yup.object().shape({
    mail: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
  }),
  code: Yup.object().shape({
    code: Yup.number()
      .min(1000, "Verification code must be 4 digits")
      .max(9999, "Verification code must be 4 digits")
      .required("Verification code is required"),
  }),
};

export default function SignupScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("username");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const initialValues: SignupFormValues = {
    username: "",
    password: "",
    mail: "",
    code: "",
  };

  const getProgressWidth = () => {
    switch (step) {
      case "username":
        return "25%";
      case "password":
        return "50%";
      case "mailVerification":
        return "75%";
      case "code":
        return "100%";
      default:
        return "0%";
    }
  };

  const getTitle = () => {
    switch (step) {
      case "username":
        return "Enter your username";
      case "password":
        return "Enter your password";
      case "mailVerification":
        return "Enter your email";
      case "code":
        return "Enter verification code: 1234";
      default:
        return "";
    }
  };

  const handleContinue = async (
    values: SignupFormValues,
    validateField: (field: string) => Promise<any>
  ) => {
    setErrorMessage("");
    setLoading(true);

    try {
      switch (step) {
        case "username":
          await validateField("username");
          if (values.username.trim().length >= 5) {
            // Check username availability
            const response = await authAPI.checkUsername({
              username: values.username,
            });
            
            if (response.data.success) {
              setStep("password");
            } else {
              setErrorMessage("Username already taken");
            }
          }
          break;

        case "password":
          await validateField("password");
          if (values.password.trim().length >= 8) {
            setStep("mailVerification");
          }
          break;

        case "mailVerification":
          await validateField("mail");
          if (
            validationSchemas.mailVerification.isValidSync({
              mail: values.mail,
            })
          ) {
            // Check mail and send verification code
            const response = await authAPI.checkMail({
              mail: values.mail,
            });
            
            if (response.data.success) {
              setStep("code");
              Alert.alert(
                "Verification Code Sent",
                "Please check your email for the verification code."
              );
            } else {
              setErrorMessage("Email already registered");
            }
          }
          break;

        case "code":
          await validateField("code");
          if (values.code.trim().length === 4) {
            // Register user with static verification code
            const response = await authAPI.register({
              username: values.username,
              password: values.password,
              mail: values.mail,
              code: "1234", // Static verification code
            });

            if (response.data.success) {
              // Save token and user data
              const { token, user } = response.data.data;
              await AsyncStorage.setItem("authToken", token);
              await AsyncStorage.setItem("userData", JSON.stringify(user));

              Alert.alert("Success", "Account created successfully!", [
                {
                  text: "OK",
                  onPress: () => router.replace("/(tabs)/" as any),
                },
              ]);
            } else {
              setErrorMessage("Registration failed. Please try again.");
            }
          }
          break;
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "An error occurred. Please try again.";
      setErrorMessage(errorMsg);
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isButtonEnabled = (values: SignupFormValues) => {
    switch (step) {
      case "username":
        return values.username.trim().length >= 5;
      case "password":
        return values.password.trim().length >= 8;
      case "mailVerification":
        return validationSchemas.mailVerification.isValidSync({
          mail: values.mail,
        });
      case "code":
        return values.code.trim().length === 4;
      default:
        return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Formik
        initialValues={initialValues}
        onSubmit={() => {}}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ values, handleChange, handleBlur, validateField }) => (
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <StatusBar style="dark" />

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View
                style={[styles.progressBar, { width: getProgressWidth() }]}
              />
            </View>

            <View style={styles.content}>
              {/* Title */}
              <Text style={styles.title}>{getTitle()}</Text>

              {/* Error Message */}
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              {/* Input Field */}
              <View style={styles.inputContainer}>
                {step === "username" && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.atSymbol}>@</Text>
                    <TextInput
                      style={styles.input}
                      value={values.username}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                      placeholder="username"
                      placeholderTextColor="#D1D5DB"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoFocus
                      onSubmitEditing={() =>
                        handleContinue(values, validateField)
                      }
                    />
                  </View>
                )}
                {step === "password" && (
                  <TextInput
                    style={styles.input}
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    placeholder="Enter your password"
                    placeholderTextColor="#D1D5DB"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    onSubmitEditing={() =>
                      handleContinue(values, validateField)
                    }
                  />
                )}
                {step === "mailVerification" && (
                  <TextInput
                    style={styles.input}
                    value={values.mail}
                    onChangeText={handleChange("mail")}
                    onBlur={handleBlur("mail")}
                    placeholder="Enter your email"
                    placeholderTextColor="#D1D5DB"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    onSubmitEditing={() =>
                      handleContinue(values, validateField)
                    }
                  />
                )}
                {step === "code" && (
                  <TextInput
                    style={styles.input}
                    value={values.code}
                    onChangeText={handleChange("code")}
                    onBlur={handleBlur("code")}
                    placeholder="1234"
                    placeholderTextColor="#D1D5DB"
                    keyboardType="number-pad"
                    maxLength={4}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    onSubmitEditing={() =>
                      handleContinue(values, validateField)
                    }
                  />
                )}
              </View>
            </View>

            {/* Continue Button */}
            <View style={styles.buttonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.continueButton,
                  (!isButtonEnabled(values) || loading) && styles.continueButtonDisabled,
                  pressed && isButtonEnabled(values) && !loading && styles.buttonPressed,
                ]}
                onPress={() => handleContinue(values, validateField)}
                disabled={!isButtonEnabled(values) || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.continueButtonText,
                      !isButtonEnabled(values) &&
                        styles.continueButtonTextDisabled,
                    ]}
                  >
                    CONTINUE
                  </Text>
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        )}
      </Formik>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: -20,
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#E5E7EB",
    marginTop: Platform.OS === "ios" ? 44 : 0,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#7C3AED",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 40,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#7C3AED",
    paddingBottom: 8,
    marginTop: 100,
  },
  atSymbol: {
    fontSize: 18,
    color: "#000000",
    fontWeight: "500",
    marginLeft: "35%",
    marginRight: 1,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: "#000000",
    paddingVertical: 8,
    textAlign: "justify",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  continueButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "#C4B5FD",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  continueButtonTextDisabled: {
    color: "#FFFFFF",
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
