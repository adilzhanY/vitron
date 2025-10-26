import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface FoodEntryChoiceModalProps {
  visible: boolean;
  onClose: () => void;
  onScanFood: () => void;
  onDescribeFood: () => void;
}

const FoodEntryChoiceModal: React.FC<FoodEntryChoiceModalProps> = ({
  visible,
  onClose,
  onScanFood,
  onDescribeFood,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-11/12 bg-white rounded-3xl p-6">
          <Text className="text-black text-2xl font-benzinBold mb-6 text-center">
            Add Food Entry
          </Text>

          {/* Scan Food Option */}
          <TouchableOpacity
            onPress={onScanFood}
            className="bg-green-500 rounded-2xl p-6 mb-4 items-center"
            activeOpacity={0.8}
          >
            <MaterialIcons name="camera-alt" size={48} color="white" />
            <Text className="text-white text-xl font-benzinBold mt-3">
              Scan Food
            </Text>
          </TouchableOpacity>

          {/* Describe Food Option */}
          <TouchableOpacity
            onPress={onDescribeFood}
            className="bg-blue-500 rounded-2xl p-6 mb-4 items-center"
            activeOpacity={0.8}
          >
            <MaterialIcons name="edit" size={48} color="white" />
            <Text className="text-white text-xl font-benzinBold mt-3">
              Describe Food
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={onClose}
            className="bg-gray-200 rounded-2xl p-4 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-700 text-lg font-benzinBold">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FoodEntryChoiceModal;
