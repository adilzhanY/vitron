import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import './global.css';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { tokenCache } from "@clerk/clerk-expo/token-cache"
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { fetchAPI } from "@/lib/fetch";

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
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [measurementsFilled, setMeasurementsFilled] = useState<boolean | null>(null);
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
    const checkUserStatus = async () => {
      if (userId) {
        try {
          const data = await fetchAPI(`/(api)/user-status?clerkId=${userId}`)
          // const data = await res.json();
          setMeasurementsFilled(data.measurements_filled);

        } catch (error) {
          console.error("Failed to fetch user status", error);
          setMeasurementsFilled(false);

        }
      } else if (isLoaded) {
        setMeasurementsFilled(false);
      }
    };

    if (isLoaded) {
      checkUserStatus();
    }
  }, [isLoaded, userId, segments]);

  useEffect(() => {
    if (!isLoaded || measurementsFilled === null) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inAppGroup = segments[0] === "(root)";

    if (isSignedIn && !measurementsFilled) {
      // User is signed in but hasn't filled measurements, force to measurements screen
      router.replace('/(auth)/measurements');
    } else if (isSignedIn && measurementsFilled && !inAppGroup) {
      // User is fully onboarded, send to home
      router.replace('/(root)/(tabs)/home');
    } else if (!isSignedIn && !inAuthGroup) {
      // User is not signed in and not in auth group, send to sign-in
      router.replace('/(auth)/sign-in');
    }
  }, [isSignedIn, isLoaded, segments, measurementsFilled]);

  if (!loaded || !isLoaded || measurementsFilled === null) {
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
