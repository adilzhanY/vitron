import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import CustomButton from "@/components/shared/CustomButton";
import InputField from "@/components/shared/InputField";
import { MealType } from "@/types/type";
import FoodCameraView from "./FoodCameraView";
import { useUser } from "@clerk/clerk-expo";
import { uploadImageToS3, ImageUploadMode } from "@/services/food/s3Service";

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
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"scan" | "describe">("scan");
  const [showCamera, setShowCamera] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [entryName, setEntryName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [isSaving, setIsSaving] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

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

  const handleImageCapture = async (imageUri: string, mode: "scan" | "label" | "gallery") => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    try {
      setIsUploading(true);

      // Determine the upload mode (gallery uses scan mode for folder structure)
      const uploadMode: ImageUploadMode = mode === "label" ? "label" : "scan";

      // Upload image to S3
      const result = await uploadImageToS3({
        imageUri,
        userId: user.id,
        mode: uploadMode,
      });

      if (result.success) {
        console.log("Image uploaded successfully:", result.url);
        // TODO: Process the image with AI and populate the form fields
        // For now, just close the camera
        setShowCamera(false);
      } else {
        console.error("Failed to upload image:", result.error);
        alert("Failed to upload image. Please try again.");
      }
    } catch (error) {
      console.error("Error handling image capture:", error);
      alert("An error occurred while processing the image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  // Open camera when tab switches to "scan" and modal is visible
  useEffect(() => {
    if (visible && activeTab === "scan") {
      setShowCamera(true);
    } else {
      setShowCamera(false);
    }
  }, [visible, activeTab]);

  const mealTypeOptions: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

  // If camera is active, show full-screen camera
  if (showCamera) {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={onClose}
      >
        <FoodCameraView onCapture={handleImageCapture} onClose={handleCameraClose} />
      </Modal>
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/80">
        <View className="w-11/12 bg-white rounded-2xl p-6">
          {/* Tab Switcher */}
          <View className="flex-row mb-4 bg-gray-100 rounded-xl p-1">
            <TouchableOpacity
              onPress={() => setActiveTab("scan")}
              className={`flex-1 py-3 rounded-lg ${activeTab === "scan" ? "bg-green-500" : "bg-transparent"
                }`}
            >
              <Text
                className={`text-center font-benzinBold ${activeTab === "scan" ? "text-white" : "text-gray-600"
                  }`}
              >
                Scan Food
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("describe")}
              className={`flex-1 py-3 rounded-lg ${activeTab === "describe" ? "bg-green-500" : "bg-transparent"
                }`}
            >
              <Text
                className={`text-center font-benzinBold ${activeTab === "describe" ? "text-white" : "text-gray-600"
                  }`}
              >
                Describe Food
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-black text-2xl font-benzinBold mb-4">
            Track your meal
          </Text>

          {/* Meal name input - full width */}
          <InputField
            label="Meal name"
            value={entryName}
            onChangeText={setEntryName}
            placeholder="e.g., Sandwich"
          />
          <View className="h-4" />

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

          {/* Dropdown options */}
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

          {/* Compact macro inputs - 2 columns */}
          <View className="flex-row justify-between mb-3">
            {/* Calories */}
            <View className="flex-1 mr-2">
              <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                <Text className="text-gray-700 text-sm font-benzinMedium mr-2">
                  Calories
                </Text>
                <TextInput
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-right text-gray-800 font-benzinMedium text-base"
                />
              </View>
            </View>

            {/* Protein */}
            <View className="flex-1 ml-2">
              <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                <Text className="text-gray-700 text-sm font-benzinMedium mr-2">
                  Protein
                </Text>
                <TextInput
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                  placeholder="0g"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-right text-gray-800 font-benzinMedium text-base"
                />
              </View>
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            {/* Carbs */}
            <View className="flex-1 mr-2">
              <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                <Text className="text-gray-700 text-sm font-benzinMedium mr-2">
                  Carbs
                </Text>
                <TextInput
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                  placeholder="0g"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-right text-gray-800 font-benzinMedium text-base"
                />
              </View>
            </View>

            {/* Fat */}
            <View className="flex-1 ml-2">
              <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                <Text className="text-gray-700 text-sm font-benzinMedium mr-2">
                  Fat
                </Text>
                <TextInput
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                  placeholder="0g"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-right text-gray-800 font-benzinMedium text-base"
                />
              </View>
            </View>
          </View>

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
