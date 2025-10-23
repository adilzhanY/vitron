import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import CustomButton from "@/components/shared/CustomButton";
import InputField from "@/components/shared/InputField";
import { MealType } from "@/types/type";
import FoodCameraView from "./FoodCameraView";
import FoodLabelEntryModal from "./FoodLabelEntryModal";
import { useUser } from "@clerk/clerk-expo";
import { uploadImageToS3, ImageUploadMode, deleteImageFromS3 } from "@/services/food/s3Service";
import { analyzeImageWithAI, PromptType } from "@/services/food/aiService";

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
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [labelData, setLabelData] = useState<any>(null);

  const handleSave = async () => {
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

    let uploadedImageUrl: string | undefined;

    try {
      setIsUploading(true);
      setShowCamera(false);

      if (mode === "scan") {
        console.log("User chose food meal");
      } else if (mode === "label") {
        console.log("User chose food label");
      } else if (mode === "gallery") {
        console.log("User chose image from gallery");
      }

      const uploadMode: ImageUploadMode = mode === "label" ? "label" : mode === "gallery" ? "gallery" : "scan";

      const uploadResult = await uploadImageToS3({
        imageUri,
        userId: user.id,
        mode: uploadMode,
      });

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Failed to upload image");
      }

      uploadedImageUrl = uploadResult.url;

      let promptType: PromptType;
      if (mode === "scan") {
        promptType = "meal";
      } else if (mode === "label") {
        promptType = "label";
      } else {
        promptType = "gallery";
      }

      const aiData = await analyzeImageWithAI(uploadedImageUrl, promptType);

      try {
        await deleteImageFromS3(uploadedImageUrl);
      } catch (deleteError) {
        console.error("Failed to delete image from S3:", deleteError);
      }

      // Step 4: Handle AI response based on data structure
      if (aiData.servingSize !== undefined && aiData.nutrientsPer !== undefined) {
        console.log("Opened FoodLabelEntryModal for label data");
        setLabelData(aiData);
        setShowLabelModal(true);
      } else {
        console.log("Populated FoodEntryModal with meal data");
        setEntryName(aiData.foodName || "");
        setCalories(aiData.calories?.toString() || "");
        setProtein(aiData.protein?.toString() || "");
        setCarbs(aiData.carbs?.toString() || "");
        setFat(aiData.fats?.toString() || "");
      }
    } catch (error) {
      console.error("Failed to populate modal with AI data:", error);
      alert(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowCamera(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  useEffect(() => {
    if (visible && activeTab === "scan") {
      setShowCamera(true);
    } else {
      setShowCamera(false);
    }
  }, [visible, activeTab]);

  const mealTypeOptions: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

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
    <>
      {/* Food Label Entry Modal */}
      <FoodLabelEntryModal
        visible={showLabelModal}
        onClose={() => {
          setShowLabelModal(false);
          setLabelData(null);
          onClose();
        }}
        onSave={onSave}
        labelData={labelData}
      />

      {/* Loading Modal */}
      {isUploading && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isUploading}
        >
          <View className="flex-1 justify-center items-center bg-black/80">
            <View className="bg-white rounded-2xl p-8 items-center">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="mt-4 text-gray-800 font-benzinMedium text-lg">
                Analyzing image...
              </Text>
              <Text className="mt-2 text-gray-600 font-benzinRegular text-sm text-center">
                This may take a few seconds
              </Text>
            </View>
          </View>
        </Modal>
      )}

      {/* Main Food Entry Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible && !showLabelModal && !isUploading}
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
    </>
  );
};

export default FoodEntryModal;
