import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/hooks";
import { colors, spacing, typography, borderRadius } from "@/src/theme";
import { formatCredits } from "@/src/utils/formatters";
import { APP_CONFIG } from "@/src/config/constants";

interface TabHeaderProps {
  onSettingsPress: () => void;
}

export const TabHeader: React.FC<TabHeaderProps> = ({ onSettingsPress }) => {
  const { user } = useAuth();

  const isPremium = user?.isPremium ?? false;
  const credits = user?.credits ?? 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/40.png")}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>
            {APP_CONFIG.name.split(".")[0]}.
            <Text style={styles.logoAI}>{APP_CONFIG.name.split(".")[1]}</Text>
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.creditsContainer}>
            {isPremium ? (
              <>
                <Text style={styles.creditIcon}>⭐</Text>
                <Text style={styles.premiumText}>Premium</Text>
              </>
            ) : (
              <>
                <Text style={styles.creditIcon}>📸</Text>
                <Text style={styles.creditsText}>{formatCredits(credits)}</Text>
                <Text style={styles.creditsLabel}>credits</Text>
              </>
            )}
          </View>
          <Pressable style={styles.settingsButton} onPress={onSettingsPress}>
            <Ionicons
              name="settings-outline"
              size={24}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomColor: colors.borderLight,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  logoImage: {
    borderRadius: borderRadius.lg,
    resizeMode: "contain",
  },
  logoText: {
    ...typography.h5,
    color: colors.textPrimary,
  },
  logoAI: {
    color: colors.primary,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  creditsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius["2xl"],
    gap: spacing.xs,
  },
  creditIcon: {
    fontSize: 16,
  },
  creditsText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  creditsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  settingsButton: {
    padding: spacing.xs,
  },
});
