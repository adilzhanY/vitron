import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useMemo } from 'react';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, G, Line } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/shared/CustomButton';
import { RadialChartProps } from '@/types/type';
import RadialChart from '@/components/weight/RadialChart';
// import { styled } from 'nativewind';


const Weight = () => {
  // Change these values to test
  const startWeight = 80;
  const goalWeight = 70;
  const checkpoints = 9;

  // Dummy weight entries (last 5 days).
  // Change these values to simulate progress.
  // Example: currently at 76 → near 2nd checkpoint.
  const entries = [79.5, 78.8, 77.6, 76.8, 72];

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
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

        {/* Radial Chart with checkpoints */}
        <View className='w-full'>
          <RadialChart
            startWeight={startWeight}
            goalWeight={goalWeight}
            checkpoints={checkpoints}
            entries={entries}
          />

        </View>

        {/* Start & Goal */}
        <View className="flex-row justify-between mx-4 mb-6">
          <View>
            <Text className="text-gray-400 text-base font-benzinExtraBold">Start</Text>
            <Text className="text-white text-xl font-benzinExtraBold">{startWeight} kg</Text>
            <Text className="text-gray-400 text-sm font-benzinExtraBold">1 Sept 2025</Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-400 text-base font-benzinExtraBold">Goal</Text>
            <Text className="text-white text-xl font-benzinExtraBold">{goalWeight} kg</Text>
            <Text className="text-purple-400 text-sm font-benzinExtraBold">Set a Date</Text>
          </View>
        </View>

        {/* Track button */}
        <CustomButton title="Track Weight" onPress={() => { }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Weight;
