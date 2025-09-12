import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Dimensions, ScrollView } from 'react-native';
// import { WeightEntry } from '@/types/type';
import { FontAwesome } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Text as SvgText, Line, G } from 'react-native-svg';
import { format, parseISO } from 'date-fns';
import { WeightAreaChartProps, WeightEntry } from '@/types/type';


const createSplinePath = (points: { x: number; y: number }[]) => {
  if (points.length < 2) return '';

  const pathParts = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    // Calculate control points for a smooth curve
    const cp1x = (p1.x + p2.x) / 2;
    const cp1y = p1.y;
    const cp2x = (p1.x + p2.x) / 2;
    const cp2y = p2.y;

    if (i === 0) {
      pathParts.push(`M ${p1.x},${p1.y}`);
    }
    pathParts.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`);
  }
  return pathParts.join(' ');
};

const WeightAreaChart = ({ entries, setScrollEnabled }: WeightAreaChartProps) => {
  const [activeTab, setActiveTab] = useState('Weeks');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(entries.length - 1);
  const scrollViewRef = useRef<ScrollView>(null);

  const tabs = ['Days', 'Weeks', 'Months'];

  // Chart dimensions
  const { width: screenWidth } = Dimensions.get('window');
  const containerWidth = screenWidth - 32;
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 20, left: 20 };
  const pointSpacing = 50; // Horizontal spacing between points
  const chartWidth = pointSpacing * (entries.length - 1) + padding.left + padding.right

  // Data processing
  if (entries.length < 2) {
    return (
      <View style={{ height: chartHeight + padding.top + padding.bottom }}>
        <Text className="text-white text-center">Not enough data to display chart.</Text>
      </View>
    );
  }

  const weights = entries.map(e => e.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = maxWeight - minWeight === 0 ? 1 : maxWeight - minWeight;

  // Y-axis labels
  const yAxisLabels = [];
  const labelCount = 5;
  const step = (maxWeight - minWeight) / (labelCount - 1);
  for (let i = 0; i < labelCount; i++) {
    yAxisLabels.push(Math.round(minWeight + i * step));
  }

  // Map data points to SVG coordinates
  const getCoords = (entry: WeightEntry, index: number) => {
    const x = padding.left + (index / (entries.length - 1)) * (chartWidth - padding.left - padding.right);
    const y = (chartHeight + padding.top) - ((entry.weight - minWeight) / weightRange) * chartHeight;
    return { x, y };
  };

  const points = entries.map(getCoords);

  // Create SVG path for the line
  // const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const linePath = createSplinePath(points);

  // Create SVG path for the area
  const areaPath = `${linePath} L ${points[points.length - 1].x},${chartHeight + padding.top} L ${points[0].x},${chartHeight + padding.top} Z`;

  const selectedPoint = selectedPointIndex !== null ? points[selectedPointIndex] : null;
  const selectedEntry = selectedPointIndex !== null ? entries[selectedPointIndex] : null;

  const xAxisLabels = entries.reduce((acc, entry, index) => {
    const showNthLabel = entries.length > 15 ? 3 : 1;
    if (index % showNthLabel === 0) {
      acc.push({
        label: format(parseISO(entry.date), 'dd/MM'),
        x: points[index].x,
      });
    }
    return acc;
  }, [] as { label: string; x: number }[]);


  const lastPoint = points[points.length - 1];

  return (
    <View>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-xl font-benzinBold">Weight Progress</Text>
        <FontAwesome name="search" size={20} color="white" />
      </View>

      {/* Tabs */}
      <View className="flex-row bg-dark-blue-light rounded-full p-1 mb-4">
        {tabs.map(tab => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-full ${activeTab === tab ? 'bg-dark-blue-heavy' : ''}`}
          >
            <Text className="text-white text-center font-benzinMedium">{tab}</Text>
          </Pressable>
        ))}
      </View>
      {/* Tooltip */}
      <View className="h-12 items-center justify-center">
        {selectedEntry && (
          <View>
            <Text className="text-white text-2xl font-benzinBold text-center">
              {selectedEntry.weight.toFixed(1)} kg
            </Text>
            <Text className="text-gray-400 text-sm font-benzinMedium text-center">
              {format(parseISO(selectedEntry.date), 'eeee, d MMM yyyy')}
            </Text>
          </View>
        )}
      </View>


      {/* Chart */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ height: chartHeight + padding.top + padding.bottom, width: containerWidth }}
        contentContainerStyle={{ width: chartWidth }}
      // onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      // onTouchStart={() => setScrollEnabled && setScrollEnabled(false)}
      // onMomentumScrollEnd={() => setScrollEnabled && setScrollEnabled(true)}
      // onTouchEnd={() => setScrollEnabled && setScrollEnabled(true)}
      >
        <Svg width={chartWidth} height={chartHeight + padding.top + padding.bottom}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#A855F7" stopOpacity="0.4" />
              <Stop offset="1" stopColor="#A855F7" stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Y-Axis Labels and Grid Lines */}
          {yAxisLabels.map((label, i) => {
            const y = (chartHeight + padding.top) - ((label - minWeight) / weightRange) * chartHeight;
            return (
              <G key={i}>
                <Line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#3A3A5A"
                  strokeWidth="0.5"
                />
                <SvgText
                  x={chartWidth - padding.right + 4}
                  y={y + 4}
                  fill="gray"
                  fontSize="12"
                >
                  {label}
                </SvgText>
              </G>
            );
          })}

          {/* X-Axis Labels */}
          {xAxisLabels.map(({ label, x }, i) => (
            <SvgText
              key={i}
              x={x}
              y={chartHeight + padding.top + 20}
              fill="gray"
              fontSize="12"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          ))}

          {/* Area Path */}
          <Path d={areaPath} fill="url(#grad)" />

          {/* Line Path */}
          <Path d={linePath} stroke="#A855F7" strokeWidth="2" fill="none" />

          {/* Selected Point Circle */}
          {selectedPoint && (
            <>
              <Circle cx={selectedPoint.x} cy={selectedPoint.y} r="6" fill="#A855F7" />
              <Circle cx={selectedPoint.x} cy={selectedPoint.y} r="4" fill="white" />
            </>
          )}

          {/* Invisible touch points */}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="15"
              fill="rgba(0,0,0,0.02)"
              onPressIn={() => setSelectedPointIndex(index)}
            />
          ))}
        </Svg>
      </ScrollView>
    </View>
  );
};

export default WeightAreaChart;