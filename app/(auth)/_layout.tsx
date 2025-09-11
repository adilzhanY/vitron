import { useFonts } from 'expo-font';
import { Stack, Redirect } from "expo-router";
import { useEffect } from 'react';
import "react-native-reanimated"
// import { useAuth } from '@clerk/clerk-expo';



export default function AuthLayout() {
  // const { isSignedIn } = useAuth()

  // if (isSignedIn) {
  //   return <Redirect href={'/'} />
  // }


  return <Stack screenOptions={{ headerShown: false }} />;
}