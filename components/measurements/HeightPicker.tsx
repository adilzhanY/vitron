import React, { memo, useMemo, useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import Picker, { PickerItem } from "../shared/Picker";

interface HeightPickerProps {
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

const HeightPickerComponent: React.FC<HeightPickerProps> = ({
  onHeightChange,
  initialHeight,
  unitSystem,
}) => {
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

  const cmData: PickerItem<number>[] = useMemo(() => {
    const { min, max } = HEIGHT_LIMITS.cm;
    return Array.from({ length: max - min + 1 }, (_, i) => ({
      value: min + i,
      label: String(min + i),
    }));
  }, []);

  const feetData: PickerItem<number>[] = useMemo(() => {
    const { minFt, maxFt } = HEIGHT_LIMITS.ft;
    return Array.from({ length: maxFt - minFt + 1 }, (_, i) => ({
      value: minFt + i,
      label: String(minFt + i),
    }));
  }, []);

  const inchesData: PickerItem<number>[] = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: String(i),
    }));
  }, []);

  useEffect(() => {
    if (unit === "cm") {
      onHeightChange(heightCm, "cm");
    } else {
      const totalFeet = feet + inches / 12;
      onHeightChange(totalFeet, "ft");
    }
  }, [heightCm, feet, inches, unit, onHeightChange]);

  const handleCmChange = useCallback((value: number) => {
    setHeightCm(value);
  }, []);

  const handleFeetChange = useCallback((value: number) => {
    setFeet(value);
  }, []);

  const handleInchesChange = useCallback((value: number) => {
    setInches(value);
  }, []);

  if (unit === "cm") {
    return (
      <View style={styles.container}>
        <Text style={styles.heightDisplay}>{heightCm} cm</Text>

        <View style={styles.content}>
          <View style={styles.singlePickerColumn}>
            <Picker
              data={cmData}
              selectedValue={heightCm}
              onValueChange={handleCmChange}
              itemHeight={ITEM_HEIGHT}
              visibleItems={VISIBLE_ITEMS}
              enable3DEffect={false}
              showGradientMask={false}
              containerStyle={styles.picker}
              highlightStyle={styles.highlight}
              textStyle={styles.itemText}
              selectedTextStyle={styles.selectedItemText}
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
            <Picker
              data={feetData}
              selectedValue={feet}
              onValueChange={handleFeetChange}
              itemHeight={ITEM_HEIGHT}
              visibleItems={VISIBLE_ITEMS}
              enable3DEffect={false}
              showGradientMask={false}
              containerStyle={styles.picker}
              highlightStyle={styles.highlight}
              textStyle={styles.itemText}
              selectedTextStyle={styles.selectedItemText}
            />
          </View>

          <View style={styles.separatorContainer}>
            <Text style={styles.separator}>'</Text>
          </View>

          <View style={styles.inchesPickerColumn}>
            <Picker
              data={inchesData}
              selectedValue={inches}
              onValueChange={handleInchesChange}
              itemHeight={ITEM_HEIGHT}
              visibleItems={VISIBLE_ITEMS}
              enable3DEffect={false}
              showGradientMask={false}
              containerStyle={styles.picker}
              highlightStyle={styles.highlight}
              textStyle={styles.itemText}
              selectedTextStyle={styles.selectedItemText}
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
  selectedItemText: {
    fontSize: 24,
    color: "#000000",
    fontFamily: "Benzin-Bold",
    textAlign: "center",
  },
});

const arePropsEqual = (
  prev: HeightPickerProps,
  next: HeightPickerProps,
) => {
  return (
    prev.unitSystem === next.unitSystem &&
    prev.initialHeight === next.initialHeight &&
    prev.onHeightChange === next.onHeightChange
  );
};

export default memo(HeightPickerComponent, arePropsEqual);
