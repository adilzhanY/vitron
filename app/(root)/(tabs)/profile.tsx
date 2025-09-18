import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SignOutButton } from '@/components/auth/SignOutButton'



const Profile = () => {
  return (
    <SafeAreaView className='flex-1 bg-black'>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <SignOutButton />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile