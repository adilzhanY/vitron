import React, { memo, useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import Picker, { PickerItem } from "../shared/Picker";

interface WeightPickerProps {
  onWeightChange: (weight: number, unit: "kg" | "lb") => void;
  initialWeight?: number;
  unitSystem: "metric" | "imperial";
  // Performance optimization props
  enable3DEffect?: boolean;
  showGradientMask?: boolean;
  enableDecayAnimation?: boolean;
  enableSpringAnimation?: boolean;
  enableOpacityAnimation?: boolean;
  enableFontSizeAnimation?: boolean;
  disableAllAnimations?: boolean;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

type WeightUnit = "kg" | "lb";

const WEIGHT_LIMITS = {
  kg: { min: 20, max: 250, step: 0.1 },
  lb: { min: 45, max: 550, step: 0.1 },
} as const;

// Pre-generate data outside component to avoid recreation
const WEIGHT_DATA_KG = Array.from(
  { length: WEIGHT_LIMITS.kg.max - WEIGHT_LIMITS.kg.min + 1 },
  (_, i) => ({
    value: WEIGHT_LIMITS.kg.min + i,
    label: String(WEIGHT_LIMITS.kg.min + i),
  })
);

const WEIGHT_DATA_LB = Array.from(
  { length: WEIGHT_LIMITS.lb.max - WEIGHT_LIMITS.lb.min + 1 },
  (_, i) => ({
    value: WEIGHT_LIMITS.lb.min + i,
    label: String(WEIGHT_LIMITS.lb.min + i),
  })
);

const DECIMAL_DATA = Array.from({ length: 10 }, (_, i) => ({
  value: i,
  label: String(i),
}));

const WeightPickerComponent: React.FC<WeightPickerProps> = ({
  onWeightChange,
  initialWeight,
  unitSystem,
  enable3DEffect = false,
  showGradientMask = false,
  enableDecayAnimation = true,
  enableSpringAnimation = true,
  enableOpacityAnimation = true,
  enableFontSizeAnimation = true,
  disableAllAnimations = false,
}) => {
  console.log("🏋️ [WeightPicker] Component MOUNTING/RENDERING");

  const unit: WeightUnit = unitSystem === "metric" ? "kg" : "lb";

  const [integerPart, setIntegerPart] = useState<number>(() => {
    if (initialWeight !== undefined) return Math.floor(initialWeight);
    return WEIGHT_LIMITS[unit].min;
  });

  const [decimalPart, setDecimalPart] = useState<number>(() => {
    if (initialWeight !== undefined)
      return Math.round((initialWeight % 1) * 10);
    return 0;
  });

  const weight = integerPart + decimalPart / 10;

  // Use pre-generated data based on unit
  const integerData = unit === "kg" ? WEIGHT_DATA_KG : WEIGHT_DATA_LB;

  useEffect(() => {
    onWeightChange(weight, unit);
  }, [weight, unit, onWeightChange]);

  const handleIntegerChange = useCallback((value: number) => {
    setIntegerPart(value);
  }, []);

  const handleDecimalChange = useCallback((value: number) => {
    setDecimalPart(value);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.weightDisplay}>
        {integerPart}.{decimalPart} {unit}
      </Text>

      <View style={styles.content}>
        <View style={styles.pickersSection}>
          <View style={styles.integerPickerColumn}>
            <Picker
              key={unit}
              data={integerData}
              selectedValue={integerPart}
              onValueChange={handleIntegerChange}
              itemHeight={ITEM_HEIGHT}
              visibleItems={VISIBLE_ITEMS}
              enable3DEffect={enable3DEffect}
              showGradientMask={showGradientMask}
              enableDecayAnimation={enableDecayAnimation}
              enableSpringAnimation={enableSpringAnimation}
              enableOpacityAnimation={enableOpacityAnimation}
              enableFontSizeAnimation={enableFontSizeAnimation}
              disableAllAnimations={disableAllAnimations}
              containerStyle={styles.picker}
              highlightStyle={styles.highlight}
              textStyle={styles.itemText}
              selectedTextStyle={styles.selectedItemText}
            />
          </View>

          <View style={styles.dotContainer}>
            <Text style={styles.dot}>.</Text>
          </View>

          <View style={styles.decimalPickerColumn}>
            <Picker
              data={DECIMAL_DATA}
              selectedValue={decimalPart}
              onValueChange={handleDecimalChange}
              itemHeight={ITEM_HEIGHT}
              visibleItems={VISIBLE_ITEMS}
              enable3DEffect={enable3DEffect}
              showGradientMask={showGradientMask}
              enableDecayAnimation={enableDecayAnimation}
              enableSpringAnimation={enableSpringAnimation}
              enableOpacityAnimation={enableOpacityAnimation}
              enableFontSizeAnimation={enableFontSizeAnimation}
              disableAllAnimations={disableAllAnimations}
              containerStyle={styles.picker}
              highlightStyle={styles.highlight}
              textStyle={styles.itemText}
              selectedTextStyle={styles.selectedItemText}
            />
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
  weightDisplay: {
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
  pickersSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  integerPickerColumn: {
    width: 80,
  },
  dotContainer: {
    width: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    fontSize: 32,
    fontFamily: "Benzin-Bold",
    color: "#000000",
    marginBottom: 10,
  },
  decimalPickerColumn: {
    width: 60,
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
  prev: WeightPickerProps,
  next: WeightPickerProps,
) => {
  return (
    prev.unitSystem === next.unitSystem &&
    prev.initialWeight === next.initialWeight &&
    prev.onWeightChange === next.onWeightChange
  );
};

export default memo(WeightPickerComponent, arePropsEqual);
