import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { colors } from "@/constants";
import { FoodTotals, FoodUserGoals, MealType } from "@/types/type";

type NewMeal = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
  isSaved: boolean;
  date: string;
};

import CustomButton from "@/components/shared/CustomButton";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import FoodStatsCard from "@/components/food/FoodStatsCard";
import FoodDateSelector from "@/components/food/FoodDateSelector";
import FoodEntryModal from "@/components/food/FoodEntryModal";
import WaterCard from "@/components/food/WaterCard";
import MealCard from "@/components/food/MealCard";
import { useFoodData } from "@/hooks/useFoodData";
// import {
//   calculateMacrosByMealImage,
//   calculateMacrosByMealLabel,
// } from "@/services/food/aiService";

const FoodTracker = () => {
  const { user: clerkUser } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalVisible, setModalVisible] = useState(false);
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [waterLoading, setWaterLoading] = useState(false);

  const { loading, error, foodTotals, foodEntries, mealGoals, refetch } =
    useFoodData(selectedDate);

  // Fetch water intake for selected date
  const fetchWaterIntake = useCallback(async () => {
    if (!clerkUser) return;

    try {
      setWaterLoading(true);
      const dateStr = selectedDate.toISOString().split("T")[0];

      const { graphqlRequest } = await import("@/lib/graphqlRequest");
      const { GET_WATER_INTAKE_QUERY } = await import(
        "@/lib/graphql/mealQueries"
      );

      const data = await graphqlRequest(GET_WATER_INTAKE_QUERY, {
        clerkId: clerkUser.id,
        date: dateStr,
      });

      if (data.waterIntake) {
        setWaterConsumed(data.waterIntake.totalConsumed || 0);
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
      const { graphqlRequest } = await import("@/lib/graphqlRequest");
      const { CREATE_WATER_INTAKE_MUTATION, UPDATE_WATER_INTAKE_MUTATION } =
        await import("@/lib/graphql/mealQueries");

      // If no water consumed yet, create new entry
      if (waterConsumed === 0) {
        const data = await graphqlRequest(CREATE_WATER_INTAKE_MUTATION, {
          input: {
            clerkId: clerkUser.id,
            date: dateStr,
            amount: 250,
            dailyGoal: 2500,
          },
        });
        setWaterConsumed(data.createWaterIntake.totalConsumed);
      } else {
        // Otherwise, update existing entry
        const data = await graphqlRequest(UPDATE_WATER_INTAKE_MUTATION, {
          input: {
            clerkId: clerkUser.id,
            date: dateStr,
            amount: 250,
          },
        });
        setWaterConsumed(data.updateWaterIntake.totalConsumed);
      }
    } catch (error) {
      console.error("Failed to add water:", error);
    }
  }, [clerkUser, selectedDate, waterConsumed]);

  const handleCreateNewMeal = useCallback(
    async (newMeal: NewMeal) => {
      if (!clerkUser) return;

      const input = {
        clerkId: clerkUser.id,
        name: newMeal.name,
        calories: newMeal.calories,
        protein: newMeal.protein,
        carbs: newMeal.carbs,
        fat: newMeal.fat,
        mealType: newMeal.mealType,
        isSaved: false,
        entryDate: selectedDate.toISOString().split("T")[0],
      };
      console.log(input);
      try {
        const { graphqlRequest } = await import("@/lib/graphqlRequest");
        const { CREATE_MEAL_MUTATION } = await import(
          "@/lib/graphql/mealQueries"
        );

        await graphqlRequest(CREATE_MEAL_MUTATION, { input });
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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <PageHeader
          title="Track your food"
          actionText=""
          onActionPress={() => {}}
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

        <FoodStatsCard
          foodTotals={foodTotals}
          mealGoals={mealGoals}
          onSetFoodEntry={() => setModalVisible(true)}
        />

        {/* Meal Cards */}
        {foodEntries.map((entry) => (
          <View
            key={entry.id}
          >
            <MealCard
              name={entry.name}
              calories={entry.calories}
              protein={entry.protein}
              carbs={entry.carbs}
              fat={entry.fat}
              meal_type={entry.meal_type}
              is_saved={entry.is_saved}
              logged_at={entry.logged_at}
            />
          </View>
        ))}
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

        <View className="h-[400px]"></View>
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
