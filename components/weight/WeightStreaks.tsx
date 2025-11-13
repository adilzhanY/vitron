import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface WeightStreaksProps {
  activeStreak: number;
  longestStreak: number;
}

const WeightStreaks: React.FC<WeightStreaksProps> = ({ activeStreak, longestStreak }) => {
  return (
    <View className="flex-row gap-2 px-2 mt-4">
      {/* Active Streak */}
      <View className="flex-1 bg-white border border-yellow-400 rounded-2xl p-4 shadow">
        <Text className="text-yellow-400 text-sm font-interExtraBold">Active Streak</Text>
        <View className="flex-row items-center">
          <Text className="text-black text-3xl font-interBold mt-2">{activeStreak}</Text>
          <FontAwesome5 name="fire" size={24} color="#facc15" style={{ marginLeft: 8 }} />
        </View>
        <Text className="text-gray-300 text-sm mt-1 font-interBold">days in a row</Text>
      </View>

      {/* Longest Streak */}
      <View className="flex-1 bg-white border border-yellow-400 rounded-2xl p-4 shadow">
        <Text className="text-yellow-400 text-sm font-interExtraBold">Longest Streak</Text>
        <View className="flex-row items-center">
          <Text className="text-black text-3xl font-interBold mt-2">{longestStreak}</Text>
          <FontAwesome5 name="star" size={24} solid color="#fde047" style={{ marginLeft: 8 }} />
        </View>
        <Text className="text-gray-300 text-sm mt-1 font-interBold">best record</Text>
      </View>
    </View>
  );
};

export default WeightStreaks;

