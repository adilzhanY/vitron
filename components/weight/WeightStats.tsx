import { View, Text } from 'react-native'
import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '@/constants';

interface WeightStatsProps {
  bmi: string | number;
  nextCheckpoint: number;
}

const WeightStats: React.FC<WeightStatsProps> = ({bmi, nextCheckpoint}) => {
  return (
    <View className="flex-row justify-between items-center my-4">
      {/* BMI */}
      <View className="items-center">
        <View className="flex-row items-center">
          <Text className="text-gray-400 text-sm font-benzinMedium">BMI</Text>
          <FontAwesome5 name="weight" size={16} color={colors.black} style={{marginLeft: 6}} />
        </View>
        <Text className="text-black text-xl font-benzinBold">{bmi}</Text>
      </View>

      {/* Next Checkpoint*/}
      <View className="items-center">
        <View className="flex-row items-center">
          <Text className="text-gray-400 text-sm font-benzinMedium">Next</Text>
          <FontAwesome5 name="flag-checkered" size={16} color={colors.black} style={{marginLeft: 6}} />
        </View>
        <Text className="text-black text-xl font-benzinBold">
          {nextCheckpoint.toFixed(1)} kg
        </Text>
      </View>
    </View>
  );
};

export default WeightStats;
