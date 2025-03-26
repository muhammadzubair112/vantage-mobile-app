import React from 'react';
import { Tabs } from 'expo-router';
import { Calendar, Home, User, List, MessageCircle } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

export default function TabLayout() {
  const { colors } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.lightText,
        tabBarStyle: {
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 90 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 5,
          paddingTop: 8,
          backgroundColor: colors.background,
        },
        headerShown: false,
        tabBarLabelStyle: {
          marginBottom: Platform.OS === 'ios' ? 0 : 5,
          fontSize: 10, // Increased font size for better readability
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'My Bookings',
          tabBarIcon: ({ color, size }) => <List size={size} color={color} />,
          tabBarLabelStyle: {
            fontSize: 8, // Smaller font for "My Bookings" to prevent cutoff
            marginBottom: Platform.OS === 'ios' ? 0 : 5,
          }
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}