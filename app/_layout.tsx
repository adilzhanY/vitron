import { Stack } from "expo-router";
import './global.css';
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from "@clerk/clerk-expo/token-cache"
import { useFonts } from "expo-font";
import { useEffect } from "react";


function InitialLayout() {
  const [loaded, error] = useFonts({
    "Benzin-Regular": require("../assets/font/Benzin/Benzin-Regular.ttf"),
    "Benzin-Bold": require("../assets/font/Benzin/Benzin-Bold.ttf"),
    "Benzin-ExtraBold": require("../assets/font/Benzin/Benzin-ExtraBold.ttf"),
    "Benzin-Medium": require("../assets/font/Benzin/Benzin-Medium.ttf"),
    "Benzin-Semibold": require("../assets/font/Benzin/Benzin-Semibold.ttf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // While fonts are loading, don't render the navigation stack.
  if (!loaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <InitialLayout />
    </ClerkProvider>
  )
}
