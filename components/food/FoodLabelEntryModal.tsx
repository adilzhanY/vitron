import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView } from "react-native";
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
  console.log('FoodLabelEntryModal: labelData received:', labelData);

  const [entryName, setEntryName] = useState("");
  const [numberOfServings, setNumberOfServings] = useState("1");
  const [servingSize, setServingSize] = useState("0");
  const [nutrientsPer, setNutrientsPer] = useState("0");
  const [calories, setCalories] = useState("0");
  const [protein, setProtein] = useState("0");
  const [carbs, setCarbs] = useState("0");
  const [fat, setFat] = useState("0");
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [isSaving, setIsSaving] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Update state when labelData changes
  useEffect(() => {
    if (labelData) {
      console.log('FoodLabelEntryModal: Updating state with labelData:', labelData);
      setEntryName(labelData.foodName || "");
      setNumberOfServings(labelData.numberOfServings?.toString() || "1");
      setServingSize(labelData.servingSize?.toString() || "0");
      setNutrientsPer(labelData.nutrientsPer?.toString() || "0");
      setCalories(labelData.calories?.toString() || "0");
      setProtein(labelData.protein?.toString() || "0");
      setCarbs(labelData.carbs?.toString() || "0");
      setFat(labelData.fats?.toString() || "0");
    }
  }, [labelData]);

  const calculateTotal = (value: number) => {
    const servings = Number(numberOfServings) || 1;
    const servingSizeNum = Number(servingSize) || 1;
    const nutrientsPerNum = Number(nutrientsPer) || 1;
    const ratio = (servingSizeNum / nutrientsPerNum) * servings;
    const result = Math.round(value * ratio);
    console.log(`calculateTotal: value=${value}, servings=${servings}, servingSize=${servingSizeNum}, nutrientsPer=${nutrientsPerNum}, ratio=${ratio}, result=${result}`);
    return result;
  };

  const totalCalories = calculateTotal(Number(calories) || 0);
  const totalProtein = calculateTotal(Number(protein) || 0);
  const totalCarbs = calculateTotal(Number(carbs) || 0);
  const totalFat = calculateTotal(Number(fat) || 0);

  console.log('FoodLabelEntryModal render:', {
    calories, protein, carbs, fat,
    totalCalories, totalProtein, totalCarbs, totalFat,
    servingSize, nutrientsPer, numberOfServings
  });

  const handleSave = async () => {
    if (!entryName.trim()) {
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

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/80">
        <View className="w-11/12 max-h-[90%] bg-white rounded-2xl p-6">
          <Text className="text-black text-2xl font-benzinBold mb-4">
            Track your meal (Label)
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Meal name input */}
            <InputField
              label="Meal name"
              value={entryName}
              onChangeText={setEntryName}
              placeholder="e.g., Protein Bar"
            />
            <View className="h-4" />

            {/* Label Information Section */}
            <Text className="text-gray-700 text-lg font-benzinBold mb-3">
              Label Information
            </Text>

            {/* Serving Size and Nutrients Per - Two columns */}
            <View className="flex-row justify-between mb-3">
              <View className="flex-1 mr-2">
                <Text className="text-gray-600 text-sm font-benzinMedium mb-1">
                  Serving Size (g)
                </Text>
                <View className="bg-gray-100 rounded-xl px-4 py-3">
                  <TextInput
                    value={servingSize}
                    onChangeText={setServingSize}
                    keyboardType="numeric"
                    placeholder="100"
                    placeholderTextColor="#9CA3AF"
                    className="text-gray-800 font-benzinMedium text-base"
                  />
                </View>
              </View>

              <View className="flex-1 ml-2">
                <Text className="text-gray-600 text-sm font-benzinMedium mb-1">
                  Nutrients Per (g)
                </Text>
                <View className="bg-gray-100 rounded-xl px-4 py-3">
                  <TextInput
                    value={nutrientsPer}
                    onChangeText={setNutrientsPer}
                    keyboardType="numeric"
                    placeholder="100"
                    placeholderTextColor="#9CA3AF"
                    className="text-gray-800 font-benzinMedium text-base"
                  />
                </View>
              </View>
            </View>

            {/* Nutrition Facts Section */}
            <Text className="text-gray-700 text-lg font-benzinBold mb-3 mt-2">
              Nutrition Facts (per {nutrientsPer}g)
            </Text>

            {/* Calories and Protein - Two columns */}
            <View className="flex-row justify-between mb-3">
              <View className="flex-1 mr-2">
                <Text className="text-gray-600 text-sm font-benzinMedium mb-1">
                  Calories
                </Text>
                <View className="bg-gray-100 rounded-xl px-4 py-3">
                  <TextInput
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    className="text-gray-800 font-benzinMedium text-base"
                  />
                </View>
              </View>

              <View className="flex-1 ml-2">
                <Text className="text-gray-600 text-sm font-benzinMedium mb-1">
                  Protein (g)
                </Text>
                <View className="bg-gray-100 rounded-xl px-4 py-3">
                  <TextInput
                    value={protein}
                    onChangeText={setProtein}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    className="text-gray-800 font-benzinMedium text-base"
                  />
                </View>
              </View>
            </View>

            {/* Carbs and Fat - Two columns */}
            <View className="flex-row justify-between mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-gray-600 text-sm font-benzinMedium mb-1">
                  Carbs (g)
                </Text>
                <View className="bg-gray-100 rounded-xl px-4 py-3">
                  <TextInput
                    value={carbs}
                    onChangeText={setCarbs}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    className="text-gray-800 font-benzinMedium text-base"
                  />
                </View>
              </View>

              <View className="flex-1 ml-2">
                <Text className="text-gray-600 text-sm font-benzinMedium mb-1">
                  Fat (g)
                </Text>
                <View className="bg-gray-100 rounded-xl px-4 py-3">
                  <TextInput
                    value={fat}
                    onChangeText={setFat}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    className="text-gray-800 font-benzinMedium text-base"
                  />
                </View>
              </View>
            </View>

            {/* Number of servings */}
            <Text className="text-gray-700 text-lg font-benzinBold mb-2">
              Number of servings
            </Text>
            <View className="bg-gray-100 rounded-xl px-4 py-3 mb-4">
              <TextInput
                value={numberOfServings}
                onChangeText={setNumberOfServings}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor="#9CA3AF"
                className="text-gray-800 font-benzinMedium text-base"
              />
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
            <View className="bg-green-50 rounded-xl p-4 mb-4 border border-green-200">
              <Text className="text-gray-700 text-base font-benzinBold mb-3">
                Total for {numberOfServings} serving{Number(numberOfServings) !== 1 ? 's' : ''}:
              </Text>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600 font-benzinMedium text-sm">Calories:</Text>
                <Text className="text-gray-900 font-benzinBold text-lg">{totalCalories}</Text>
              </View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600 font-benzinMedium text-sm">Protein:</Text>
                <Text className="text-gray-900 font-benzinBold text-lg">{totalProtein}g</Text>
              </View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600 font-benzinMedium text-sm">Carbs:</Text>
                <Text className="text-gray-900 font-benzinBold text-lg">{totalCarbs}g</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 font-benzinMedium text-sm">Fat:</Text>
                <Text className="text-gray-900 font-benzinBold text-lg">{totalFat}g</Text>
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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default FoodLabelEntryModal;
