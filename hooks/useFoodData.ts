import { useState, useCallback, useMemo, useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";
import { graphqlRequest } from "@/lib/graphqlRequest";
import { GET_MEALS_QUERY, GET_MEAL_GOAL_QUERY } from "@/lib/graphql/mealQueries";
import { calculateMacros } from "@/services/food/foodService";
import { useWeightData } from "./useWeightData";

export interface FoodEntry {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  is_saved: boolean;
  entry_date: string;
  logged_at: string;
  image_url?: string;
}

export interface FoodTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const useFoodData = (selectedDate: Date) => {
  const { user: clerkUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [mealGoals, setMealGoals] = useState<MealGoals | null>(null);

  // Get weight data to calculate meal goals
  const {
    startWeight,
    goalWeight,
    userGoal,
    loading: weightLoading,
  } = useWeightData();

  // Fetch user data from API
  const [userData, setUserData] = useState<{
    height: number | null;
    age: number | null;
    gender: "male" | "female" | null;
    activityLevel:
    | "sedentary"
    | "lightly active"
    | "moderately active"
    | "very active"
    | "extremely active"
    | null;
    goal: "lose weight" | "gain weight" | "be fit";
  } | null>(null);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    if (!clerkUser) return;

    try {
      const data = await graphqlRequest(
        `query GetUser($clerkId: String!) {
          user(clerkId: $clerkId) {
            height
            birthday
            gender
            activityLevel
            goal
          }
        }`,
        { clerkId: clerkUser.id }
      );
      const user = data.user;

      // Calculate age from birthday
      let age = null;
      if (user.birthday) {
        const birthDate = new Date(user.birthday);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
      }

      setUserData({
        height: user.height,
        age,
        gender: user.gender,
        activityLevel: user.activityLevel,
        goal: user.goal || "be fit",
      });
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  }, [clerkUser]);

  // Fetch food entries for selected date
  const fetchFoodData = useCallback(
    async (date: Date) => {
      if (!clerkUser) return;

      setLoading(true);
      setError(null);

      try {
        const dateString = date.toISOString().split("T")[0];
        const data = await graphqlRequest(GET_MEALS_QUERY, {
          clerkId: clerkUser.id,
          date: dateString,
        });
        setFoodEntries(data.meals || []);
      } catch (err) {
        console.error("Failed to fetch food data:", err);
        setError("Could not load your food data. Please try again");
        setFoodEntries([]);
      } finally {
        setLoading(false);
      }
    },
    [clerkUser],
  );

  // Fetch meal goals for the user
  const fetchMealGoals = useCallback(async () => {
    if (!clerkUser) return;

    try {
      console.log("Fetching meal goals for user:", clerkUser.id);
      const data = await graphqlRequest(GET_MEAL_GOAL_QUERY, {
        clerkId: clerkUser.id,
      });
      console.log("Meal goals response:", data);

      if (data.mealGoal) {
        console.log("Setting meal goals from db:", data.mealGoal);
        setMealGoals({
          calories: data.mealGoal.caloriesTarget,
          protein: data.mealGoal.proteinTarget,
          carbs: data.mealGoal.carbsTarget,
          fat: data.mealGoal.fatTarget,
        });
      } else {
        console.log("No meal goals found in database, will calculate instead");
      }
    } catch (err) {
      console.error("Failed to fetch meal goals:", err);
    }
  }, [clerkUser]);

  // Calculate meal goals if not available from API
  const calculatedGoals = useMemo(() => {
    // If there are meal goals from db, use those
    if (mealGoals) {
      console.log("Using meal goals from database:", mealGoals);
      return mealGoals;
    }

    // Calculate goals using service if there is all required data
    if (
      userData &&
      userData.height &&
      userData.age &&
      userData.gender &&
      userData.activityLevel &&
      startWeight &&
      goalWeight
    ) {
      console.log("Calculating meal goals with:", {
        height: userData.height,
        age: userData.age,
        gender: userData.gender,
        activityLevel: userData.activityLevel,
        startWeight,
        goalWeight,
        userGoal,
      });

      const macros = calculateMacros({
        heightCm: userData.height,
        currentWeight: startWeight,
        targetWeight: goalWeight,
        goal: userGoal as "lose weight" | "gain weight" | "be fit",
        activityLevel: userData.activityLevel,
        age: userData.age,
        gender: userData.gender,
      });

      console.log("Calculated macros:", macros);

      return {
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
      };
    }

    // Default values if nothing available
    console.log("Using default meal goals");
    return {
      calories: 2200,
      protein: 160,
      carbs: 250,
      fat: 70,
    };
  }, [mealGoals, userData, startWeight, goalWeight, userGoal]);

  // Calculate daily totals from food entries
  const foodTotals = useMemo(() => {
    if (foodEntries.length === 0) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    }

    // Ensure all values are numbers, handle null/undefined from db
    const totals = foodEntries.reduce(
      (totals, entry) => ({
        calories: totals.calories + (Number(entry.calories) || 0),
        protein: totals.protein + (Number(entry.protein) || 0),
        carbs: totals.carbs + (Number(entry.carbs) || 0),
        fat: totals.fat + (Number(entry.fat) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    // Ensure returned values are always valid numbers
    return {
      calories: Number(totals.calories) || 0,
      protein: Number(totals.protein) || 0,
      carbs: Number(totals.carbs) || 0,
      fat: Number(totals.fat) || 0,
    };
  }, [foodEntries]);

  // Fetch data on mount and when date changes
  useEffect(() => {
    fetchUserData();
    fetchMealGoals();
  }, [fetchUserData, fetchMealGoals]);

  useEffect(() => {
    fetchFoodData(selectedDate);
  }, [selectedDate, fetchFoodData]);

  return {
    loading: loading || weightLoading,
    error,
    foodEntries,
    foodTotals,
    mealGoals: calculatedGoals,
    refetch: () => fetchFoodData(selectedDate),
  };
};
