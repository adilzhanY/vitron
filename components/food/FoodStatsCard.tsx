import { View } from "react-native";
import React, { useState } from "react";
import FoodHeader from "./FoodHeader";
import MacroProgressCircle from "./MacroProgressCircle";
import { FoodTotals, FoodUserGoals } from "@/types/type";

interface FoodStatsCardProps {
  foodTotals: FoodTotals;
  mealGoals: FoodUserGoals;
  onSetFoodEntry: () => void;
}

const FoodStatsCard: React.FC<FoodStatsCardProps> = ({
  foodTotals,
  mealGoals,
  onSetFoodEntry,
}) => {
  const [showCaloriesLeft, setShowCaloriesLeft] = useState(false);

  return (
    <View
      style={{
        borderRadius: 50,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
      }}
      className="bg-white p-5"
    >
      <FoodHeader
        totalCalories={foodTotals.calories}
        onSetFoodEntry={onSetFoodEntry}
        showCaloriesLeft={showCaloriesLeft}
        onToggleMode={() => setShowCaloriesLeft((prev) => !prev)}
      />

      <View className="flex-row justify-center items-center gap-5">
        <MacroProgressCircle
          icon="leaf"
          color="#22C55E"
          backgroundColor="#BBF7D0"
          label={showCaloriesLeft ? "carbs left" : "carbs taken"}
          current={
            showCaloriesLeft
              ? Math.max(mealGoals.carbs - foodTotals.carbs, 0)
              : foodTotals.carbs
          }
          goal={mealGoals.carbs}
        />
        <MacroProgressCircle
          icon="fish"
          color="#3B82F6"
          backgroundColor="#BFDBFE"
          label={showCaloriesLeft ? "protein left" : "protein taken"}
          current={
            showCaloriesLeft
              ? Math.max(mealGoals.protein - foodTotals.protein, 0)
              : foodTotals.protein
          }
          goal={mealGoals.protein}
        />
        <MacroProgressCircle
          icon="water"
          color="#F59E0B"
          backgroundColor="#FED7AA"
          label={showCaloriesLeft ? "fats left" : "fats taken"}
          current={
            showCaloriesLeft
              ? Math.max(mealGoals.fat - foodTotals.fat, 0)
              : foodTotals.fat
          }
          goal={mealGoals.fat}
        />
      </View>

      <View className="mt-4"></View>
    </View>
  );
};

export default FoodStatsCard;
