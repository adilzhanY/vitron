import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { RadialChartProps } from '@/types/type';
import Svg, { Circle, G, Line } from 'react-native-svg';

const RadialChart = ({
  startWeight,
  goalWeight,
  checkpoints,
  entries,
  onNextCheckpointCalculated
}: RadialChartProps) => {
  const radius = 90;
  const strokeWidth = 12;
  const checkpointRadius = 10;
  const size = (radius + checkpointRadius) * 2 + strokeWidth;

  // Progress calculation
  const currentWeight = entries[entries.length - 1];
  const totalLossNeeded = startWeight - goalWeight;
  const lost = startWeight - currentWeight;
  const progress = Math.min(lost / totalLossNeeded, 1);

  const startAngle = 270;

  // Checkpoints
  const perCheckpoint = totalLossNeeded / checkpoints;
  const checkpointAngles = [...Array(checkpoints)].map((_, i) => {
    const checkpointWeight = startWeight - (i + 1) * perCheckpoint;
    const checkpointProgress = ((i + 1) * perCheckpoint) / totalLossNeeded;
    const angle = startAngle + checkpointProgress * 360; // CCW
    return { angle, weight: checkpointWeight };
  });

  useEffect(() => {
    if (onNextCheckpointCalculated) {
      const nextCheckpoint = checkpointAngles.find(cp => currentWeight > cp.weight);
      // If all checkpoints are done, the next goal is the final goalWeight
      const nextWeight = nextCheckpoint ? nextCheckpoint.weight : goalWeight;
      onNextCheckpointCalculated(nextWeight);
    }
  }, [currentWeight, checkpointAngles, goalWeight])

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
            stroke="#3A3A5A"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress arc */}
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

          {/* Checkpoints */}
          {checkpointAngles.map(({ angle, weight }, idx) => {
            const { x, y } = polarToCartesian(angle);
            const isDone = currentWeight <= weight;

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
        <Text className="text-purple-300 text-sm font-benzinMedium">
          Progress {Math.round(progress * 100)}%
        </Text>
        <Text className="text-white text-3xl font-benzinBold">
          {currentWeight.toFixed(1)} kg
        </Text>
      </View>
    </View>
  );
}

export default RadialChart;
