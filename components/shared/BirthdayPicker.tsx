import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface BirthdayPickerProps {
  onDateChange: (date: { day: number; month: number; year: number }) => void;
  initialYear?: number;
  initialMonth?: number;
  initialDay?: number;
}

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const BirthdayPicker: React.FC<BirthdayPickerProps> = ({
  onDateChange,
  initialYear = 1998,
  initialMonth = 1,
  initialDay = 1,
}) => {
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);

  const dayScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = Array.from({ length: 2017 - 1900 + 1 }, (_, i) => 1900 + i);

  const handleScroll = useCallback(
    (
      event: NativeSyntheticEvent<NativeScrollEvent>,
      items: number[],
      setSelected: (value: number) => void,
      type: 'day' | 'month' | 'year'
    ) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const selectedValue = items[index];

      if (selectedValue !== undefined) {
        setSelected(selectedValue);

        // Notify parent component
        const newDate = {
          day: type === 'day' ? selectedValue : selectedDay,
          month: type === 'month' ? selectedValue : selectedMonth,
          year: type === 'year' ? selectedValue : selectedYear,
        };
        onDateChange(newDate);
      }
    },
    [selectedDay, selectedMonth, selectedYear, onDateChange]
  );

  const handleMomentumScrollEnd = useCallback(
    (
      event: NativeSyntheticEvent<NativeScrollEvent>,
      items: number[],
      scrollRef: React.RefObject<ScrollView | null>
    ) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);

      // Snap to nearest item
      scrollRef.current?.scrollTo({
        y: index * ITEM_HEIGHT,
        animated: true,
      });
    },
    []
  );

  const renderItem = (item: number | string, index: number, selectedValue: number, isMonth: boolean = false) => {
    const isSelected = isMonth ? index + 1 === selectedValue : item === selectedValue;

    return (
      <View key={index} style={styles.itemContainer}>
        <Text
          style={[
            isMonth ? styles.monthText : styles.itemText,
            isSelected && (isMonth ? styles.selectedMonthText : styles.selectedItemText),
          ]}
        >
          {isMonth ? String(item).slice(0, 3) : item}
        </Text>
      </View>
    );
  };

  const renderScrollPicker = (
    items: (number | string)[],
    selectedValue: number,
    setSelected: (value: number) => void,
    scrollRef: React.RefObject<ScrollView | null>,
    type: 'day' | 'month' | 'year',
    isMonth: boolean = false
  ) => {
    return (
      <View style={styles.pickerColumn}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onScroll={(e) => handleScroll(e, items as number[], setSelected, type)}
          onMomentumScrollEnd={(e) => handleMomentumScrollEnd(e, items as number[], scrollRef)}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
          bounces={true}
        >
          {/* Top padding */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />

          {/* Items */}
          {items.map((item, index) => renderItem(item, index, selectedValue, isMonth))}

          {/* Bottom padding */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
        </ScrollView>
      </View>
    );
  };

  // Initialize scroll positions
  React.useEffect(() => {
    const timer = setTimeout(() => {
      dayScrollRef.current?.scrollTo({
        y: (initialDay - 1) * ITEM_HEIGHT,
        animated: false,
      });
      monthScrollRef.current?.scrollTo({
        y: (initialMonth - 1) * ITEM_HEIGHT,
        animated: false,
      });
      yearScrollRef.current?.scrollTo({
        y: (initialYear - 1900) * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Highlight bar */}
      <View style={styles.highlightBar} pointerEvents="none" />

      <View style={styles.pickersRow}>
        {/* Day Picker */}
        {renderScrollPicker(days, selectedDay, setSelectedDay, dayScrollRef, 'day')}

        {/* Month Picker */}
        {renderScrollPicker(months, selectedMonth, setSelectedMonth, monthScrollRef, 'month', true)}

        {/* Year Picker */}
        {renderScrollPicker(years, selectedYear, setSelectedYear, yearScrollRef, 'year')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: CONTAINER_HEIGHT,
    marginTop: 20,
    backgroundColor: '#1F2937',
    borderRadius: 10,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  pickersRow: {
    flexDirection: 'row',
    height: CONTAINER_HEIGHT,
  },
  pickerColumn: {
    flex: 1,
    height: CONTAINER_HEIGHT,
  },
  scrollContent: {
    paddingVertical: 0,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 22,
    color: '#9CA3AF',
    fontFamily: 'Benzin-Bold',
    textAlign: 'center',
  },
  selectedItemText: {
    fontSize: 26,
    color: '#FFFFFF',
    fontFamily: 'Benzin-Bold',
    textAlign: 'center',
  },
  monthText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Benzin-Bold',
    textAlign: 'center',
  },
  selectedMonthText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Benzin-Bold',
    textAlign: 'center',
  },
  highlightBar: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: ITEM_HEIGHT,
    marginTop: -ITEM_HEIGHT / 2,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#4A5568',
    borderRadius: 10,
    zIndex: 1,
  },
});

export default BirthdayPicker;
