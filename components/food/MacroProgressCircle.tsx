import { View, Text } from 'react-native';
import React, { useEffect, useRef } from 'react';
import Svg, { Circle, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface MacroProgressCircleProps {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
  label: string;
  current: number;
  goal: number;
  unit?: string;
}

const MacroProgressCircle: React.FC<MacroProgressCircleProps> = ({
  icon,
  color,
  backgroundColor,
  label,
  current,
  goal,
  unit = 'g',
}) => {
  const radius = 40;
  const strokeWidth = 8;
  const size = radius * 2 + strokeWidth * 2;

  // Animated value for progress
  const animatedProgress = useSharedValue(0);

  // Ensure current and goal are valid numbers
  const safeCurrentValue = Number(current) || 0;
  const safeGoalValue = Number(goal) || 1; // Use 1 to avoid division by zero

  // Calculate progress, ensuring it doesn't exceed 100%
  const progress = safeGoalValue > 0
    ? Math.min(safeCurrentValue / safeGoalValue, 1)
    : 0;

  const startAngle = 270;
  const circumference = 2 * Math.PI * radius;

  // Animate on mount or when progress changes
  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  // Animated props for the progress circle
  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = (1 - animatedProgress.value) * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View className="items-center">
      {/* Radial Chart */}
      <View style={{ width: size, height: size, position: 'relative' }}>
        <Svg width={size} height={size}>
          <G rotation={0} originX={size / 2} originY={size / 2} scaleX={-1}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={backgroundColor}
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Progress arc */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference}`}
              animatedProps={animatedProps}
              strokeLinecap="round"
              rotation={startAngle}
              originX={size / 2}
              originY={size / 2}
            />
          </G>
        </Svg>

        {/* Icon in center */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={36} color={color} />
        </View>
      </View>

      {/* Label and values */}
      <View className="items-center mt-1">
        <Text className="text-xl font-benzinBold text-black">
          {safeCurrentValue.toFixed(0)}{unit}
        </Text>
        <Text className="text-xs font-benzinMedium text-gray-400">{label}</Text>
      </View>
    </View>
  );
};

export default MacroProgressCircle;
