import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import Svg, { Path, Defs, ClipPath, Rect as SvgRect } from "react-native-svg";

const AnimatedSvgRect = Animated.createAnimatedComponent(SvgRect);

interface WaterCardProps {
  waterConsumed: number;
  dailyGoal?: number;
  increment?: number;
  onAddWater: () => void;
}

const WaterCard: React.FC<WaterCardProps> = ({
  waterConsumed,
  dailyGoal = 2500,
  increment = 250,
  onAddWater,
}) => {
  // Calculate fill percentage (0 to 1)
  const fillPercentage = Math.min(waterConsumed / dailyGoal, 1);

  // Animated value for smooth filling
  const animatedFill = useRef(new Animated.Value(0)).current;

  // Animate when fillPercentage changes
  useEffect(() => {
    Animated.timing(animatedFill, {
      toValue: fillPercentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [fillPercentage]);

  // Interpolate animated value for y position and height
  const animatedY = animatedFill.interpolate({
    inputRange: [0, 1],
    outputRange: [90, 8], // 90 - 82 * 0 = 90, 90 - 82 * 1 = 8
  });

  const animatedHeight = animatedFill.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 82], // 82 * 0 = 0, 82 * 1 = 82
  });

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
            onPress={onAddWater}
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
              <AnimatedSvgRect
                x="10"
                y={animatedY}
                width="60"
                height={animatedHeight}
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
