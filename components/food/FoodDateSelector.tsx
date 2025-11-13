import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';

interface FoodDateSelectorProps {
  selectedDate: Date;
  onDateChange: (newDate: Date) => void;
}

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

const FoodDateSelector: React.FC<FoodDateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const [isPickerVisible, setPickerVisible] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setPickerVisible(Platform.OS === 'ios');
    if (date) onDateChange(date);
  };

  return (
    <View className="mb-2 self-start">
      <View style={{borderRadius: 50}} className="flex-row bg-white px-3 py-2">
        <Text className="text-lg font-interExtraBold text-gray-800 mr-2">
          {formatDate(selectedDate)}
        </Text>
        <TouchableOpacity onPress={() => setPickerVisible(true)}>
          <Feather name="calendar" size={24} color="#333" />
        </TouchableOpacity>
      </View>

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

export default FoodDateSelector;

