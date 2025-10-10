import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  Easing,
  LayoutChangeEvent,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface FoodHeaderProps {
  selectedDate: Date;
  onDateChange: (newDate: Date) => void;
  totalCalories: number;
}

const DAILY_GOAL = 2300;

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const formatDate = (date: Date) => {
  if (isSameDay(date, new Date())) return 'Today';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const FoodHeader: React.FC<FoodHeaderProps> = ({
  selectedDate,
  onDateChange,
  totalCalories,
}) => {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [showCaloriesLeft, setShowCaloriesLeft] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(160);

  const animated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: showCaloriesLeft ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [showCaloriesLeft, animated]);

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setPickerVisible(Platform.OS === 'ios');
    if (date) onDateChange(date);
  };

  const onLayoutSwitch = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && w !== containerWidth) setContainerWidth(w);
  };

  const knobWidth = containerWidth / 2;
  const translateX = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [0, knobWidth],
  });

  const caloriesLeft = Math.max(DAILY_GOAL - totalCalories, 0);

  return (
    <View className="mb-5">
      {/* Date Selector */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-benzinBold text-gray-800">
          {formatDate(selectedDate)}
        </Text>
        <TouchableOpacity onPress={() => setPickerVisible(true)}>
          <Feather name="calendar" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Switch with centered labels */}
      <View className="flex-row justify-center mb-3">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowCaloriesLeft((s) => !s)}
          onLayout={onLayoutSwitch}
          style={{
            width: containerWidth,
            minWidth: 160,
            height: 40,
            backgroundColor: '#E5E7EB',
            borderRadius: 9999,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: knobWidth,
              height: '100%',
              borderRadius: 9999,
              backgroundColor: '#34D399',
              transform: [{ translateX }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.12,
              shadowRadius: 2,
              elevation: 2,
            }}
          />

          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text
                className="text-sm font-benzinBold"
                style={{ color: showCaloriesLeft ? '#6B7280' : '#FFFFFF' }}
              >
                Taken
              </Text>
            </View>

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text
                className="text-sm font-benzinBold"
                style={{ color: showCaloriesLeft ? '#FFFFFF' : '#6B7280' }}
              >
                Left
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Calories Display */}
      <View className="items-center mt-5">
        <Text className="text-4xl font-benzinBold text-gray-900">
          {showCaloriesLeft ? caloriesLeft.toFixed(0) : totalCalories.toFixed(0)}
        </Text>
        <Text className="text-lg font-benzinBold text-gray-500">kcal</Text>
      </View>

      {/* Date Picker */}
      {isPickerVisible && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

export default FoodHeader;

