import { View, Text } from "react-native";
import React from "react";

interface MacroProgressBarProps {
  label: string;
  current: number;
  goal: number;
  color: string;
  unit?: string;
}

const MacroProgressBar: React.FC<MacroProgressBarProps> = ({
  label,
  current,
  goal,
  color,
  unit = "g",
}) => {
  // Ensure current and goal are valid numbers
  const safeCurrentValue = Number(current) || 0;
  const safeGoalValue = Number(goal) || 1; // Use 1 to avoid division by zero

  // Calculate progress, ensuring it doesn't exceed 100%
  const progressPercentage =
    safeGoalValue > 0
      ? Math.min((safeCurrentValue / safeGoalValue) * 100, 100)
      : 0;

  return (
    <View className="mb-4">
      {/* Labels */}
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-sm font-benzinBold text-gray-800">{label}</Text>
        <Text className="text-sm font-benzinBold text-gray-600">
          {safeCurrentValue.toFixed(0)} / {safeGoalValue.toFixed(0)} {unit}
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="h-3 bg-gray-200 rounded-full">
        <View
          className={`h-full rounded-full ${color}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </View>
    </View>
  );
};

export default MacroProgressBar;
