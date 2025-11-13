import React, { memo, useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Picker2, { PickerItem } from "../shared/Picker2";
import LoadingLogo from "../shared/LoadingLogo";

interface WeightPicker2Props {
  onWeightChange: (weight: number, unit: "kg" | "lb") => void;
  initialWeight?: number;
  unitSystem: "metric" | "imperial";
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

type WeightUnit = "kg" | "lb";

// Optimized: More realistic weight ranges
const WEIGHT_LIMITS = {
  kg: { min: 30, max: 200, step: 0.1 },  // Reduced from 20-250
  lb: { min: 66, max: 440, step: 0.1 },  // Reduced from 45-550
} as const;

// Decimal data is small, can be pre-generated
const DECIMAL_DATA = Array.from({ length: 10 }, (_, i) => ({
  value: i,
  label: String(i),
}));

// Helper function to generate weight data only when needed
const generateWeightData = (min: number, max: number): PickerItem<number>[] => {
  const length = max - min + 1;
  const data: PickerItem<number>[] = new Array(length);

  for (let i = 0; i < length; i++) {
    const value = min + i;
    data[i] = {
      value,
      label: String(value),
    };
  }

  return data;
};

const WeightPicker2Component: React.FC<WeightPicker2Props> = ({
  onWeightChange,
  initialWeight,
  unitSystem,
}) => {
  console.log("🏋️ [WeightPicker2] Component MOUNTING/RENDERING");

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

  // Generate data only when unit changes (useMemo optimization)
  const integerData = useMemo(() => {
    console.log(`🔢 [WeightPicker2] Generating ${unit} data...`);
    const limits = WEIGHT_LIMITS[unit];
    return generateWeightData(limits.min, limits.max);
  }, [unit]);

  const weight = integerPart + decimalPart / 10;

  // Track if component is ready
  const [isReady, setIsReady] = useState(false);

  // Set ready after data is generated
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [integerData]);

  useEffect(() => {
    onWeightChange(weight, unit);
  }, [weight, unit, onWeightChange]);

  const handleIntegerChange = useCallback((item: PickerItem<number>) => {
    setIntegerPart(item.value);
  }, []);

  const handleDecimalChange = useCallback((item: PickerItem<number>) => {
    setDecimalPart(item.value);
  }, []);

  // Show loading state while data is being prepared
  if (!isReady) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingLogo size={60} />
          <Text style={styles.loadingText}>Loading picker...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.weightDisplay}>
        {integerPart}.{decimalPart} {unit}
      </Text>

      <View style={styles.content}>
        <View style={styles.pickersSection}>
          <View style={styles.integerPickerColumn}>
            <Picker2
              key={unit}
              data={integerData}
              value={integerPart}
              onValueChanged={handleIntegerChange}
              itemHeight={ITEM_HEIGHT}
              visibleItemCount={VISIBLE_ITEMS}
              enableScrollByTapOnItem={true}
              containerStyle={styles.picker}
              itemTextStyle={styles.itemText}
              overlayItemStyle={styles.highlight}
            />
          </View>

          <View style={styles.dotContainer}>
            <Text style={styles.dot}>.</Text>
          </View>

          <View style={styles.decimalPickerColumn}>
            <Picker2
              data={DECIMAL_DATA}
              value={decimalPart}
              onValueChanged={handleDecimalChange}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  loadingContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#666666",
    marginTop: 10,
  },
  weightDisplay: {
    fontSize: 36,
    fontFamily: "Inter-Bold",
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
    fontFamily: "Inter-Bold",
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
    fontFamily: "Inter-Bold",
    textAlign: "center",
  },
});

const arePropsEqual = (
  prev: WeightPicker2Props,
  next: WeightPicker2Props,
) => {
  return (
    prev.unitSystem === next.unitSystem &&
    prev.initialWeight === next.initialWeight &&
    prev.onWeightChange === next.onWeightChange
  );
};

export default memo(WeightPicker2Component, arePropsEqual);
