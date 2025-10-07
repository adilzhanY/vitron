import { View, Text, Image, Alert } from 'react-native'
import React from 'react'
import CustomButton from '../shared/CustomButton'
import { icons } from '@/constants';
// import { icons } from '@/constants'
import { googleOAuth } from "@/lib/auth";
import { router } from 'expo-router';
import { useOAuth } from '@clerk/clerk-expo';

const OAuth = () => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const handleGoogleSignIn = async () => {
    const result = await googleOAuth(startOAuthFlow);

    if (result.code === "session_exists") {
      Alert.alert("Success", "Session exists. Redirecting to home screen.");
      router.replace("/(root)/(tabs)/home");
    }

    Alert.alert(result.success ? "Success" : "Error", result.message);
  };
  return (
    <View>
      <View className='flex flex-row justify-center items-center mt-4 gap-x-3'>
        <View className='flex-1 h-[1px] bg-black' />
        <Text className='text-lg  font-benzinBold text-black'>Or</Text>
        <View className='flex-1 h-[1px] bg-black' />
      </View>
      <CustomButton
        title='Log In with Google'
        className='mt-5 w-[300px] shadow-none self-center'
        IconLeft={() => (
          <Image source={icons.google} resizeMode='contain' className='w-5 h-5 mx-5' />
        )}
        bgVariant='outline'
        textVariant='primary'
        onPress={handleGoogleSignIn}
      />
    </View>
  )
}

export default OAuth
