import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Picker2, { PickerItem } from "../shared/Picker2";

interface BirthdayPicker2Props {
  onDateChange: (date: { day: number; month: number; year: number }) => void;
  initialYear?: number;
  initialMonth?: number;
  initialDay?: number;
}

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const BirthdayPicker2: React.FC<BirthdayPicker2Props> = ({
  onDateChange,
  initialYear = 1998,
  initialMonth = 1,
  initialDay = 1,
}) => {
  console.log("🎂 [BirthdayPicker2] Component MOUNTING/RENDERING");

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

  const handleDayChange = (item: PickerItem<number>) => {
    setSelectedDay(item.value);
    onDateChange({
      day: item.value,
      month: selectedMonth,
      year: selectedYear,
    });
  };

  const handleMonthChange = (item: PickerItem<number>) => {
    setSelectedMonth(item.value);
    onDateChange({
      day: selectedDay,
      month: item.value,
      year: selectedYear,
    });
  };

  const handleYearChange = (item: PickerItem<number>) => {
    setSelectedYear(item.value);
    onDateChange({
      day: selectedDay,
      month: selectedMonth,
      year: item.value,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickersRow}>
        {/* Day Picker */}
        <View style={styles.pickerColumn}>
          <Picker2
            data={dayData}
            value={selectedDay}
            onValueChanged={handleDayChange}
            itemHeight={ITEM_HEIGHT}
            visibleItemCount={VISIBLE_ITEMS}
            enableScrollByTapOnItem={true}
            containerStyle={styles.picker}
            itemTextStyle={styles.itemText}
            overlayItemStyle={styles.highlight}
          />
        </View>

        {/* Month Picker */}
        <View style={styles.pickerColumn}>
          <Picker2
            data={monthData}
            value={selectedMonth}
            onValueChanged={handleMonthChange}
            itemHeight={ITEM_HEIGHT}
            visibleItemCount={VISIBLE_ITEMS}
            enableScrollByTapOnItem={true}
            containerStyle={styles.picker}
            itemTextStyle={styles.monthText}
            overlayItemStyle={styles.highlight}
          />
        </View>

        {/* Year Picker */}
        <View style={styles.pickerColumn}>
          <Picker2
            data={yearData}
            value={selectedYear}
            onValueChanged={handleYearChange}
            itemHeight={ITEM_HEIGHT}
            visibleItemCount={VISIBLE_ITEMS}
            enableScrollByTapOnItem={true}
            containerStyle={styles.picker}
            itemTextStyle={styles.itemText}
            overlayItemStyle={styles.highlight}
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
  monthText: {
    fontSize: 16,
    color: "#9CA3AF",
    fontFamily: "Benzin-Bold",
    textAlign: "center",
  },
});

export default BirthdayPicker2;
