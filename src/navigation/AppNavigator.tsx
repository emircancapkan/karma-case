import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/src/store';
import { ErrorBoundary } from '@/src/components/layout';
import { colors, typography } from '@/src/theme';
import { APP_CONFIG } from '@/src/config/constants';
import { 
  SplashScreen, 
  WelcomeScreen, 
  LoginScreen, 
  SignupScreen, 
  MembershipScreen,
  ResultScreen
} from '@/src/screens';
import { TabNavigator } from './TabNavigator';

const Stack = createNativeStackNavigator();

function MembershipHeaderTitle() {
  return (
    <Text style={styles.headerTitle}>
      {APP_CONFIG.name.split('.')[0]}.<Text style={styles.headerTitleAI}>{APP_CONFIG.name.split('.')[1]}</Text>
    </Text>
  );
}

export const AppNavigator: React.FC = () => {
  const colorScheme = useColorScheme();
  const loadUserFromStorage = useAuthStore((state) => state.loadUserFromStorage);

  // Load user data on app start
  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  return (
    <ErrorBoundary>
      <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack.Navigator>
          <Stack.Screen 
            name="Splash" 
            component={SplashScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Signup" 
            component={SignupScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="MainTabs" 
            component={TabNavigator} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen
            name="Membership"
            component={MembershipScreen}
            options={{
              headerShown: true,
              headerTitle: () => <MembershipHeaderTitle />,
              headerBackButtonDisplayMode: 'minimal',
              headerStyle: {
                backgroundColor: colors.white,
              },
              headerShadowVisible: true,
            }}
          />
          <Stack.Screen
            name="Result"
            component={ResultScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    ...typography.h5,
    color: colors.textPrimary,
  },
  headerTitleAI: {
    color: colors.primary,
  },
});

