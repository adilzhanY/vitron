import * as React from 'react'
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, router, useRouter } from 'expo-router'
import { ScrollView } from 'react-native';
import { icons, images } from '@/constants';
import InputField from '@/components/shared/InputField';
import CustomButton from '@/components/shared/CustomButton';
import OAuth from '@/components/auth/OAuth';
import { ReactNativeModal } from 'react-native-modal';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
  });
  const [verification, setVerification] = React.useState({
    state: "default",
    error: "",
    code: "",
  });

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setVerification({
        ...verification,
        state: "pending",
      })
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
      Alert.alert("Error", err.errors[0].longMessage)
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }


  return (
    <ScrollView className="flex-1 bg-black">
      <View className='flex-1 bg-black items-center'>
        <Image source={images.vitronlogo} className='z-0 w-[250px] h-[250px] mb-10' />
        <Text className='text-2xl text-white font-benzinSemiBold absolute bottom-5 left-5'>
          Create Your Account
        </Text>
      </View>
      <View className='p-5'>
        <InputField
          label="Name"
          placeholder='Enter name'
          icon={icons.person}
          value={form.name}
          onChangeText={(value) => setForm({ ...form, name: value })}
        />
        <InputField
          label="Email"
          placeholder='Enter email'
          icon={icons.email}
          textContentType='emailAddress'
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
        />
        <InputField
          label="Password"
          placeholder='Enter password'
          icon={icons.lock}
          textContentType='password'
          value={form.password}
          onChangeText={(value) => setForm({ ...form, password: value })}
        />
        <CustomButton
          title='Sign Up'
          onPress={onSignUpPress}
          className='mt-6'
        />
        <OAuth />
        <Link
          href="/sign-in"
          className='text-lg text-center texte-general-200 mt-10'
        >
          Already have an account?{" "}
          <Text className='text-primary-500'>Log In</Text>
        </Link>
      </View>
      {/* Verification Modal */}
      <ReactNativeModal
        isVisible={verification.state === "pending"}
        onModalHide={() => {
          if (verification.state === "success") {
            setShowSuccessModal(true);
          }
        }}
      >
        <View className='bg-black px-7 py-9 rounded-2xl min-h-[300px]'>
          <Text className='font-benzinExtraBold text-2xl mb-2'>
            Verification
          </Text>
          <Text className='font-benzin mb-5'>
            We've sent a verification code to {form.email}.
          </Text>
          <InputField
            label={"Code"}
            icon={icons.lock}
            placeholder={'12345'}
            value={verification.code}
            keyboardType='numeric'
            onChangeText={(code) =>
              setVerification({ ...verification, code })
            }
          />
          {verification.error && (
            <Text className='text-red-500 text-sm mt-1'>
              {verification.error}
            </Text>
          )}
          <CustomButton
            title='Verify Email'
            onPress={onVerifyPress}
            className='mt-5 bg-success-500'
          />
        </View>
      </ReactNativeModal>
      <ReactNativeModal isVisible={showSuccessModal}>
        <View className='bg-black px-7 py-9 rounded-2xl min-h-[300px]'>
          <Image
            source={images.check}
            className='w-[110px] h-[110px] mx-auto  my-5'
          />
          <Text className='text-3xl font-benzinBold text-center'>
            Verified
          </Text>
          <Text className='text-base text-gray-400 font-benzin text-center mt-2'>
            You have successfully verified your account.
          </Text>
          <CustomButton
            title='Browse Home'
            onPress={() => router.push(`/(root)/(tabs)/home`)}
            className='mt-5'
          />
        </View>
      </ReactNativeModal>
    </ScrollView>
  )
}