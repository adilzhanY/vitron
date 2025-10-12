import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScrollPicker from 'react-native-wheel-scrollview-picker';

interface BirthdayPickerProps {
  onDateChange: (date: { day: number; month: number; year: number }) => void;
  initialYear?: number;
  initialMonth?: number;
  initialDay?: number;
}

const years = Array.from({ length: 2017 - 1900 + 1 }, (_, i) => (1900 + i).toString());
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

const BirthdayPicker: React.FC<BirthdayPickerProps> = ({
  onDateChange,
  initialYear = 1998,
  initialMonth = 1,
  initialDay = 1,
}) => {
  const [selectedYear, setSelectedYear] = React.useState(initialYear);
  const [selectedMonth, setSelectedMonth] = React.useState(initialMonth);
  const [selectedDay, setSelectedDay] = React.useState(initialDay);

  React.useEffect(() => {
    onDateChange({
      day: selectedDay,
      month: selectedMonth,
      year: selectedYear,
    });
  }, [selectedDay, selectedMonth, selectedYear, onDateChange]);

  return (
    <View style={styles.container}>
      {/* Highlight bar */}
      <View style={styles.highlightBar} />
      
      {/* Day Picker */}
      <View style={styles.pickerContainer}>
        <ScrollPicker
          dataSource={days}
          selectedIndex={initialDay - 1}
          onValueChange={(data) => {
            const newDay = parseInt(data, 10);
            setSelectedDay(newDay);
            onDateChange({day: newDay, month: selectedMonth, year: selectedYear});
          }}
          wrapperHeight={240}
          wrapperBackground="#00000000" 
          itemHeight={60}
          highlightColor="#B957FF"
          highlightBorderWidth={2}
          renderItem={(data, index, isSelected) => (
            <Text style={isSelected ? styles.selectedItemText : styles.itemText}>{data}</Text>
          )}
        />
      </View>

      {/* Month Picker */}
      <View style={styles.pickerContainer}>
        <ScrollPicker
          dataSource={months}
          selectedIndex={initialMonth - 1}
          onValueChange={(data) => {
            const newMonth = parseInt(data, 10);
            setSelectedMonth(newMonth);
            onDateChange({day: selectedDay, month: newMonth, year: selectedYear});
          }}
          wrapperHeight={240}
          wrapperBackground="#00000000"
          itemHeight={60}
          highlightColor="#B957FF"
          highlightBorderWidth={2}
          renderItem={(data, index, isSelected) => (
            <Text style={isSelected ? styles.selectedItemText : styles.itemText}>{data}</Text>
          )}
        />
      </View>

      {/* Year Picker */}
      <View style={styles.pickerContainer}>
        <ScrollPicker
          dataSource={years}
          selectedIndex={years.indexOf(initialYear.toString())}
          onValueChange={(data) => {
            const newYear = parseInt(data, 10);
            setSelectedYear(newYear);
            onDateChange({day: selectedDay, month: selectedMonth, year: newYear});
          }}
          wrapperHeight={240}
          wrapperBackground="#00000000"
          itemHeight={60}
          highlightColor="#B957FF"
          highlightBorderWidth={2}
          renderItem={(data, index, isSelected) => (
            <Text style={isSelected ? styles.selectedItemText : styles.itemText}>{data}</Text>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 240,
    marginTop: 20,
    backgroundColor: '#1F2937',
    borderRadius: 10,
  },
  pickerContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 22,
    color: '#9CA3AF',
    fontFamily: 'benzin',
    textAlign: 'center',
  },
  selectedItemText: {
    fontSize: 26,
    color: 'white',
    fontFamily: 'benzinBold',
    textAlign: 'center',
  },
  highlightBar: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: 60,
    marginTop: -30, 
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#4A5568',
    borderRadius: 10,
  },
});

export default BirthdayPicker;
