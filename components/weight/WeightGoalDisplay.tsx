import { View, Text } from 'react-native'
import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import CustomButton from '@/components/shared/CustomButton';
import { colors } from '@/constants';

interface WeightGoalDisplayProps {
  startWeight: number;
  goalWeight: number;
  startDate: string;
  onSetGoal: () => void;
}

const WeightGoalDisplay: React.FC<WeightGoalDisplayProps> = ({
  startWeight,
  goalWeight,
  startDate,
  onSetGoal,
}) => {
  return (
    <View className="flex-row justify-between mx-4 my-6">
      {/* Start Weight */}
      <View>
        <View className="flex-row items-center">
          <Text className="text-gray-400 text-base font-benzinExtraBold">Start</Text>
          <FontAwesome5 name="rocket" size={16} color={colors.black} style={{marginLeft: 6}} />
        </View>
        <Text className="text-black text-xl font-benzinExtraBold">{startWeight.toFixed(1)} kg</Text>
        <Text className="text-gray-400 text-sm font-benzinExtraBold">{startDate}</Text>
      </View>

      {/* Goal weight */}
      <View className="items-end">
        <View className="flex-row items-center">
          <Text className="text-gray-400 text-base font-benzinExtraBold">
            Goal
          </Text>
          <FontAwesome5 name="trophy" size={16} color={colors.black} style={{marginLeft: 6}} />
        </View>
        <Text className="text-black text-xl font-benzinExtraBold">{goalWeight.toFixed(1)} kg</Text>
        <CustomButton
          title="Set Goal"
          onPress={onSetGoal}
          className="px-4 py-1 mt-1"
        />
      </View>
    </View>
  );
};

export default WeightGoalDisplay;
