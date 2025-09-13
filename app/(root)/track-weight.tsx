import { View, Text, TextInput, ActivityIndicator, Alert, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useRouter } from 'expo-router'
import CustomButton from '@/components/shared/CustomButton'
import { useUser } from '@clerk/clerk-expo'
import { fetchAPI } from '@/lib/fetch'
import { FontAwesome5 } from '@expo/vector-icons'
import { useNavigation } from "@react-navigation/native";

const TrackWeight = () => {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!weight || isNaN(parseFloat(weight))) {
      Alert.alert("Invalid Input", "Please enter a valid weight.");
      return;
    }

    if (!clerkUser) {
      Alert.alert("Error", "User not found. Please try again.");
      return;
    }

    setLoading(true);
    try {
      await fetchAPI('/weights', {
        method: 'POST',
        body: JSON.stringify({
          clerkId: clerkUser.id,
          weight: parseFloat(weight),
        }),
      });

      Alert.alert("Success", "Weight has been saved successfully!");
      router.back(); // Go back to the previous screen

    } catch (error) {
      console.error("Failed to save weight:", error);
      Alert.alert("Error", "Failed to save weight. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className='bg-black flex-1'>
      <Stack.Screen options={{
        headerShown: false
      }}
      />

      <View className="bg-black px-4 py-3 border-b border-gray-800 flex-row items-center">
        {/* Back button */}
        <TouchableOpacity onPress={() => router.push('/weight')} className="mr-4">
          <FontAwesome5 name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Title */}
        <Text className="text-white text-xl font-benzinExtraBold">
          Track New Weight
        </Text>
      </View>


      <View className='p-4'>
        <Text className='text-white text-lg font-benzinMedium mb-2'>Today's Weight (kg)</Text>
        <TextInput
          className='bg-dark-blue-light text-white text-xl p-4 rounded-lg font-benzinBold'
          placeholder='e.g. 83.4'
          placeholderTextColor="#6b7280"
          keyboardType='numeric'
          value={weight}
          onChangeText={setWeight}
        />

        <View className='mt-8'>
          {loading ? (
            <ActivityIndicator size="large" color="#B957FF" />
          ) : (
            <CustomButton title="Save Weight" onPress={handleSave} />
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default TrackWeight