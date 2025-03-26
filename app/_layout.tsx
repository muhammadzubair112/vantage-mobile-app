import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useTheme } from "@/components/ThemeProvider";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Define RootLayoutNav before RootLayout to maintain proper hooks order
function RootLayoutNav() {
  const { colors, isDarkMode } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerBackTitle: "",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen 
        name="conversation/[id]" 
        options={{ 
          headerTitle: "",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="auth/login" 
        options={{ 
          headerTitle: "Login",
          headerShown: false,
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="auth/register" 
        options={{ 
          headerTitle: "Register",
          headerShown: false,
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="team/create" 
        options={{ 
          headerTitle: "Create Team",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="team/manage" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          headerTitle: "Profile"
        }} 
      />
      <Stack.Screen 
        name="profile/edit" 
        options={{ 
          headerShown: false
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </ErrorBoundary>
  );
}