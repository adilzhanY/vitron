import { View, Text, Image } from 'react-native'
import React from 'react'
import CustomButton from '../shared/CustomButton'
import { icons } from '@/constants';
// import { icons } from '@/constants'

const OAuth = () => {
  const handleGoogleSignIn = async () => {

  };
  return (
    <View>
      <View className='flex flex-row justify-center items-center mt-4 gap-x-3'>
        <View className='flex-1 h-[1px] bg-white' />
        <Text className='text-lg  font-benzinBold text-white'>Or</Text>
        <View className='flex-1 h-[1px] bg-white' />
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