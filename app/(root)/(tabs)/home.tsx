import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { images } from "@/constants";
import { Link, router } from "expo-router";
import { fetchAPI } from "@/lib/fetch";
import { colors } from "@/constants";
import { graphqlRequest } from "@/lib/graphqlRequest";
interface UserData {
  name: string;
  activityLevel: string;
  birthday: string;
  gender: string;
  initialWeight: number;
  height: number;
  goal: string;
}

const calculateAge = (birthdayString: string | Date | any): number => {
  if (!birthdayString) return 0;

  // Handle different date formats
  let birthDate: Date;

  if (typeof birthdayString === 'string') {
    // Try parsing ISO date string
    birthDate = new Date(birthdayString);
  } else if (birthdayString instanceof Date) {
    birthDate = birthdayString;
  } else {
    return 0;
  }

  // Check if date is valid
  if (isNaN(birthDate.getTime())) {
    console.log('Invalid birthday:', birthdayString);
    return 0;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

const Home = () => {
  const { user: clerkUser } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!clerkUser) return;
      try {
        setLoading(true);
        const data = await graphqlRequest(
          `
            query GetUser($clerkId: String!) {
              user(clerkId: $clerkId) {
                name
                activityLevel
                birthday
                gender
                initialWeight
                height
                goal
              }
            }
          `,
          { clerkId: clerkUser.id }
        );
        console.log('User data received:', data.user);
        console.log('Birthday value:', data.user?.birthday, 'Type:', typeof data.user?.birthday);
        setUserData(data.user);
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
      <SafeAreaView className="bg-white flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="bg-white flex-1">
      <Text className="text-black text-3xl font-benzinBold mb-6">
        Welcome, {userData?.name?.split(" ")[0]}
      </Text>
      <View className="flex-1 justify-center items-center px-4">
        {userData ? (
          <View className="space-y-2 items-center">
            <Text className="text-black text-xl font-benzin">
              Your activity level: {userData.activityLevel}
            </Text>
            <Text className="text-black text-xl font-benzin">
              Your age:{" "}
              {userData?.birthday ? calculateAge(userData.birthday) : "-"}
            </Text>
            <Text className="text-black text-xl font-benzin">
              Your height: {userData.height} cm
            </Text>
            <Text className="text-black text-xl font-benzin">
              You are: {userData.gender}
            </Text>
            <Text className="text-black text-xl font-benzin">
              Your Goal: {userData.goal}
            </Text>
            <Text className="text-black text-xl font-benzin">
              Your initial weight: {userData.initialWeight} kg
            </Text>
          </View>
        ) : (
          <Text className="text-black mt-5">Could not load user data.</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Home;
