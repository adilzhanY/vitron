import React, { memo, useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";

interface WeightInputProps {
  onWeightChange: (weight: number, unit: "kg" | "lb") => void;
  initialWeight?: number;
  unitSystem: "metric" | "imperial";
  onValidationError?: (error: string | null) => void;
}

const WeightInputComponent: React.FC<WeightInputProps> = ({
  onWeightChange,
  initialWeight,
  unitSystem,
  onValidationError,
}) => {
  const unit: "kg" | "lb" = unitSystem === "metric" ? "kg" : "lb";

  const [integerPart, setIntegerPart] = useState<string>(() => {
    if (initialWeight !== undefined) return Math.floor(initialWeight).toString();
    return "";
  });

  const [decimalPart, setDecimalPart] = useState<string>(() => {
    if (initialWeight !== undefined) {
      const decimal = Math.round((initialWeight % 1) * 10);
      return decimal.toString();
    }
    return "";
  });

  const decimalInputRef = useRef<TextInput>(null);
  const integerInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (integerPart === "") {
      onValidationError?.(null);
      return;
    }
    const integer = parseInt(integerPart) || 0;
    const decimal = parseInt(decimalPart) || 0;
    const weight = integer + decimal / 10;

    const error = validateWeight(weight, unit);
    onValidationError?.(error);

    if (!error) {
      onWeightChange(weight, unit);
    }
  }, [integerPart, decimalPart, unit, onWeightChange, onValidationError]);

  const validateWeight = (value: number, unit: "kg" | "lb"): string | null => {
    if (unit === "kg") {
      if (value < 20) {
        return "Weight must be at least 20 kg";
      } else if (value > 250) {
        return "Weight cannot exceed 250 kg";
      }
    } else {
      // lb
      if (value < 45) {
        return "Weight must be at least 45 lb";
      } else if (value > 550) {
        return "Weight cannot exceed 550 lb";
      }
    }
    return null;
  };

  const handleIntegerChange = (text: string) => {
    // Only allow digits
    const cleaned = text.replace(/[^0-9]/g, "");

    // Limit to 3 digits
    const limited = cleaned.slice(0, 3);

    setIntegerPart(limited);

    // Auto-focus decimal input when 3 digits entered
    if (limited.length === 3) {
      decimalInputRef.current?.focus();
    }
  };

  const handleDecimalChange = (text: string) => {
    // Only allow single digit 0-9
    const cleaned = text.replace(/[^0-9]/g, "");
    const limited = cleaned.slice(0, 1);
    setDecimalPart(limited);
  };

  const handleDecimalKeyPress = (e: any) => {
    // On backspace when decimal is empty, move focus back to integer
    if (e.nativeEvent.key === 'Backspace' && decimalPart === '') {
      integerInputRef.current?.focus();
    }
  };

  const handleIntegerSubmit = () => {
    // Move focus to decimal input
    decimalInputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.weightDisplay}>
        {integerPart || "—"}.{decimalPart || "—"} {unit}
      </Text>

      <View style={styles.content}>
        <View style={styles.inputSection}>
          <TextInput
            ref={integerInputRef}
            style={styles.integerInput}
            value={integerPart}
            onChangeText={handleIntegerChange}
            keyboardType="numeric"
            returnKeyType="next"
            onSubmitEditing={handleIntegerSubmit}
            selectTextOnFocus
            maxLength={3}
            placeholder={unit === "kg" ? "70" : "154"}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.dot}>.</Text>

          <TextInput
            ref={decimalInputRef}
            style={styles.decimalInput}
            value={decimalPart}
            onChangeText={handleDecimalChange}
            onKeyPress={handleDecimalKeyPress}
            keyboardType="numeric"
            returnKeyType="done"
            selectTextOnFocus
            maxLength={1}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
          />
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
  inputSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  integerInput: {
    width: 100,
    fontSize: 32,
    fontFamily: "Benzin-Bold",
    color: "#000000",
    textAlign: "center",
    padding: 0,
  },
  dot: {
    fontSize: 32,
    fontFamily: "Benzin-Bold",
    color: "#000000",
    marginHorizontal: 8,
  },
  decimalInput: {
    width: 50,
    fontSize: 32,
    fontFamily: "Benzin-Bold",
    color: "#000000",
    textAlign: "center",
    padding: 0,
  },
});

const arePropsEqual = (
  prev: WeightInputProps,
  next: WeightInputProps,
) => {
  return (
    prev.unitSystem === next.unitSystem &&
    prev.initialWeight === next.initialWeight &&
    prev.onWeightChange === next.onWeightChange
  );
};

export default memo(WeightInputComponent, arePropsEqual);
