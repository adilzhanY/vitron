import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import CustomButton from "@/components/shared/CustomButton";
import InputField from "@/components/shared/InputField";
import { MealType } from "@/types/type";

interface FoodEntryModalProps {
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
  name?: string;
  calories?: string;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
}

const FoodEntryModal: React.FC<FoodEntryModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [entryName, setEntryName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validate required fields
    if (!entryName.trim() || !calories.trim()) {
      return;
    }

    setIsSaving(true);
    await onSave({
      name: entryName,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      mealType: mealType,
      isSaved: false,
      date: new Date().toISOString(),
    });
    setIsSaving(false);

    setEntryName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setMealType("breakfast");

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
        <View className="w-11/12 bg-white rounded-2xl p-6">
          <Text className="text-black text-2xl font-benzinBold mb-4">
            Track your meal
          </Text>

          <InputField
            label="Meal name"
            value={entryName}
            onChangeText={setEntryName}
            placeholder="e.g., Sandwich"
          />
          <View className="h-4" />

          {/* Meal Type Selector */}
          <Text className="text-gray-700 text-base font-benzinMedium mb-2">
            Meal Type
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {mealTypeOptions.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setMealType(type)}
                className={`px-4 py-2 rounded-lg ${
                  mealType === type ? "bg-green-500" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-benzinMedium ${
                    mealType === type ? "text-white" : "text-gray-700"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <InputField
            label="Calories"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            placeholder="e.g., 1523"
          />
          <InputField
            label="Protein (g)"
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
            placeholder="e.g., 34"
          />
          <InputField
            label="Carbs (g)"
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="numeric"
            placeholder="e.g., 122"
          />
          <InputField
            label="Fat (g)"
            value={fat}
            onChangeText={setFat}
            keyboardType="numeric"
            placeholder="e.g., 23"
          />

          <View className="flex-row mt-6">
            <CustomButton
              title="Cancel"
              onPress={onClose}
              className="flex-1 bg-gray-600 mr-2"
              disabled={isSaving}
            />
            <CustomButton
              title={isSaving ? "Saving..." : "Save meal"}
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

export default FoodEntryModal;
