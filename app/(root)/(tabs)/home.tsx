import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@clerk/clerk-expo'
import { images } from '@/constants'
import { Link, router } from 'expo-router'
import { fetchAPI } from '@/lib/fetch'

interface UserData {
  name: string;
  weight: string;
  height: string;
  weight_goal: string;
  daily_calorie_goal: number;
  goal: string;
}

const Home = () => {
  const { user: clerkUser } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!clerkUser) return;
      try {
        setLoading(true);
        const data = await fetchAPI(`/user?clerkId=${clerkUser.id}`, {
          method: "GET",
        });
        setUserData(data.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();

  }, [clerkUser]);

  if (loading) {
    return (
      <SafeAreaView className='bg-black flex-1 justify-center items-center'>
        <ActivityIndicator size="large" color="#B957FF" />
      </SafeAreaView>
    )
  }
  return (
    <SafeAreaView className="bg-black flex-1">
      <Text className="text-white text-3xl font-benzinBold mb-6">
        Welcome, {userData?.name?.split(" ")[0]}
      </Text>
      <View className="flex-1 justify-center items-center px-4">


        {userData ? (
          <View className="space-y-2 items-center">
            <Text className="text-white text-xl font-benzin">Your Goal: {userData.goal}</Text>
            <Text className="text-white text-xl font-benzin">Daily Calories: {userData.daily_calorie_goal} kcal</Text>
            <Text className="text-white text-xl font-benzin">Current Weight: {userData.weight} kg</Text>
            <Text className="text-white text-xl font-benzin">Target Weight: {userData.weight_goal || 'Not set'} kg</Text>
          </View>
        ) : (
          <Text className="text-white mt-5">Could not load user data.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

export default Home