import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native'
import React from 'react'
import { ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@clerk/clerk-expo'
import { images } from '@/constants'
import { Link, router } from 'expo-router'

const Home = () => {
  const { user } = useUser();
  const loading = true;
  return (
    <SafeAreaView className='bg-black'>
      <Text className='text-3xl text-white'>That is home</Text>
      <Link
        href="/measurements"
        className="text-lg text-center text-gray-500 mt-10 font-benzinBold"
      >
        <Text className="text-white">Go to measurements</Text>
      </Link>
    </SafeAreaView >
  )
}

export default Home