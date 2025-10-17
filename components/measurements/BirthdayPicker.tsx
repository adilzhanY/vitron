import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Picker, { PickerItem } from "../shared/Picker";

interface BirthdayPickerProps {
  onDateChange: (date: { day: number; month: number; year: number }) => void;
  initialYear?: number;
  initialMonth?: number;
  initialDay?: number;
  enable3DEffect?: boolean;
}

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const BirthdayPicker: React.FC<BirthdayPickerProps> = ({
  onDateChange,
  initialYear = 1998,
  initialMonth = 1,
  initialDay = 1,
  enable3DEffect = false,
}) => {
  const [selectedDay, setSelectedDay] = React.useState(initialDay);
  const [selectedMonth, setSelectedMonth] = React.useState(initialMonth);
  const [selectedYear, setSelectedYear] = React.useState(initialYear);

  // Prepare data for pickers
  const dayData: PickerItem<number>[] = useMemo(
    () =>
      Array.from({ length: 31 }, (_, i) => ({
        value: i + 1,
        label: String(i + 1),
      })),
    [],
  );

  const monthData: PickerItem<number>[] = useMemo(
    () => [
      { value: 1, label: "Jan" },
      { value: 2, label: "Feb" },
      { value: 3, label: "Mar" },
      { value: 4, label: "Apr" },
      { value: 5, label: "May" },
      { value: 6, label: "Jun" },
      { value: 7, label: "Jul" },
      { value: 8, label: "Aug" },
      { value: 9, label: "Sep" },
      { value: 10, label: "Oct" },
      { value: 11, label: "Nov" },
      { value: 12, label: "Dec" },
    ],
    [],
  );

  const yearData: PickerItem<number>[] = useMemo(
    () =>
      Array.from({ length: 2017 - 1920 + 1 }, (_, i) => ({
        value: 1920 + i,
        label: String(1920 + i),
      })),
    [],
  );

  const handleDayChange = (value: number) => {
    setSelectedDay(value);
    onDateChange({
      day: value,
      month: selectedMonth,
      year: selectedYear,
    });
  };

  const handleMonthChange = (value: number) => {
    setSelectedMonth(value);
    onDateChange({
      day: selectedDay,
      month: value,
      year: selectedYear,
    });
  };

  const handleYearChange = (value: number) => {
    setSelectedYear(value);
    onDateChange({
      day: selectedDay,
      month: selectedMonth,
      year: value,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickersRow}>
        {/* Day Picker */}
        <View style={styles.pickerColumn}>
          <Picker
            data={dayData}
            selectedValue={selectedDay}
            onValueChange={handleDayChange}
            itemHeight={ITEM_HEIGHT}
            visibleItems={VISIBLE_ITEMS}
            enable3DEffect={enable3DEffect}
            showGradientMask={false}
            perspective={600}
            containerStyle={styles.picker}
            highlightStyle={styles.highlight}
            textStyle={styles.itemText}
            selectedTextStyle={styles.selectedItemText}
          />
        </View>

        {/* Month Picker */}
        <View style={styles.pickerColumn}>
          <Picker
            data={monthData}
            selectedValue={selectedMonth}
            onValueChange={handleMonthChange}
            itemHeight={ITEM_HEIGHT}
            visibleItems={VISIBLE_ITEMS}
            enable3DEffect={enable3DEffect}
            showGradientMask={false}
            perspective={600}
            containerStyle={styles.picker}
            highlightStyle={styles.highlight}
            textStyle={styles.monthText}
            selectedTextStyle={styles.selectedMonthText}
          />
        </View>

        {/* Year Picker */}
        <View style={styles.pickerColumn}>
          <Picker
            data={yearData}
            selectedValue={selectedYear}
            onValueChange={handleYearChange}
            itemHeight={ITEM_HEIGHT}
            visibleItems={VISIBLE_ITEMS}
            enable3DEffect={enable3DEffect}
            showGradientMask={false}
            perspective={600}
            containerStyle={styles.picker}
            highlightStyle={styles.highlight}
            textStyle={styles.itemText}
            selectedTextStyle={styles.selectedItemText}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    height: CONTAINER_HEIGHT,
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignSelf: "center",
    overflow: "hidden",
  },
  pickersRow: {
    flexDirection: "row",
    height: CONTAINER_HEIGHT,
  },
  pickerColumn: {
    flex: 1,
    height: CONTAINER_HEIGHT,
  },
  picker: {
    backgroundColor: "transparent",
  },
  highlight: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 10,
  },
  itemText: {
    fontSize: 22,
    color: "#9CA3AF",
    fontFamily: "Benzin-Bold",
    textAlign: "center",
  },
  selectedItemText: {
    fontSize: 26,
    color: "#000000",
    fontFamily: "Benzin-Bold",
    textAlign: "center",
  },
  monthText: {
    fontSize: 16,
    color: "#9CA3AF",
    fontFamily: "Benzin-Bold",
    textAlign: "center",
  },
  selectedMonthText: {
    fontSize: 18,
    color: "#000000",
    fontFamily: "Benzin-Bold",
    textAlign: "center",
  },
});

export default BirthdayPicker;
