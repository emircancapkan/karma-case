import React, { useState } from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen, DiscoverScreen, ProfileScreen } from '@/src/screens';
import { TabHeader } from '@/src/components/layout';
import { SettingsSheet } from '@/src/components/custom';
import { colors, spacing, typography } from '@/src/theme';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  const renderHeader = () => (
    <TabHeader onSettingsPress={() => setShowSettings(true)} />
  );

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray400,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: Platform.OS === 'ios' ? 88 : 60,
            paddingBottom: Platform.OS === 'ios' ? spacing['2xl'] : spacing.sm,
            paddingTop: spacing.sm,
          },
          tabBarLabelStyle: {
            fontSize: typography.caption.fontSize,
            fontWeight: '600',
          },
        }}
      >
      <Tab.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'add-circle' : 'add-circle-outline'} 
              size={28} 
              color={color} 
            />
          ),
        }}
      >
        {() => (
          <>
            {renderHeader()}
            <HomeScreen />
          </>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'grid' : 'grid-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      >
        {() => (
          <>
            {renderHeader()}
            <DiscoverScreen />
          </>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'person-circle' : 'person-circle-outline'} 
              size={28} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>

    <SettingsSheet
      visible={showSettings}
      onClose={() => setShowSettings(false)}
    />
    </>
  );
};

