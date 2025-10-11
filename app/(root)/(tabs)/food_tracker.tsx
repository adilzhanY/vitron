import { View, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { colors } from '@/constants'; 
import {FoodTotals, FoodUserGoals, MealType} from '@/types/type';

import CustomButton from '@/components/shared/CustomButton';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import FoodHeader from '@/components/food/FoodHeader';
import FoodDateSelector from '@/components/food/FoodDateSelector';
import MacroProgressBar from '@/components/food/MacroProgressBar';
import FoodEntryModal from '@/components/food/FoodEntryModal';
import { fetchAPI } from '@/lib/fetch';

const FoodTracker = () => {
  const { user: clerkUser } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  
  // State for food data and user goals
  const [foodTotals, setFoodTotals] = useState<FoodTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [userGoals, setUserGoals] = useState<UserGoals>({ calories: 2200, protein: 160, carbs: 250, fat: 70 });

  // Fetch data when the component mounts or the date changes
  const fetchFoodData = useCallback(async (date: Date) => {
    if (!clerkUser) return;
    setLoading(true);
    try {
      // const dateString = date.toISOString().split('T')[0];
      // const res = await fetchAPI(`/food?clerkId=${clerkUser.id}&date=${dateString}`);
      // setFoodTotals(res.totals);
      // setUserGoals(res.goals);

      // MOCK DATA for demonstration purposes
      console.log(`Fetching data for ${date.toDateString()}`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        setFoodTotals({ calories: 1823, protein: 120, carbs: 195, fat: 55 });
      } else {
        setFoodTotals({ calories: 1540, protein: 95, carbs: 160, fat: 35 });
      }
      setUserGoals({ calories: 2200, protein: 160, carbs: 250, fat: 70 });
      
    } catch (error) {
      console.error("Failed to fetch food data:", error);
    } finally {
      setLoading(false);
    }
  }, [clerkUser]);

  useEffect(() => {
    fetchFoodData(selectedDate);
  }, [selectedDate, fetchFoodData]);

  const handleCreateNewMeal = useCallback(async (newMeal: {
    name: string,
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    mealType: MealType,
    isSaved: boolean,
    entryDate: string,
    date: string,
  }) => {
    if (!clerkUser) return;
    
    const payload = {
      clerkId: clerkUser?.id,
      name: newMeal.name,
      calories: newMeal.calories,
      protein: newMeal.protein,
      carbs: newMeal.carbs,
      fat: newMeal.fat,
      mealType: 'breakfast',
      isSaved: false,
      entryDate: selectedDate.toISOString().split('T')[0],
    };
    console.log(payload);
    try {
      await fetchAPI('/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log("New meal created in db");
      // Refetch data to update the UI
      fetchFoodData(selectedDate); 
    } catch (error) {
      console.error("Failed to save meal: ", error);
    }
  }, [clerkUser, selectedDate, fetchFoodData]);

  if (loading) {
    return (
      <SafeAreaView className='bg-white flex-1 justify-center items-center'>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-green-200">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <PageHeader title="Track your food" />
        <View>
          <FoodDateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

        </View>
        
        <View style={{borderRadius: 50}} className="bg-white p-5">

          <FoodHeader
            totalCalories={foodTotals.calories}
            onSetFoodEntry={() => setModalVisible(true)}
          />

          <View className="mt-4">
            <MacroProgressBar
              label="Protein"
              current={foodTotals.protein}
              goal={userGoals.protein}
              color="bg-sky-500"
            />
            <MacroProgressBar
              label="Carbs"
              current={foodTotals.carbs}
              goal={userGoals.carbs}
              color="bg-green-500"
            />
            <MacroProgressBar
              label="Fat"
              current={foodTotals.fat}
              goal={userGoals.fat}
              color="bg-amber-500"
            />
          </View>
          
          <View className="mt-4">
          </View>
        </View>
        <View className="h-[500px]"></View>
                    <CustomButton
              title={'Create new meal'}
              onPress={handleCreateNewMeal}
            />

      </ScrollView>
      <FoodEntryModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleCreateNewMeal}
      />
    </SafeAreaView>
  );
};

export default FoodTracker;
