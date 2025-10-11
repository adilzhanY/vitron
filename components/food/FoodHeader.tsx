import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface FoodHeaderProps {
  onSetFoodEntry: () => void;
  totalCalories: number;
}

const DAILY_GOAL = 2300;

const FoodHeader: React.FC<FoodHeaderProps> = ({ totalCalories, onSetFoodEntry }) => {
  const [showCaloriesLeft, setShowCaloriesLeft] = useState(false);
  const [containerWidth, setContainerWidth] = useState(160);

  const animated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: showCaloriesLeft ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [showCaloriesLeft, animated]);

  const caloriesLeft = Math.max(DAILY_GOAL - totalCalories, 0);
  const knobWidth = containerWidth / 2;
  const translateX = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [0, knobWidth],
  });

  return (
    <View className="mb-5">
      {/* Row with switch and button */}
      <View className="flex-row justify-between items-center mb-1">
        {/* Switch */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowCaloriesLeft((s) => !s)}
          style={{
            width: containerWidth,
            minWidth: 160,
            height: 40,
            backgroundColor: '#E5E7EB',
            borderRadius: 9999,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: knobWidth,
              height: '100%',
              borderRadius: 9999,
              backgroundColor: '#34D399',
              transform: [{ translateX }],
            }}
          />

          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text className="font-benzinBold"style={{ color: showCaloriesLeft ? '#6B7280' : '#FFFFFF' }}>
                Taken
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text className="font-benzinBold"style={{ color: showCaloriesLeft ? '#FFFFFF' : '#6B7280' }}>
                Left
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Button on top-right */}
        <TouchableOpacity onPress={onSetFoodEntry} className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center">
          <FontAwesome5 name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Calories Display */}
      <View className="flex flex-row w-full justify-start">
        <View className="flex flex-row justify-center items-center bg-white p-5 rounded-3xl">
          <Text className="text-4xl font-benzinBold text-black mr-2">
            {showCaloriesLeft ? caloriesLeft.toFixed(0) : totalCalories.toFixed(0)}
          </Text>
          <Text className="text-lg font-benzinBold text-gray-300">kcal</Text>
        </View>
      </View>
    </View>
  );
};

export default FoodHeader;

