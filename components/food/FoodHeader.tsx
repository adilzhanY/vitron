import React, { useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface FoodHeaderProps {
  onSetFoodEntry: () => void;
  totalCalories: number;
  showCaloriesLeft: boolean;
  onToggleMode: () => void;
}

const DAILY_GOAL = 2300;

const FoodHeader: React.FC<FoodHeaderProps> = ({
  totalCalories,
  onSetFoodEntry,
  showCaloriesLeft,
  onToggleMode,
}) => {
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
    <View>
      {/* Row with switch and button */}
      <View className="flex-row justify-between items-center">
        {/* Switch */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onToggleMode}
          style={{
            width: containerWidth,
            minWidth: 160,
            height: 40,
            backgroundColor: "#E5E7EB",
            borderRadius: 9999,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: knobWidth,
              height: "100%",
              borderRadius: 9999,
              backgroundColor: "#62CB00",
              transform: [{ translateX }],
            }}
          />

          <View style={{ flex: 1, flexDirection: "row" }}>
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                className="font-interBold"
                style={{ color: showCaloriesLeft ? "#6B7280" : "#FFFFFF" }}
              >
                Taken
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                className="font-interBold"
                style={{ color: showCaloriesLeft ? "#FFFFFF" : "#6B7280" }}
              >
                Left
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Button on top-right */}
        <TouchableOpacity
          onPress={onSetFoodEntry}
          className="w-20 h-20 bg-primary rounded-full flex items-center justify-center"
        >
          <FontAwesome5 name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Calories Display */}
      <View className="flex flex-row w-full justify-center">
        <View className="flex flex-col justify-center items-center bg-white p-5 rounded-3xl">
          <Text className="text-5xl font-interBlack text-black">
            {showCaloriesLeft
              ? caloriesLeft.toFixed(0)
              : totalCalories.toFixed(0)}
          </Text>
          <Text className="text-sm font-interBold text-gray-400">
            {showCaloriesLeft ? "calories left" : "calories taken"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default FoodHeader;
