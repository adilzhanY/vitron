import { View, ScrollView, ActivityIndicator } from "react-native";
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

const FoodTracker = () => {
  const { user: clerkUser } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalVisible, setModalVisible] = useState(false);
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [waterLoading, setWaterLoading] = useState(false);

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
