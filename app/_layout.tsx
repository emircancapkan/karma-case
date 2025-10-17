import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Text, StyleSheet } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

function MembershipHeaderTitle() {
  return (
    <Text style={styles.headerTitle}>
      Karma.<Text style={styles.headerTitleAI}>AI</Text>
    </Text>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="membershipScreen"
          options={{
            headerShown: true,
            headerTitle: () => <MembershipHeaderTitle />,
            headerBackButtonDisplayMode: "minimal",
            headerStyle: {
              backgroundColor: "#FFFFFF",
            },
            headerShadowVisible: true,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  headerTitleAI: {
    color: "#7C3AED",
  },
});
