import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { RadialChartProps } from '@/types/type';
import Svg, { Circle, G, Line } from 'react-native-svg';
import CustomButton from '../shared/CustomButton';

const RadialChart = ({
  startWeight,
  goalWeight,
  checkpoints,
  entries,
  goal,
  onNextCheckpointCalculated,
  onSetNewGoal,
}: RadialChartProps) => {
  const radius = 90;
  const strokeWidth = 8;
  const checkpointRadius = 12;
  const size = (radius + checkpointRadius) * 2 + strokeWidth;

  // Progress calculation
  const currentWeight = entries.length > 0 ? entries[entries.length - 1] : startWeight;
  let totalChangeNeeded = 0;
  let changeAchieved = 0;


  if (goal === 'lose weight') {
    totalChangeNeeded = startWeight - goalWeight;
    changeAchieved = startWeight - currentWeight;
  } else if (goal === 'gain weight') {
    totalChangeNeeded = goalWeight - startWeight;
    changeAchieved = currentWeight - startWeight;
  }

  const progress = totalChangeNeeded > 0 ? Math.min(Math.max(changeAchieved / totalChangeNeeded, 0), 1) : 0;
  const isGoalAchieved = progress >= 1;
  const startAngle = 270;

  // Checkpoints
  // 10 totalChangeNeeded / 5 checkpoints = 2 perCheckpoint
  const perCheckpoint = totalChangeNeeded / checkpoints;
  const checkpointAngles = [...Array(checkpoints)].map((_, i) => {
    const checkpointWeight = goal === 'lose weight'
      // 80 - (0 + 1) * 2 = 78
      // 80 - (1 + 1) * 2 = 76
      ? startWeight - (i + 1) * perCheckpoint
      // 80 + (0 + 1) * 2 = 82
      // 80 + (1 + 1) * 2 = 84
      : startWeight + (i + 1) * perCheckpoint;
    // ((0 + 1) * 2) / 10 = 0.2 (20% progress)
    // ((1 + 1) * 2) / 10 = 0.4 (40% progress)
    const checkpointProgress = ((i + 1) * perCheckpoint) / totalChangeNeeded;
    // 270 + 0.2 * 360 = 342 - First checkpoint position on circle
    // 270 + 0.4 * 360 = 414 - Second checkpoint position on circle
    const angle = startAngle + checkpointProgress * 360; // CCW
    return { angle, weight: checkpointWeight };
  });

  useEffect(() => {
    if (onNextCheckpointCalculated && goal !== 'be fit') {
      const nextCheckpoint = checkpointAngles.find(cp =>
        goal === 'lose weight' ? currentWeight > cp.weight : currentWeight < cp.weight
      );
      // If all checkpoints are done, the next goal is the final goalWeight
      const nextWeight = nextCheckpoint ? nextCheckpoint.weight : goalWeight;
      onNextCheckpointCalculated(nextWeight);
    } else if (onNextCheckpointCalculated) {
      onNextCheckpointCalculated(currentWeight); // For 'be fit', next checkpoint is current weight
    }
  }, [currentWeight, checkpointAngles, checkpoints, goalWeight, goal])

  // Helper
  const polarToCartesian = (angleDeg: number) => {
    // Angle is 90
    // (90 * PI) / 180 = PI/2
    // Angle is 180
    // (190 * PI) / 180 = PI
    const angleRad = (angleDeg * Math.PI) / 180;
    // Angle = 0 (right side)
      // cos(0) = 1, sin(0) = 0
      // cx = 100 + 50 * 1 = 150
      // cy = 100 + 50 * 0 = 100
      // Point = (150, 100) -> right edge
    // Angle = 90 (bottom side)
      // cos(90) = 0, sin(90) = 1
      // cx = 100 + 50*0 = 100
      // cy = 100 + 50*1 = 150
      // Point = (100, 150) -> bottom edge
    const cx = size / 2 + radius * Math.cos(angleRad);
    const cy = size / 2 + radius * Math.sin(angleRad);
    return { x: cx, y: cy };
  };

  return (
    <View className="items-center my-6">
      <Svg width={size} height={size}>
        <G
          rotation={0}
          originX={size / 2}
          originY={size / 2}
          scaleX={-1} // mirror everything for CCW progress
        >
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isGoalAchieved ? "#22C55E" : "#3A3A5A"}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress arc */}
          {!isGoalAchieved && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#C084FC"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${2 * Math.PI * radius}`}
              strokeDashoffset={(1 - progress) * 2 * Math.PI * radius}
              strokeLinecap="round"
              rotation={startAngle}
              originX={size / 2}
              originY={size / 2}
            />
          )}

          {/* Checkpoints */}
          {!isGoalAchieved && goal !== 'be fit' && checkpointAngles.map(({ angle, weight }, idx) => {
            const { x, y } = polarToCartesian(angle);
            const isDone = goal === 'lose weight' ? currentWeight <= weight : currentWeight >= weight;

            return (
              <G key={idx}>
                {/* Dot */}
                <Circle
                  cx={x}
                  cy={y}
                  r={checkpointRadius}
                  fill={isDone ? "#4ade80" : "#A9A9A9"}
                />

                {/* Checkmark if done (double flip to fix ✓) */}
                {isDone && (
                  <G
                    x={x}
                    y={y}
                    scaleX={-1} // un-mirror only the checkmark
                  >
                    <Line
                      x1={-4}
                      y1={0}
                      x2={-1}
                      y2={4}
                      stroke="white"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <Line
                      x1={-1}
                      y1={4}
                      x2={5}
                      y2={-4}
                      stroke="white"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </G>
                )}
              </G>
            );
          })}
        </G>
      </Svg>

      {/* Chart Info */}
      <View className="items-center absolute top-[35%]">
        {isGoalAchieved ? (
          <>
            <Text className="text-white text-sm font-benzinBold text-center px-4">
              {'Congrats!\nYou achieved\nyour goal!'}
            </Text>

            <View className='h-4' />
            <CustomButton title="Set New Goal" onPress={onSetNewGoal} className='w-5' />
          </>
        ) : (
          <>
            <Text className="text-purple-300 text-sm font-benzinMedium">
              {goal === 'be fit' ? 'Current Weight' : `Progress ${Math.round(progress * 100)}%`}
            </Text>
            <Text className="text-white text-3xl font-benzinBold">
              {currentWeight.toFixed(1)} kg
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

export default RadialChart;
