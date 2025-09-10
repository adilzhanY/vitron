import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import { useEffect } from 'react';
import "react-native-reanimated"



export default function RootLayout() {

  return <Stack screenOptions={{ headerShown: false }} />;
}