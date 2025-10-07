import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import * as Linking from 'expo-linking'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SignOutButton } from '@/components/auth/SignOutButton'
import CustomButton from '@/components/shared/CustomButton'
import { useClerk, useUser } from '@clerk/clerk-expo'
import { fetchAPI } from '@/lib/fetch'



const Profile = () => {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to your desired page
      Linking.openURL(Linking.createURL('/'));
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  }

  const handleCreateNewWeightGoal = async () => {
    const payload = {
      clerkId: clerkUser?.id,
      startWeight: 80,
      targetWeight: 45,
      checkpoints: 8,
      dailyCalorieGoal: 1300,
    }

    try {
      // console.log('sending', JSON.stringify(payload));
      const res = await fetchAPI('/weight-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log("New weight goal created in db");
      // console.log(JSON.stringify(payload))
    } catch (e) {
      console.error('Failed to save goal', e);
    }

  }
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <CustomButton
          title={'Sign Out'}
          onPress={handleSignOut}
          className="flex-1 ml-2"
        />
        <SignOutButton />

        <CustomButton
          title={'Create new weight goal'}
          onPress={handleCreateNewWeightGoal}
          className='flex-1 ml-2'
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile
