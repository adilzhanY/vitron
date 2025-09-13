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
  const currentWeight = entries.length > 0 ? entries[0] : startWeight;
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
  const perCheckpoint = totalChangeNeeded / checkpoints;
  const checkpointAngles = [...Array(checkpoints)].map((_, i) => {
    const checkpointWeight = goal === 'lose weight'
      ? startWeight - (i + 1) * perCheckpoint
      : startWeight + (i + 1) * perCheckpoint;
    const checkpointProgress = ((i + 1) * perCheckpoint) / totalChangeNeeded;
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
  }, [currentWeight, checkpointAngles, goalWeight, goal])

  // Helper
  const polarToCartesian = (angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
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
