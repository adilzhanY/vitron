import React, { useState, useEffect } from 'react';
import { View, Text, Modal } from 'react-native';
import CustomButton from '@/components/shared/CustomButton';
import InputField from '@/components/shared/InputField';
import {MealType} from '@/types/type';

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
  name: string,
  calories: string,
  protein?: number | null,
  carbs?: number | null,
  fat?: number | null,
}

const FoodEntryModal: React.FC<FoodEntryModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [entryName, setEntryName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [isSaving, setIsSaving] = useState(false);


  const handleSave = async () => {
    setIsSaving(true);
    await onSave({
      name: entryName,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(fat),
      fat: Number(fat),
      mealType: 'breakfast',
      isSaved: false,
      date: new Date().toISOString(),
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/80">
        <View className="w-11/12 bg-white rounded-2xl p-6">
          <Text className="text-black text-2xl font-benzinBold mb-4">Track your meal</Text>

          <InputField
            label="Meal name"
            value={entryName}
            onChangeText={setEntryName}
            placeholder="e.g., Sandwich"
          />
          <View className='h-4' />
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
              title={isSaving ? 'Saving...' : 'Save meal'}
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
