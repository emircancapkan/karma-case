import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userAPI } from "./src/api/apiClient";
import * as WebBrowser from "expo-web-browser";

type MembershipPlan = "annual" | "weekly";

export default function MembershipScreen() {
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan>("annual");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = async () => {
    setIsProcessing(true);
    try {
      // Call purchase API
      const response = await userAPI.purchase();

      if (response.data.success) {
        // Update user data in AsyncStorage to mark as premium
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const user = JSON.parse(userData);
          user.isPremium = true;
          user.credits = -1; // -1 means unlimited credits
          user.membershipPlan = selectedPlan;
          user.membershipStartDate = new Date().toISOString();
          await AsyncStorage.setItem("userData", JSON.stringify(user));
        }

        Alert.alert(
          "Success! 🎉",
          "You are now a Premium member with unlimited AI generations!",
          [
            {
              text: "Start Creating",
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      Alert.alert(
        "Purchase Failed",
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTermsOfUse = async () => {
    try {
      await WebBrowser.openBrowserAsync("https://www.google.com");
    } catch (error) {
      Alert.alert("Error", "Unable to open the link");
    }
  };

  const handleRestorePurchase = async () => {
    Alert.alert("Restore Purchase", "Your purchases have been restored!");
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationWrapper}>
            <Image
              source={require("../assets/images/home_page.png")}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Unlimited Generate</Text>
        <Text style={styles.subtitle}>
          Create unlimited images with{"\n"}Premium Membership!
        </Text>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {/* Annual Plan */}
          <Pressable
            style={[
              styles.planCard,
              selectedPlan === "annual" && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan("annual")}
          >
            <View style={styles.planLeft}>
              <View
                style={[
                  styles.radioButton,
                  selectedPlan === "annual" && styles.radioButtonSelected,
                ]}
              >
                {selectedPlan === "annual" && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={styles.planTitle}>Annual 🔥</Text>
              <View style={styles.bestDealBadge}>
                <Text style={styles.bestDealText}>Best Deal ⚡</Text>
              </View>
            </View>
            <View style={styles.planRight}>
              <Text style={styles.planPrice}>$0.39</Text>
              <Text style={styles.planPeriod}> / week</Text>
            </View>
          </Pressable>

          {/* Weekly Plan */}
          <Pressable
            style={[
              styles.planCard,
              selectedPlan === "weekly" && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan("weekly")}
          >
            <View style={styles.planLeft}>
              <View
                style={[
                  styles.radioButton,
                  selectedPlan === "weekly" && styles.radioButtonSelected,
                ]}
              >
                {selectedPlan === "weekly" && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={styles.planTitle}>Weekly 📌</Text>
            </View>
            <View style={styles.planRight}>
              <Text style={styles.planPrice}>$7.99</Text>
              <Text style={styles.planPeriod}> / week</Text>
            </View>
          </Pressable>
        </View>

        {/* Security Message */}
        <View style={styles.securityContainer}>
          <Ionicons name="shield-checkmark" size={20} color="#10B981" />
          <Text style={styles.securityText}>
            It is secured by the Apple. Cancel Anytime
          </Text>
        </View>

        {/* Continue Button */}
        <Pressable
          style={[
            styles.continueButton,
            isProcessing && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </Pressable>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <Pressable onPress={handleTermsOfUse}>
            <Text style={styles.footerLinkText}>Terms of Use</Text>
          </Pressable>
          <Pressable onPress={handleRestorePurchase}>
            <Text style={styles.footerLinkText}>Restore Purchase</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  illustrationContainer: {
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 5,
    paddingHorizontal: 20,
  },
  illustrationWrapper: {
    width: "100%",
    maxWidth: 400,
    aspectRatio: 1,
    alignItems: "center",
    marginBottom: "-20%",
  },
  illustrationImage: {
    width: "80%",
    height: "80%",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 0,
  },
  subtitle: {
    fontSize: 16,
    color: "#C7C7C7",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  plansContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  planCardSelected: {
    borderColor: "#7C3AED",
    backgroundColor: "#F5F3FF",
    borderWidth: 3,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  planLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#7C3AED",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#7C3AED",
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  bestDealBadge: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
  },
  bestDealText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  planRight: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  planPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  planPeriod: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  securityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  securityText: {
    fontSize: 14,
    color: "#6B7280",
  },
  continueButton: {
    marginHorizontal: 20,
    backgroundColor: "#7C3AED",
    paddingVertical: 20,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonDisabled: {
    backgroundColor: "#C4B5FD",
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    paddingBottom: 30,
  },
  footerLinkText: {
    fontSize: 14,
    color: "#B3B3B3",
  },
});
