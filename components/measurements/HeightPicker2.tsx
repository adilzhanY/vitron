import React, { memo, useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import Picker2, { PickerItem } from "../shared/Picker2";

interface HeightPicker2Props {
  onHeightChange: (height: number, unit: "cm" | "ft") => void;
  initialHeight?: number;
  unitSystem: "metric" | "imperial";
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

type HeightUnit = "cm" | "ft";

const HEIGHT_LIMITS = {
  cm: { min: 100, max: 250 },
  ft: { minFt: 3, maxFt: 8, minIn: 0, maxIn: 11 },
};

// Pre-generate data outside component to avoid recreation
const CM_DATA = Array.from(
  { length: HEIGHT_LIMITS.cm.max - HEIGHT_LIMITS.cm.min + 1 },
  (_, i) => ({
    value: HEIGHT_LIMITS.cm.min + i,
    label: String(HEIGHT_LIMITS.cm.min + i),
  })
);

const FEET_DATA = Array.from(
  { length: HEIGHT_LIMITS.ft.maxFt - HEIGHT_LIMITS.ft.minFt + 1 },
  (_, i) => ({
    value: HEIGHT_LIMITS.ft.minFt + i,
    label: String(HEIGHT_LIMITS.ft.minFt + i),
  })
);

const INCHES_DATA = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: String(i),
}));

const HeightPicker2Component: React.FC<HeightPicker2Props> = ({
  onHeightChange,
  initialHeight,
  unitSystem,
}) => {
  console.log("📏 [HeightPicker2] Component MOUNTING/RENDERING");

  const unit: HeightUnit = unitSystem === "metric" ? "cm" : "ft";

  const [heightCm, setHeightCm] = useState<number>(() => {
    if (initialHeight && unit === "cm") return initialHeight;
    return HEIGHT_LIMITS.cm.min;
  });

  const [feet, setFeet] = useState<number>(() => {
    if (initialHeight && unit === "ft") {
      const totalInches = initialHeight * 12;
      return Math.floor(totalInches / 12);
    }
    return HEIGHT_LIMITS.ft.minFt;
  });

  const [inches, setInches] = useState<number>(() => {
    if (initialHeight && unit === "ft") {
      const totalInches = initialHeight * 12;
      return Math.round(totalInches % 12);
    }
    return 3;
  });

  // Use pre-generated data
  const cmData = CM_DATA;
  const feetData = FEET_DATA;
  const inchesData = INCHES_DATA;

  useEffect(() => {
    if (unit === "cm") {
      onHeightChange(heightCm, "cm");
    } else {
      const totalFeet = feet + inches / 12;
      onHeightChange(totalFeet, "ft");
    }
  }, [heightCm, feet, inches, unit, onHeightChange]);

  const handleCmChange = useCallback((item: PickerItem<number>) => {
    setHeightCm(item.value);
  }, []);

  const handleFeetChange = useCallback((item: PickerItem<number>) => {
    setFeet(item.value);
  }, []);

  const handleInchesChange = useCallback((item: PickerItem<number>) => {
    setInches(item.value);
  }, []);

  if (unit === "cm") {
    return (
      <View style={styles.container}>
        <Text style={styles.heightDisplay}>{heightCm} cm</Text>

        <View style={styles.content}>
          <View style={styles.singlePickerColumn}>
            <Picker2
              data={cmData}
              value={heightCm}
              onValueChanged={handleCmChange}
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
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heightDisplay}>
        {feet}' {inches}"
      </Text>

      <View style={styles.content}>
        <View style={styles.pickersSection}>
          <View style={styles.feetPickerColumn}>
            <Picker2
              data={feetData}
              value={feet}
              onValueChanged={handleFeetChange}
              itemHeight={ITEM_HEIGHT}
              visibleItemCount={VISIBLE_ITEMS}
              enableScrollByTapOnItem={true}
              containerStyle={styles.picker}
              itemTextStyle={styles.itemText}
              overlayItemStyle={styles.highlight}
            />
          </View>

          <View style={styles.separatorContainer}>
            <Text style={styles.separator}>'</Text>
          </View>

          <View style={styles.inchesPickerColumn}>
            <Picker2
              data={inchesData}
              value={inches}
              onValueChanged={handleInchesChange}
              itemHeight={ITEM_HEIGHT}
              visibleItemCount={VISIBLE_ITEMS}
              enableScrollByTapOnItem={true}
              containerStyle={styles.picker}
              itemTextStyle={styles.itemText}
              overlayItemStyle={styles.highlight}
            />
          </View>

          <View style={styles.inchSymbolContainer}>
            <Text style={styles.separator}>"</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  heightDisplay: {
    fontSize: 36,
    fontFamily: "Benzin-Bold",
    color: "#000000",
    marginBottom: 20,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  singlePickerColumn: {
    width: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  pickersSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  feetPickerColumn: {
    width: 60,
  },
  separatorContainer: {
    width: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    fontSize: 32,
    fontFamily: "Benzin-Bold",
    color: "#000000",
    marginBottom: 10,
  },
  inchesPickerColumn: {
    width: 60,
  },
  inchSymbolContainer: {
    width: 20,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 18,
    color: "#9CA3AF",
    fontFamily: "Benzin-Bold",
    textAlign: "center",
  },
});

const arePropsEqual = (
  prev: HeightPicker2Props,
  next: HeightPicker2Props,
) => {
  return (
    prev.unitSystem === next.unitSystem &&
    prev.initialHeight === next.initialHeight &&
    prev.onHeightChange === next.onHeightChange
  );
};

export default memo(HeightPicker2Component, arePropsEqual);
