import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import './global.css';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { tokenCache } from "@clerk/clerk-expo/token-cache"
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const [loaded, error] = useFonts({
    "Benzin-Regular": require("../assets/font/Benzin/Benzin-Regular.ttf"),
    "Benzin-Bold": require("../assets/font/Benzin/Benzin-Bold.ttf"),
    "Benzin-ExtraBold": require("../assets/font/Benzin/Benzin-ExtraBold.ttf"),
    "Benzin-Medium": require("../assets/font/Benzin/Benzin-Medium.ttf"),
    "Benzin-Semibold": require("../assets/font/Benzin/Benzin-Semibold.ttf"),
  });
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isSignedIn && inAuthGroup) {
      router.replace("/(root)/(tabs)/home");
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace("/welcome");
    }
  }, [isSignedIn, isLoaded, segments]);

  if (!loaded || !isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  if (!publishableKey) {
    throw new Error(
      "Missing Publishable key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env",
    );
  }
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <InitialLayout />
    </ClerkProvider>
  )
}
