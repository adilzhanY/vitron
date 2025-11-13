import React, { useState, useEffect } from 'react';
import { View, Text, Modal } from 'react-native';
import CustomButton from '@/components/shared/CustomButton';
import InputField from '@/components/shared/InputField';

interface SetGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (goal: { weight: string; checkpoints: string }) => Promise<void>;
  initialGoalWeight: string;
  initialCheckpoints: string;
}

const SetGoalModal: React.FC<SetGoalModalProps> = ({
  visible,
  onClose,
  onSave,
  initialGoalWeight,
  initialCheckpoints,
}) => {
  const [goalWeight, setGoalWeight] = useState(initialGoalWeight);
  const [checkpoints, setCheckpoints] = useState(initialCheckpoints);
  const [isSaving, setIsSaving] = useState(false);

  // When the modal opens, sync its internal state with the props
  useEffect(() => {
    if (visible) {
      setGoalWeight(initialGoalWeight);
      setCheckpoints(initialCheckpoints);
    }
  }, [visible, initialGoalWeight, initialCheckpoints]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ weight: goalWeight, checkpoints });
    setIsSaving(false);
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
          <Text className="text-black text-2xl font-interBold mb-4">Set a New Goal</Text>

          <InputField
            label="New Goal Weight (kg)"
            value={goalWeight}
            onChangeText={setGoalWeight}
            keyboardType="numeric"
            placeholder="e.g., 75.5"
          />
          <View className='h-4' />
          <InputField
            label="Number of Checkpoints"
            value={checkpoints}
            onChangeText={setCheckpoints}
            keyboardType="numeric"
            placeholder="e.g., 9"
          />

          <View className="flex-row mt-6">
            <CustomButton
              title="Cancel"
              onPress={onClose}
              className="flex-1 bg-gray-600 mr-2"
              disabled={isSaving}
            />
            <CustomButton
              title={isSaving ? 'Saving...' : 'Save Goal'}
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

export default SetGoalModal;

