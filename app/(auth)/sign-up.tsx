import * as React from 'react'
import { Alert, Image, Text, View, Platform } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, router } from 'expo-router'
import { icons, images } from '@/constants'
import InputField from '@/components/shared/InputField'
import CustomButton from '@/components/shared/CustomButton'
import OAuth from '@/components/auth/OAuth'
import { ReactNativeModal } from 'react-native-modal'
import { graphqlRequest } from '@/lib/graphqlRequest'
import { CREATE_USER_MUTATION } from '@/lib/graphql/userQueries'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
// import Logo from '';



export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const insets = useSafeAreaInsets()
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)

  const [form, setForm] = React.useState({
    name: '',
    email: '',
    password: '',
  })

  const [verification, setVerification] = React.useState({
    state: 'default',
    error: '',
    code: '',
  })

  const onSignUpPress = async () => {
    if (!isLoaded) return
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setVerification({ ...verification, state: 'pending' })
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2))
      Alert.alert('Error', err.errors[0].longMessage)
    }
  }

  const onVerifyPress = async () => {
    if (!isLoaded) return
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      })
      if (completeSignUp.status === 'complete') {
        await graphqlRequest(CREATE_USER_MUTATION, {
          input: {
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
          },
        })

        await setActive({ session: completeSignUp.createdSessionId })
        setVerification({ ...verification, state: 'success' })
        setShowSuccessModal(true);
        router.replace("./(auth)/measurements");
      } else {
        setVerification({
          ...verification,
          error: 'Verification failed. Please try again.',
          state: 'failed',
        })
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors[0].longMessage,
        state: 'failed',
      })
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 20, // ensures buttons are not behind navigation bar
        }}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 60 : 80}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-white items-center">
          <Image
            source={icons.applogo}
            className="z-0 w-[200px] h-[200px] mb-20"
          />
          <Text className="text-2xl text-black font-interSemiBold absolute bottom-5 left-5">
            Create Your Account
          </Text>
        </View>

        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
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

          <CustomButton title="Sign Up" onPress={onSignUpPress} className="mt-6 w-full" />

          <OAuth />

          <Link
            href="/sign-in"
            className="text-lg text-center text-gray-500 mt-10 font-interBold"
          >
            Already have an account? <Text className="text-black">Log In</Text>
          </Link>
        </View>

        {/* Verification Modal */}
        <ReactNativeModal
          isVisible={verification.state === 'pending' || (verification.state === 'success' && !showSuccessModal)}
          onModalHide={() => {
            if (verification.state === 'success') setShowSuccessModal(true)
          }}
        >
          <View className="bg-black px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="font-interExtraBold text-2xl text-white mb-2">
              Verification
            </Text>
            <Text className="font-interSemiBold mb-5 text-white">
              We've sent a verification code to {form.email}.
            </Text>
            <InputField
              label="Code"
              icon={icons.lock}
              placeholder="12345"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />
            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">{verification.error}</Text>
            )}
            <CustomButton
              title="Verify Email"
              onPress={onVerifyPress}
              className="mt-5 bg-success-500"
            />
          </View>
        </ReactNativeModal>

        {/* Success Modal */}
        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="bg-black px-7 py-9 rounded-2xl min-h-[300px]">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />
            <Text className="text-3xl font-interBold text-center">Verified</Text>
            <Text className="text-base text-gray-400 font-inter text-center mt-2">
              You have successfully verified your account.
            </Text>
            <CustomButton
              title="Continue"
              onPress={() => router.push(`/(auth)/measurements`)}
              className="mt-5"
            />
          </View>
        </ReactNativeModal>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}
