import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Alert, Image, Text, View, Platform } from 'react-native'
import React, { useCallback, useState } from 'react'
import { icons, images } from '@/constants'
import InputField from '@/components/shared/InputField'
import CustomButton from '@/components/shared/CustomButton'
import OAuth from '@/components/auth/OAuth'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/(root)/(tabs)/home')
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
    <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 20, // ensures bottom buttons are visible
        }}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 60 : 80}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-black items-center">
          <Image
            source={images.vitronlogo}
            className="z-0 w-[200px] h-[200px] mb-10"
          />
          <Text className="text-2xl text-white font-benzinSemiBold absolute bottom-5 left-5">
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

          <CustomButton title="Sign In" onPress={onSignInPress} className="mt-6" />

          <OAuth />

          <Link
            href="/sign-up"
            className="text-lg text-center text-gray-500 mt-10 font-benzinBold"
          >
            Don't have an account? <Text className="text-white">Sign Up</Text>
          </Link>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}
