import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import { colors } from "@/constants";

interface WaterCardProps {
  // in ml
  dailyGoal?: number;
  // in ml
  glassSize?: number;
}

const WaterCard: React.FC<WaterCardProps> = ({
  dailyGoal = 2500,
  glassSize = 250,
}) => {
  const [filledGlasses, setFilledGlasses] = useState<Set<number>>(new Set());

  const totalGlasses = 10;
  const totalConsumed = filledGlasses.size * glassSize;

  // Calculate progress for radial chart (0 to 1)
  const progress = filledGlasses.size / totalGlasses;

  // Radial chart properties
  const radius = 32;
  const strokeWidth = 8;
  const size = 80;
  const circumference = 2 * Math.PI * radius;
  const startAngle = 270; // Start from top

  const toggleGlass = (index: number) => {
    setFilledGlasses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        // If glass is already filled, unfill it
        newSet.delete(index);
      } else {
        // Fill the glass
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <View style={{ borderRadius: 50 }} className="bg-white p-5 mt-5">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-benzinBold text-gray-400">Water</Text>

        {/* Button with Radial Chart */}
        <View style={{ width: size, height: size, position: "relative" }}>
          {/* Radial Chart */}
          <Svg
            width={size}
            height={size}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            <G rotation={0} originX={size / 2} originY={size / 2}>
              {/* Background circle */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Progress arc */}
              {progress > 0 && (
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#3b82f6"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={(1 - progress) * circumference}
                  strokeLinecap="round"
                  rotation={startAngle}
                  originX={size / 2}
                  originY={size / 2}
                />
              )}
            </G>
          </Svg>

          {/* Plus button */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: (size - 64) / 2, // 64 is w-16 (16 * 4 = 64px)
              left: (size - 64) / 2,
              width: 64,
              height: 64,
              backgroundColor: "#3b82f6",
              borderRadius: 32,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesome5 name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Water Amount Display */}
      <View className="flex-row items-end mb-6">
        <Text className="text-4xl font-benzinBold text-gray-900">
          {totalConsumed}
        </Text>
        <Text className="text-2xl font-benzinBold text-gray-400 mb-2 ml-2">
          ml
        </Text>
      </View>

      {/* Water Glasses Grid */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        {Array.from({ length: totalGlasses }).map((_, index) => {
          const isFilled = filledGlasses.has(index);
          return (
            <TouchableOpacity
              key={index}
              onPress={() => toggleGlass(index)}
              className="items-center"
              style={{ width: 60 }}
            >
              {/* Water Drop */}
              <View className="relative" style={{ width: 56, height: 70 }}>
                <Svg width="56" height="70" viewBox="0 0 56 70">
                  {/* Water drop path */}
                  <Path
                    d="M 28 61.6 C 39.2 61.6 47.6 50.4 47.6 36.4 C 47.6 19.6 28 0 28 0 C 28 0 8.4 19.6 8.4 36.4 C 8.4 50.4 16.8 61.6 28 61.6 Z"
                    stroke={isFilled ? "#3b82f6" : "#e5e7eb"}
                    strokeWidth="3"
                    fill={isFilled ? "#3b82f6" : "none"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Plus icon for empty drops - horizontal line */}
                  {!isFilled && (
                    <>
                      <Rect
                        x="18.2"
                        y="29.4"
                        width="19.6"
                        height="3.36"
                        rx="0.84"
                        ry="0.84"
                        fill="#9CA3AF"
                      />
                      {/* Plus icon for empty drops - vertical line */}
                      <Rect
                        x="26.32"
                        y="21.28"
                        width="3.36"
                        height="19.6"
                        rx="0.84"
                        ry="0.84"
                        fill="#9CA3AF"
                      />
                    </>
                  )}

                  {/* Shine effect for filled drops */}
                  {isFilled && (
                    <Path
                      d="M 20 15 L 22 15 Q 22 25 20 30 Z"
                      fill="#ffffff"
                      opacity="0.25"
                    />
                  )}
                </Svg>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Daily Goal */}
      <View className="flex-row justify-between items-center pt-4 border-t border-gray-100">
        <Text className="text-lg font-benzinBold text-gray-400">
          Daily goal: {dailyGoal.toLocaleString()} ml
        </Text>
      </View>
    </View>
  );
};

export default WaterCard;
