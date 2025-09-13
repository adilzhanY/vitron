import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/shared/CustomButton';
import RadialChart from '@/components/weight/RadialChart';
import { WeightEntry } from '@/types/type';
import { DUMMY_WEIGHT_ENTRIES } from '@/constants';
import WeightAreaChart from '@/components/weight/WeightAreaChart';
import { useUser } from '@clerk/clerk-expo';
import { fetchAPI } from '@/lib/fetch';
import { format, parseISO } from 'date-fns';
import { router } from 'expo-router';




const Weight = () => {
  const { user: clerkUser } = useUser();
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const entries = [79.5, 78.8, 77.6, 76.8, 72, 71];
  // const currentWeight = entries[entries.length - 1];
  const [chartentries, setChartEntries] = useState<WeightEntry[]>(DUMMY_WEIGHT_ENTRIES)


  const [nextCheckpointWeight, setNextCheckpointWeight] = useState<number>(0);
  // Change these values to test
  // const startWeight = 80;
  // const goalWeight = 70;

  useEffect(() => {
    const fetchWeightData = async () => {
      if (!clerkUser) return;
      try {
        setLoading(true);
        const response = await fetchAPI(`/weights?clerkId=${clerkUser.id}`, {
          method: "GET",
        });
        const formattedData = response.data.map((entry: any) => ({
          weight: parseFloat(entry.weight),
          date: entry.logged_at,
        }));
        setWeightData(formattedData);
      } catch (error) {
        console.error("Failed to fetch weight data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWeightData();

  }, [clerkUser]);

  const { startWeight, goalWeight, currentWeight, radialChartEntries } = useMemo(() => {
    if (weightData.length === 0) {
      return { startWeight: 0, goalWeight: 0, currentWeight: 0, radialChartEntries: [] };
    }
    const goal = 60.0;
    const start = weightData[0].weight;
    const current = weightData[weightData.length - 1].weight;
    const entriesForRadial = weightData.map(e => e.weight);

    return { startWeight: start, goalWeight: goal, currentWeight: current, radialChartEntries: entriesForRadial };
  }, [weightData]);

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

  const checkpoints = 9;

  const handleTrackWeight = () => {
    router.push('/track-weight');
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
              {nextCheckpointWeight.toFixed(1)} kg
            </Text>
          </View>
        </View>
        {/* Radial Chart */}
        <RadialChart
          startWeight={startWeight}
          goalWeight={goalWeight}
          checkpoints={checkpoints}
          entries={entries}
          onNextCheckpointCalculated={setNextCheckpointWeight}
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
            <Text className="text-purple-400 text-sm font-benzinExtraBold">Set a Date</Text>
          </View>
        </View>

        {/* Track button */}
        <CustomButton title="Track Weight" onPress={handleTrackWeight} />
        {/* Entries */}
        <View className='flex flex-col mt-5'>
          <WeightAreaChart
            entries={chartentries}
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
    </SafeAreaView>
  );
};

export default Weight;
