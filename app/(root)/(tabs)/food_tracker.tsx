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
  imageUrl?: string;
};

import CustomButton from "@/components/shared/CustomButton";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import FoodStatsCard from "@/components/food/FoodStatsCard";
import FoodDateSelector from "@/components/food/FoodDateSelector";
import FoodEntryModal from "@/components/food/FoodEntryModal";
import FoodEntryChoiceModal from "@/components/food/FoodEntryChoiceModal";
import WaterCard from "@/components/food/WaterCard";
import MealCard from "@/components/food/MealCard";
import { useFoodData } from "@/hooks/useFoodData";
import { FontAwesome5 } from "@expo/vector-icons";
import { findFoodStreaks } from "@/services/food/foodStreakService";
// import {
//   calculateMacrosByMealImage,
//   calculateMacrosByMealLabel,
// } from "@/services/food/aiService";

const FoodTracker = () => {
  const { user: clerkUser } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isChoiceModalVisible, setChoiceModalVisible] = useState(false);
  const [isCameraModalVisible, setCameraModalVisible] = useState(false);
  const [isDescribeModalVisible, setDescribeModalVisible] = useState(false);
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [waterLoading, setWaterLoading] = useState(false);
  const [allFoodEntries, setAllFoodEntries] = useState<any[]>([]);
  const [foodStreak, setFoodStreak] = useState(0);

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

  // Fetch all food entries to calculate streak
  const fetchAllFoodEntries = useCallback(async () => {
    if (!clerkUser) return;

    try {
      const { graphqlRequest } = await import("@/lib/graphqlRequest");

      // Fetch all meals for this user
      // Since the backend requires a date, we'll fetch meals for a wide date range
      // or we can get unique dates from the current query
      const query = `
        query GetAllMealsForStreak($clerkId: String!) {
          allMeals(clerkId: $clerkId) {
            id
            entryDate
            loggedAt
          }
        }
      `;

      const data = await graphqlRequest(query, {
        clerkId: clerkUser.id,
      });

      if (data.allMeals) {
        console.log("All meals fetched:", data.allMeals);
        setAllFoodEntries(data.allMeals);
        const { activeStreak } = findFoodStreaks(data.allMeals);
        console.log("Calculated active streak:", activeStreak);
        setFoodStreak(activeStreak);
      }
    } catch (error) {
      console.error("Failed to fetch all food entries:", error);
      // If the query fails (backend doesn't support it), calculate streak from current entries
      if (foodEntries.length > 0) {
        const { activeStreak } = findFoodStreaks(foodEntries);
        console.log("Calculated streak from current entries:", activeStreak);
        setFoodStreak(activeStreak);
      } else {
        setFoodStreak(0);
      }
    }
  }, [clerkUser, foodEntries]);

  useEffect(() => {
    fetchAllFoodEntries();
  }, [fetchAllFoodEntries]);

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
        imageUrl: newMeal.imageUrl,
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
        fetchAllFoodEntries(); // Update streak
      } catch (error) {
        console.error("Failed to save meal: ", error);
      }
    },
    [clerkUser, selectedDate, refetch, fetchAllFoodEntries],
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

        <FoodStatsCard
          foodTotals={foodTotals}
          mealGoals={mealGoals}
          onSetFoodEntry={() => setChoiceModalVisible(true)}
        />

        {/* Daily Log Section */}
        <View className="mt-6 mb-4">
          <View className="flex-row justify-between items-center px-1">
            <Text className="text-black text-2xl font-benzinBold">
              Daily Log
            </Text>
            <View className="flex-row items-center bg-orange-100 px-3 py-2 rounded-full">
              <FontAwesome5 name="fire" size={18} color="#F97316" />
              <Text className="text-orange-600 font-benzinBold text-base ml-2">
                {foodStreak} {foodStreak === 1 ? 'day' : 'days'}
              </Text>
            </View>
          </View>
        </View>

        {/* Meal Cards or Empty State */}
        {foodEntries.length === 0 ? (
          <View className="flex-1 justify-center items-center py-12">
            <FontAwesome5 name="utensils" size={60} color="#D1D5DB" />
            <Text className="text-gray-400 text-lg font-benzinBold mt-4">
              Log your first meal for today!
            </Text>
          </View>
        ) : (
          foodEntries.map((entry) => (
            <View key={entry.id}>
              <MealCard
                name={entry.name}
                calories={entry.calories}
                protein={entry.protein}
                carbs={entry.carbs}
                fat={entry.fat}
                meal_type={entry.meal_type}
                is_saved={entry.is_saved}
                logged_at={entry.logged_at}
                imageUrl={entry.image_url}
              />
            </View>
          ))
        )}

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
      {/* Choice Modal */}
      <FoodEntryChoiceModal
        visible={isChoiceModalVisible}
        onClose={() => setChoiceModalVisible(false)}
        onScanFood={() => {
          setChoiceModalVisible(false);
          setCameraModalVisible(true);
        }}
        onDescribeFood={() => {
          setChoiceModalVisible(false);
          setDescribeModalVisible(true);
        }}
      />

      {/* Camera Modal */}
      <FoodEntryModal
        visible={isCameraModalVisible}
        onClose={() => setCameraModalVisible(false)}
        onSave={handleCreateNewMeal}
        name=""
        calories=""
        mode="scan"
      />

      {/* Describe Modal */}
      <FoodEntryModal
        visible={isDescribeModalVisible}
        onClose={() => setDescribeModalVisible(false)}
        onSave={handleCreateNewMeal}
        name=""
        calories=""
        mode="describe"
      />
    </SafeAreaView>
  );
};

export default FoodTracker;
