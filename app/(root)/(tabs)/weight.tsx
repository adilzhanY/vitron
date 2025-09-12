import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useMemo, useState } from 'react';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/shared/CustomButton';
import RadialChart from '@/components/weight/RadialChart';
import { WeightEntry } from '@/types/type';
import { DUMMY_WEIGHT_ENTRIES } from '@/constants';
import WeightAreaChart from '@/components/weight/WeightAreaChart';



const Weight = () => {
  // Change these values to test
  const startWeight = 80;
  const goalWeight = 70;
  const checkpoints = 9;


  // Dummy weight entries (last 5 days).
  // Change these values to simulate progress.
  // Example: currently at 76 → near 2nd checkpoint.
  const entries = [79.5, 78.8, 77.6, 76.8, 72, 71];
  const currentWeight = entries[entries.length - 1];
  const [chartentries, setChartEntries] = useState<WeightEntry[]>(DUMMY_WEIGHT_ENTRIES)
  const [scrollEnabled, setScrollEnabled] = useState(true);


  const [nextCheckpointWeight, setNextCheckpointWeight] = useState<number>(0);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ padding: 16 }} scrollEnabled={scrollEnabled}>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          {/* <TouchableOpacity className="bg-[#3A3A5A] p-2.5 rounded-full">
            <FontAwesome5 name="crown" size={20} color="#A9A9A9" />
          </TouchableOpacity> */}
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
        <CustomButton title="Track Weight" onPress={() => { }} />
        {/* Entries */}
        <View className='flex flex-col mt-5'>
          <WeightAreaChart
            entries={chartentries}
            setScrollEnabled={setScrollEnabled}
          />
          <View className='h-[500px]'></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Weight;
