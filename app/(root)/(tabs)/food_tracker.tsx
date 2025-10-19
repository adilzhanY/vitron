import { View, ScrollView, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { colors } from "@/constants";
import { FoodTotals, FoodUserGoals, MealType } from "@/types/type";

import CustomButton from "@/components/shared/CustomButton";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import FoodHeader from "@/components/food/FoodHeader";
import FoodDateSelector from "@/components/food/FoodDateSelector";
import MacroProgressBar from "@/components/food/MacroProgressBar";
import FoodEntryModal from "@/components/food/FoodEntryModal";
import WaterCard from "@/components/food/WaterCard";
import { fetchAPI } from "@/lib/fetch";
import { useFoodData } from "@/hooks/useFoodData";
import { calculateMacrosByMealImage, calculateMacrosByMealLabel } from "@/services/food/aiService";

const FoodTracker = () => {
  const { user: clerkUser } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalVisible, setModalVisible] = useState(false);
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [waterLoading, setWaterLoading] = useState(false);

  // AI test states
  const [aiLoading, setAiLoading] = useState<'meal' | 'label' | null>(null);
  const [aiResponse, setAiResponse] = useState<any>(null);

  const { loading, error, foodTotals, mealGoals, refetch } =
    useFoodData(selectedDate);

  // Fetch water intake for selected date
  const fetchWaterIntake = useCallback(async () => {
    if (!clerkUser) return;

    try {
      setWaterLoading(true);
      const dateStr = selectedDate.toISOString().split("T")[0];
      const response = await fetchAPI(
        `/(api)/water?clerkId=${clerkUser.id}&date=${dateStr}`,
      );

      if (response.data) {
        setWaterConsumed(response.data.total_consumed || 0);
      }
    } catch (error) {
      console.error("Failed to fetch water intake:", error);
    } finally {
      setWaterLoading(false);
    }
  }, [clerkUser, selectedDate]);

  // Fetch water intake when component mounts or date changes
  useEffect(() => {
    fetchWaterIntake();
  }, [fetchWaterIntake]);

  // Handle adding water
  const handleAddWater = useCallback(async () => {
    if (!clerkUser) return;

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];

      // If no water consumed yet, create new entry with POST
      if (waterConsumed === 0) {
        await fetchAPI("/(api)/water", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: clerkUser.id,
            date: dateStr,
            amount: 250,
            dailyGoal: 2500,
          }),
        });
        setWaterConsumed(250);
      } else {
        // Otherwise, update existing entry with PATCH
        await fetchAPI("/(api)/water", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: clerkUser.id,
            date: dateStr,
            amount: 250,
          }),
        });
        setWaterConsumed((prev) => prev + 250);
      }
    } catch (error) {
      console.error("Failed to add water:", error);
    }
  }, [clerkUser, selectedDate, waterConsumed]);

  const handleCreateNewMeal = useCallback(
    async (newMeal: {
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      mealType: MealType;
      isSaved: boolean;
      date: string;
    }) => {
      if (!clerkUser) return;

      const payload = {
        clerkId: clerkUser?.id,
        name: newMeal.name,
        calories: newMeal.calories,
        protein: newMeal.protein,
        carbs: newMeal.carbs,
        fat: newMeal.fat,
        mealType: newMeal.mealType,
        isSaved: false,
        entryDate: selectedDate.toISOString().split("T")[0],
      };
      console.log(payload);
      try {
        await fetchAPI("/(api)/food", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        console.log("New meal created in db");
        // Refetch data to update the UI
        refetch();
      } catch (error) {
        console.error("Failed to save meal: ", error);
      }
    },
    [clerkUser, selectedDate, refetch],
  );

  // AI test handlers
  const handleTestMealImage = async () => {
    try {
      setAiLoading('meal');
      setAiResponse(null);

      // Using a publicly accessible test image URL
      // NOTE: OpenRouter/OpenAI requires public URLs, not local file paths
      // Replace this with your actual test image URL or upload your local image to a service like Imgur, Cloudinary, etc.
      const testImageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';

      const response = await calculateMacrosByMealImage(testImageUrl);

      setAiResponse({
        type: 'Meal Image Analysis',
        data: response.choices[0].message
      });
    } catch (error) {
      console.error('AI Meal Image Error:', error);
      setAiResponse({
        type: 'Meal Image Analysis',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setAiLoading(null);
    }
  };

  const handleTestMealLabel = async () => {
    try {
      setAiLoading('label');
      setAiResponse(null);

      // Using a publicly accessible test image URL for nutrition label
      // NOTE: Replace this with your actual nutrition label image URL
      const testLabelUrl = 'https://vitron-meal-images.s3.eu-central-1.amazonaws.com/meal-labels/ai_test_1_meal_label.jpg';

      const response = await calculateMacrosByMealLabel(testLabelUrl);

      setAiResponse({
        type: 'Meal Label Analysis',
        data: response.choices[0].message
      });
    } catch (error) {
      console.error('AI Meal Label Error:', error);
      setAiResponse({
        type: 'Meal Label Analysis',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setAiLoading(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-white flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-green-200">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <PageHeader
          title="Track your food"
          actionText=""
          onActionPress={() => { }}
        />
        <View
          style={{
            borderRadius: 50,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 8,
            alignSelf: "flex-start",
          }}
        >
          <FoodDateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </View>

        <View
          style={{
            borderRadius: 50,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 8,
          }}
          className="bg-white p-5"
        >
          <FoodHeader
            totalCalories={foodTotals.calories}
            onSetFoodEntry={() => setModalVisible(true)}
          />

          <View className="mt-4">
            <MacroProgressBar
              label="Protein"
              current={foodTotals.protein}
              goal={mealGoals.protein}
              color="bg-sky-500"
            />
            <MacroProgressBar
              label="Carbs"
              current={foodTotals.carbs}
              goal={mealGoals.carbs}
              color="bg-green-500"
            />
            <MacroProgressBar
              label="Fat"
              current={foodTotals.fat}
              goal={mealGoals.fat}
              color="bg-amber-500"
            />
          </View>

          <View className="mt-4"></View>
        </View>

        {/* Water Tracking Card */}
        <View
          style={{
            borderRadius: 50,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          <WaterCard
            waterConsumed={waterConsumed}
            dailyGoal={2500}
            increment={250}
            onAddWater={handleAddWater}
          />
        </View>

        {/* AI Test Section */}
        <View
          style={{
            borderRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 8,
          }}
          className="bg-white p-6 mt-5"
        >
          <Text className="text-xl font-benzinBold text-gray-800 mb-4">
            AI Nutrition Analysis Test
          </Text>

          <View className="flex-row gap-3 mb-4">
            <TouchableOpacity
              onPress={handleTestMealImage}
              disabled={aiLoading !== null}
              className="flex-1 bg-blue-500 py-3 px-4 rounded-xl items-center"
              style={{ opacity: aiLoading !== null ? 0.5 : 1 }}
            >
              {aiLoading === 'meal' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-benzinBold">
                  Test Meal Image
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTestMealLabel}
              disabled={aiLoading !== null}
              className="flex-1 bg-purple-500 py-3 px-4 rounded-xl items-center"
              style={{ opacity: aiLoading !== null ? 0.5 : 1 }}
            >
              {aiLoading === 'label' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-benzinBold">
                  Test Meal Label
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {aiResponse && (
            <View className="bg-gray-50 p-4 rounded-xl">
              <Text className="text-base font-benzinBold text-gray-800 mb-2">
                {aiResponse.type}
              </Text>
              <ScrollView
                style={{ maxHeight: 300 }}
                showsVerticalScrollIndicator={true}
              >
                <Text className="text-sm font-mono text-gray-700">
                  {JSON.stringify(aiResponse.data || aiResponse.error, null, 2)}
                </Text>
              </ScrollView>
            </View>
          )}
        </View>

        <View className="h-[500px]"></View>
      </ScrollView>
      <FoodEntryModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleCreateNewMeal}
        name=""
        calories=""
      />
    </SafeAreaView>
  );
};

export default FoodTracker;
