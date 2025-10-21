import { View, Text, TextInput, ActivityIndicator, Alert, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useRouter } from 'expo-router'
import CustomButton from '@/components/shared/CustomButton'
import { useUser } from '@clerk/clerk-expo'
import { graphqlRequest } from '@/lib/graphqlRequest'
import { GET_USER_QUERY } from '@/lib/graphql/userQueries'
import { FontAwesome5 } from '@expo/vector-icons'
import { colors } from '@/constants'
import WeightPicker from '@/components/measurements/WeightPicker'
import WeightPicker2 from '@/components/measurements/WeightPicker2'

type PickerMode = 'text' | 'original' | 'new';

const TrackWeight = () => {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [fetchingUser, setFetchingUser] = useState(true);
  const [pickerMode, setPickerMode] = useState<PickerMode>('original'); // Default to original WeightPicker
  const [isPageReady, setIsPageReady] = useState(false); // Track page readiness

  // Fetch user data to get unit system preference
  useEffect(() => {
    const fetchUserData = async () => {
      if (!clerkUser) return;

      try {
        // For now, default to metric. Unit system preference can be added later
        // const data = await graphqlRequest(GET_USER_QUERY, { clerkId: clerkUser.id });
        // if (data.user?.unitSystem) {
        //   setUnitSystem(data.user.unitSystem);
        // }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setFetchingUser(false);
        // Set page ready after user data is fetched
        setTimeout(() => setIsPageReady(true), 50);
      }
    };

    fetchUserData();
  }, [clerkUser]);

  const handleWeightChange = (newWeight: number, unit: 'kg' | 'lb') => {
    // Convert to kg for storage if needed
    const weightInKg = unit === 'lb' ? newWeight * 0.453592 : newWeight;
    setWeight(weightInKg.toString());
  };

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
      const { graphqlRequest } = await import("@/lib/graphqlRequest");
      const { CREATE_WEIGHT_MUTATION } = await import("@/lib/graphql/weightQueries");

      await graphqlRequest(CREATE_WEIGHT_MUTATION, {
        input: {
          clerkId: clerkUser.id,
          weight: parseFloat(weight),
        },
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
    <SafeAreaView className='bg-white flex-1'>
      <Stack.Screen options={{
        headerShown: false
      }}
      />

      <View className="bg-white px-4 py-3 border-b border-gray-800 flex-row items-center">
        {/* Back button */}
        <TouchableOpacity onPress={() => router.push('/weight')} className="mr-4">
          <FontAwesome5 name="arrow-left" size={20} color="#000000" />
        </TouchableOpacity>

        {/* Title */}
        <Text className="text-black text-xl font-benzinExtraBold">
          Track New Weight
        </Text>
      </View>


      <View className='p-4'>
        {/* Toggle Button */}
        <TouchableOpacity
          onPress={() => {
            if (pickerMode === 'text') setPickerMode('original');
            else if (pickerMode === 'original') setPickerMode('new');
            else setPickerMode('text');
          }}
          className='bg-blue-500 p-3 rounded-lg mb-4'
        >
          <Text className='text-white text-center font-benzinBold'>
            {pickerMode === 'text' && 'Using TextInput (OLD)'}
            {pickerMode === 'original' && 'Using WeightPicker (ORIGINAL)'}
            {pickerMode === 'new' && 'Using WeightPicker2 (NEW LIBRARY)'}
          </Text>
          <Text className='text-white text-center font-benzin text-sm mt-1'>
            Tap to cycle through options
          </Text>
        </TouchableOpacity>

        {fetchingUser ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : !isPageReady ? (
          // Show loading while preparing picker data
          <View className='py-20'>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className='text-center text-gray-500 mt-4 font-benzin'>
              Preparing picker...
            </Text>
          </View>
        ) : pickerMode === 'original' ? (
          // Original WeightPicker Component (Custom Implementation)
          <View>
            <Text className='text-black text-lg font-benzinMedium mb-2 text-center'>
              Select Your Weight (Original Picker)
            </Text>
            <WeightPicker
              onWeightChange={handleWeightChange}
              initialWeight={weight ? parseFloat(weight) : undefined}
              unitSystem={unitSystem}
              enable3DEffect={false}
              showGradientMask={false}
              enableDecayAnimation={true}
              enableSpringAnimation={true}
              enableOpacityAnimation={true}
              enableFontSizeAnimation={true}
              disableAllAnimations={false}
            />
          </View>
        ) : pickerMode === 'new' ? (
          // New WeightPicker2 Component (Library Implementation)
          <View>
            <Text className='text-black text-lg font-benzinMedium mb-2 text-center'>
              Select Your Weight (New Library)
            </Text>
            <WeightPicker2
              onWeightChange={handleWeightChange}
              initialWeight={weight ? parseFloat(weight) : undefined}
              unitSystem={unitSystem}
            />
          </View>
        ) : (
          // Old TextInput
          <View>
            <Text className='text-black text-lg font-benzinMedium mb-2'>Today's Weight (kg)</Text>
            <TextInput
              className='bg-dark-blue-light text-black text-xl p-4 border rounded-3xl font-benzinBold'
              placeholder='e.g. 83.4'
              placeholderTextColor="#6b7280"
              keyboardType='numeric'
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        )}

        <View className='mt-8'>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <CustomButton title="Save Weight" onPress={handleSave} />
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default TrackWeight
