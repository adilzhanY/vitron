import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/shared/CustomButton';
import RadialChart from '@/components/weight/RadialChart';
import { WeightEntry } from '@/types/type';
import { DUMMY_WEIGHT_ENTRIES, icons } from '@/constants';
import WeightAreaChart from '@/components/weight/WeightAreaChart';
import { useUser } from '@clerk/clerk-expo';
import { fetchAPI } from '@/lib/fetch';
import { format, parseISO } from 'date-fns';
import { router, useFocusEffect } from 'expo-router';
import InputField from '@/components/shared/InputField';

interface UserData {
  goal: 'lose weight' | 'gain weight' | 'be fit';
  weight_goal: number;
  start_weight: number;
  checkpoints: number;
}

const Weight = () => {
  const { user: clerkUser } = useUser();
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextCheckpointWeight, setNextCheckpointWeight] = useState<number>(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newGoalWeight, setNewGoalWeight] = useState("");
  const [newCheckpoints, setNewCheckpoints] = useState('9');

  const fetchAllData = useCallback(async () => {
    if (!clerkUser) return;
    try {
      setLoading(true);
      const [weightResponse, userResponse] = await Promise.all([
        fetchAPI(`/weights?clerkId=${clerkUser.id}`),
        fetchAPI(`/user?clerkId=${clerkUser.id}`)
      ]);
      const formattedData = weightResponse.data.map((entry: any) => ({
        weight: parseFloat(entry.weight),
        date: entry.logged_at,
      }));
      setWeightData(formattedData);
      setUserData(userResponse.data);
    } catch (error) {
      console.error("Failed to fetch weight data:", error);
    } finally {
      setLoading(false);
    }
  }, [clerkUser]);

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [fetchAllData])
  );


  const { startWeight, goalWeight, currentWeight, radialChartEntries, userGoal, checkpoints } = useMemo(() => {
    if (weightData.length === 0 || !userData) {
      return { startWeight: 0, goalWeight: 0, currentWeight: 0, radialChartEntries: [], userGoal: 'be fit' as const, checkpoints: 0 };
    }
    const mostRecentWeight = weightData[0].weight;
    const oldestWeight = weightData[weightData.length - 1].weight;

    // Use start_weight from the current goal, or fall back to the user's first-ever weight entry
    const start = userData.start_weight || oldestWeight;
    const goal = userData.weight_goal || mostRecentWeight;
    const chkpts = userData.checkpoints || 9;

    const entriesForRadial = weightData.map(e => e.weight).reverse();

    return { startWeight: start, goalWeight: goal, currentWeight: mostRecentWeight, radialChartEntries: entriesForRadial, userGoal: userData.goal, checkpoints: chkpts };
  }, [weightData, userData]);

  if (loading) {
    return (
      <SafeAreaView className='bg-black flex-1 justify-center items-center'>
        <ActivityIndicator size="large" color="#B957FF" />
      </SafeAreaView>
    )
  }
  if (weightData.length === 0 && !loading) {
    return (
      <SafeAreaView className='bg-black flex-1 justify-center items-center p-4'>
        <Text className='text-white text-lg font-benzin text-center'>No weight entries found.</Text>
        <View className='h-4' />
        <CustomButton title="Track Your First Weight" onPress={() => { }} />
      </SafeAreaView>
    )
  }


  const handleTrackWeight = () => {
    router.push('/track-weight');
  }
  const handleSetGoal = () => {
    router.push('/set-goal');
  }


  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white text-2xl font-benzinExtraBold">Track Your Weight</Text>
          <TouchableOpacity>
            <Text className="text-purple-400 text-base font-benzinExtraBold">Entries</Text>
          </TouchableOpacity>
        </View>

        {/* Checkpoints */}
        <View className='flex-row justify-between items-center mt-4'>
          {/* BMI */}
          <View className="items-center">
            <View className='flex-row'>
              <Text className="text-gray-400 text-sm font-benzinMedium">BMI</Text>
              <FontAwesome5 name="weight" size={16} color="#ffffff" style={{ marginLeft: 4 }} />
            </View>
            <Text className="text-white text-xl font-benzinBold">26.6</Text>
          </View>
          {/* Next Checkpoint */}
          <View className="items-center">
            <View className='flex-row'>
              <Text className="text-gray-400 text-sm font-benzinMedium">Next</Text>
              <FontAwesome5 name="flag-checkered" size={16} color="#ffffff" style={{ marginLeft: 4 }} />
            </View>
            <Text className="text-white text-xl font-benzinBold">
              {parseFloat(String(nextCheckpointWeight || 0)).toFixed(1)} kg
            </Text>
          </View>
        </View>
        {/* Radial Chart */}
        <RadialChart
          startWeight={startWeight}
          goalWeight={goalWeight}
          checkpoints={checkpoints}
          entries={radialChartEntries}
          goal={userGoal}
          onNextCheckpointCalculated={setNextCheckpointWeight}
          onSetNewGoal={() => setModalVisible(true)}
        />

        {/* Start & Goal */}
        <View className="flex-row justify-between mx-4 mb-6">
          <View>
            <View className='flex-row'>
              <Text className="text-gray-400 text-base font-benzinExtraBold">Start</Text>
              <FontAwesome5 name="rocket" size={16} color="#ffffff" style={{ marginLeft: 4 }} />
            </View>
            <Text className="text-white text-xl font-benzinExtraBold">{startWeight} kg</Text>
            <Text className="text-gray-400 text-sm font-benzinExtraBold">1 Sept 2025</Text>
          </View>
          <View className="items-end">
            <View className='flex-row'>
              <Text className="text-gray-400 text-base font-benzinExtraBold">Goal</Text>
              <FontAwesome5 name="trophy" size={16} color="#ffffff" style={{ marginLeft: 4 }} />
            </View>
            <Text className="text-white text-xl font-benzinExtraBold">{goalWeight} kg</Text>
            <CustomButton title='Set goal' onPress={handleSetGoal} />
          </View>
        </View>

        {/* Track button */}
        <CustomButton title="Track Weight" onPress={handleTrackWeight} />
        {/* Weight Streak */}
        <View className="flex-row gap-2 px-2 mt-4">
          {/* Active Streak */}
          <View className="flex-1 bg-black border border-yellow-400 rounded-2xl p-4 shadow">
            <Text className="text-yellow-400 text-sm font-benzinExtraBold">
              Active Streak
            </Text>
            <View className="flex-row items-center">
              <Text className="text-white text-3xl font-benzinBold mt-2">
                5
              </Text>
              <FontAwesome5 name="fire" size={24} color="#facc15" style={{ marginLeft: 4 }} />
            </View>
            <Text className="text-gray-300 text-sm mt-1 font-benzinBold">
              days in a row
            </Text>
          </View>

          {/* Longest Streak */}
          <View className="flex-1 bg-black border border-yellow-400 rounded-2xl p-4 shadow">
            <Text className="text-yellow-400 text-sm font-benzinExtraBold">
              Longest Streak
            </Text>
            <View className="flex-row items-center">
              <Text className="text-white text-3xl font-benzinBold mt-2">
                12
              </Text>
              <FontAwesome5 name="star" size={24} solid color="#fde047" style={{ marginLeft: 4 }} />
            </View>
            <Text className="text-gray-300 text-sm mt-1 font-benzinBold">
              best record
            </Text>
          </View>
        </View>


        {/* Entries */}
        <View className='flex flex-col mt-5'>
          <WeightAreaChart
            entries={weightData}
          />
        </View>

        <View className='mt-8 p-4 bg-black rounded-lg'>
          <Text className='text-white font-benzinExtraBold text-lg mb-2'>All Entries</Text>
          {weightData.map((entry, index) => (
            <View key={index} className='flex-row justify-between py-1'>
              <Text className='text-gray-300 font-benzinBold'>{format(parseISO(entry.date), 'eeee, d MMM yyyy')}</Text>
              <Text className='text-white font-benzinBold'>{entry.weight.toFixed(1)} kg</Text>
            </View>
          ))}

        </View>
        <View className='h-[500px]'></View>
      </ScrollView>
      {/* New Goal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/80">
          <View className="w-11/12 bg-[#1C1C1E] rounded-2xl p-6">
            <Text className="text-white text-2xl font-benzinBold mb-4">Set a New Goal</Text>

            <InputField
              label="New Goal Weight (kg)"
              value={newGoalWeight}
              onChangeText={setNewGoalWeight}
              keyboardType="numeric"
              placeholder="e.g., 75.5"
            />
            <View className='h-4' />
            <InputField
              label="Number of Checkpoints"
              value={newCheckpoints}
              onChangeText={setNewCheckpoints}
              keyboardType="numeric"
              placeholder="e.g., 9"
            />

            <View className="flex-row mt-6">
              <CustomButton title="Cancel" onPress={() => setModalVisible(false)} className="flex-1 bg-gray-600 mr-2" />
              <CustomButton title="Save Goal" onPress={handleSetNewGoal} className="flex-1 ml-2" />
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default Weight;
