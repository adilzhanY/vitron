import { useSignIn, useUser } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Alert, Image, Text, View, Platform } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { icons, images } from '@/constants'
import InputField from '@/components/shared/InputField'
import CustomButton from '@/components/shared/CustomButton'
import OAuth from '@/components/auth/OAuth'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { fetchAPI } from '@/lib/fetch'

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { user } = useUser();
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    if (user) {
      checkUserMeasurements();
    }
  }, [user]);

  const checkUserMeasurements = async () => {
    if (!user) return;
    try {
      const response = await fetchAPI(`/(api)/user-status?clerkId=${user.id}`);
      const data = await response.json();
      if (data.measurementsFilled) {
        router.replace('/(root)/(tabs)/home');
      } else {
        router.replace('/(auth)/measurements');
      }
    } catch (error) {
      console.log(error);
      // Default to home if there's an error
      router.replace('/(root)/(tabs)/home');
    }
  };

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        // The useEffect will handle the redirect
      } else {
        console.log(JSON.stringify(signInAttempt, null, 2))
        Alert.alert('Error', 'Log in failed. Please try again.')
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2))
      Alert.alert('Error', err.errors[0].longMessage)
    }
  }, [isLoaded, form])

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 20, // ensures bottom buttons are visible
        }}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 60 : 80}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-white items-center">
          <Image
            source={icons.applogo}
            className="z-0 w-[200px] h-[200px] mb-10"
          />
          <Text className="text-2xl text-black font-benzinSemiBold absolute bottom-5 left-5">
            Welcome 👋
          </Text>
        </View>

        <View className="p-5">
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            autoCapitalize="none"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton title="Sign In" onPress={onSignInPress} className="mt-6 w-full" />

          <OAuth />

          <Link
            href="/sign-up"
            className="text-lg text-center text-gray-500 mt-10 font-benzinBold"
          >
            Don't have an account? <Text className="text-black">Sign Up</Text>
          </Link>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}
