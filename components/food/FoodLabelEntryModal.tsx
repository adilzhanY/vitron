import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import CustomButton from "@/components/shared/CustomButton";
import InputField from "@/components/shared/InputField";
import { MealType } from "@/types/type";

interface FoodLabelData {
  foodName: string;
  numberOfServings: number;
  servingSize: number;
  nutrientsPer: number;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
}

interface FoodLabelEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (foodEntry: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: MealType;
    isSaved: boolean;
    date: string;
  }) => Promise<void>;
  labelData: FoodLabelData | null;
}

const FoodLabelEntryModal: React.FC<FoodLabelEntryModalProps> = ({
  visible,
  onClose,
  onSave,
  labelData,
}) => {
  const [entryName, setEntryName] = useState(labelData?.foodName || "");
  const [numberOfServings, setNumberOfServings] = useState(
    labelData?.numberOfServings?.toString() || "1"
  );
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [isSaving, setIsSaving] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const calculateTotal = (value: number) => {
    if (!labelData) return 0;
    const servings = Number(numberOfServings) || 1;
    const ratio = (labelData.servingSize / labelData.nutrientsPer) * servings;
    return Math.round(value * ratio);
  };

  const totalCalories = calculateTotal(labelData?.calories || 0);
  const totalProtein = calculateTotal(labelData?.protein || 0);
  const totalCarbs = calculateTotal(labelData?.carbs || 0);
  const totalFat = calculateTotal(labelData?.fats || 0);

  const handleSave = async () => {
    if (!entryName.trim() || !labelData) {
      return;
    }

    setIsSaving(true);
    await onSave({
      name: entryName,
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      mealType: mealType,
      isSaved: false,
      date: new Date().toISOString(),
    });
    setIsSaving(false);
    console.log("Opened FoodLabelEntryModal for label data");
    onClose();
  };

  const mealTypeOptions: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

  if (!labelData) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/80">
        <View className="w-11/12 bg-white rounded-2xl p-6">
          <Text className="text-black text-2xl font-benzinBold mb-4">
            Track your meal (Label)
          </Text>

          {/* Meal name input */}
          <InputField
            label="Meal name"
            value={entryName}
            onChangeText={setEntryName}
            placeholder="e.g., Protein Bar"
          />
          <View className="h-4" />

          {/* Number of servings */}
          <Text className="text-gray-700 text-lg font-benzinBold mb-2">
            Number of servings
          </Text>
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
            <TextInput
              value={numberOfServings}
              onChangeText={setNumberOfServings}
              keyboardType="numeric"
              placeholder="1"
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-gray-800 font-benzinMedium text-base"
            />
          </View>

          {/* Serving info */}
          <View className="bg-blue-50 rounded-xl p-4 mb-4">
            <Text className="text-gray-700 text-sm font-benzinMedium">
              Serving size: {labelData.servingSize}g
            </Text>
            <Text className="text-gray-700 text-sm font-benzinMedium">
              Nutrients per: {labelData.nutrientsPer}g
            </Text>
          </View>

          {/* Meal Type Dropdown */}
          <Text className="text-gray-700 text-lg font-benzinBold mb-2">
            Meal time
          </Text>
          <TouchableOpacity
            onPress={() => setDropdownVisible(!dropdownVisible)}
            className="bg-gray-100 rounded-xl px-4 py-3 mb-2 flex-row justify-between items-center"
          >
            <Text className="text-gray-800 text-base font-benzinMedium">
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </Text>
            <FontAwesome
              name={dropdownVisible ? "chevron-up" : "chevron-down"}
              size={16}
              color="#6B7280"
            />
          </TouchableOpacity>

          {dropdownVisible && (
            <View className="bg-gray-50 rounded-xl mb-4 overflow-hidden border border-gray-200">
              {mealTypeOptions.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setMealType(type);
                    setDropdownVisible(false);
                  }}
                  className={`px-4 py-3 border-b border-gray-200 ${mealType === type ? "bg-green-100" : ""
                    }`}
                >
                  <Text
                    className={`text-base font-benzinMedium ${mealType === type ? "text-green-700" : "text-gray-700"
                      }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Total macros display */}
          <Text className="text-gray-700 text-lg font-benzinBold mb-2">
            Total nutrition ({numberOfServings} serving{Number(numberOfServings) !== 1 ? 's' : ''})
          </Text>
          <View className="bg-green-50 rounded-xl p-4 mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-700 font-benzinMedium">Calories:</Text>
              <Text className="text-gray-900 font-benzinBold">{totalCalories}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-700 font-benzinMedium">Protein:</Text>
              <Text className="text-gray-900 font-benzinBold">{totalProtein}g</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-700 font-benzinMedium">Carbs:</Text>
              <Text className="text-gray-900 font-benzinBold">{totalCarbs}g</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-700 font-benzinMedium">Fat:</Text>
              <Text className="text-gray-900 font-benzinBold">{totalFat}g</Text>
            </View>
          </View>

          <View className="flex-row mt-4">
            <CustomButton
              title="Cancel"
              onPress={onClose}
              className="flex-1 bg-gray-600 mr-2"
              disabled={isSaving}
            />
            <CustomButton
              title={isSaving ? "Saving..." : "Log Meal"}
              onPress={handleSave}
              className="flex-1 ml-2"
              disabled={isSaving}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FoodLabelEntryModal;
