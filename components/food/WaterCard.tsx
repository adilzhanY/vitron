import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Svg, { Path, Defs, ClipPath, Rect as SvgRect } from "react-native-svg";

interface WaterCardProps {
  // in ml
  dailyGoal?: number;
  // in ml
  increment?: number;
}

const WaterCard: React.FC<WaterCardProps> = ({
  dailyGoal = 2500,
  increment = 250,
}) => {
  const [waterConsumed, setWaterConsumed] = useState(0);

  // Calculate fill percentage (0 to 1)
  const fillPercentage = Math.min(waterConsumed / dailyGoal, 1);

  const addWater = () => {
    setWaterConsumed((prev) => Math.min(prev + increment, dailyGoal));
  };

  return (
    <View style={{ borderRadius: 24 }} className="bg-white p-6 mt-5">
      <View className="flex-row items-center justify-between">
        {/* Left side - Title, consumption, and button */}
        <View className="flex-1">
          {/* Water title */}
          <Text className="text-xl font-benzinBold text-gray-400 mb-3">
            Water
          </Text>

          {/* Water consumption display */}
          <Text className="text-2xl font-benzinBold text-gray-800 mb-3">
            <Text>{waterConsumed}</Text>
            /
            <Text className="text-gray-400">{dailyGoal} ml</Text>
          </Text>

          {/* Add button */}
          <TouchableOpacity
            onPress={addWater}
            disabled={waterConsumed >= dailyGoal}
            className="bg-gray-100 px-4 py-2 rounded-xl flex-row items-center self-start"
            style={{ opacity: waterConsumed >= dailyGoal ? 0.5 : 1 }}
          >
            <Text className="text-base font-benzinBold text-gray-800">
              Add {increment} ml
            </Text>
            <Text className="text-2xl font-benzinBold text-gray-800 ml-2">
              +
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right side - Water drop visualization */}
        <View style={{ width: 80, height: 100 }}>
          <Svg width="80" height="100" viewBox="0 0 80 100">
            <Defs>
              {/* Clip path for the water drop shape with rounded top */}
              <ClipPath id="dropClip">
                <Path d="M 40 90 C 56 90 68 75 68 55 C 68 35 40 8 40 8 C 40 8 12 35 12 55 C 12 75 24 90 40 90 Z" />
              </ClipPath>
            </Defs>

            {/* Filled water (clipped to drop shape) */}
            {fillPercentage > 0 && (
              <SvgRect
                x="10"
                y={90 - 82 * fillPercentage}
                width="60"
                height={82 * fillPercentage}
                fill="#60A5FA"
                clipPath="url(#dropClip)"
              />
            )}

            {/* Shine effect on filled water */}
            {fillPercentage > 0.15 && (
              <Path
                d="M 30 18 L 34 18 Q 34 32 30 42 Z"
                fill="#ffffff"
                opacity="0.4"
                clipPath="url(#dropClip)"
              />
            )}

            {/* Outline of water drop with rounded top */}
            <Path
              d="M 40 90 C 56 90 68 75 68 55 C 68 35 40 8 40 8 C 40 8 12 35 12 55 C 12 75 24 90 40 90 Z"
              stroke="#9CA3AF"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </View>
    </View>
  );
};

export default WaterCard;
