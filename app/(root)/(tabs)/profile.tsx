import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import * as Linking from "expo-linking";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import CustomButton from "@/components/shared/CustomButton";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { fetchAPI } from "@/lib/fetch";
import { colors } from "@/constants";

const Profile = () => {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!clerkUser) return;

      try {
        const response = await fetchAPI(`/(api)/user?clerkId=${clerkUser.id}`, {
          method: "GET",
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [clerkUser]);

  const handleSignOut = async () => {
    try {
      await signOut();
      Linking.openURL(Linking.createURL("/"));
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const handleNavigateToTrackWeight = () => {
    router.push("/(root)/track-weight");
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-green-200 flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-green-200">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        {/* User Profile Section */}
        <View className="items-center mb-6">
          <Image
            source={{
              uri: clerkUser?.imageUrl || "https://via.placeholder.com/150",
            }}
            className="w-24 h-24 rounded-full mb-4"
          />
          <Text className="text-3xl font-benzinBold text-gray-800">
            {userData?.name?.split(" ")[0]}
          </Text>
        </View>

        {/* Settings Section */}
        <View
          style={{
            borderRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 8,
          }}
          className="bg-white p-6 mb-5"
        >
          <Text className="text-2xl font-benzinBold text-gray-800 mb-4">
            Settings
          </Text>

          {/* Unit System */}
          <View className="mb-4">
            <Text className="text-base font-benzinMedium text-gray-600 mb-2">
              Unit System
            </Text>
            <View className="bg-gray-100 rounded-xl px-4 py-3">
              <Text className="text-base font-benzinBold text-gray-800">
                {userData?.unit_system === "imperial" ? "Imperial" : "Metric"}
              </Text>
            </View>
          </View>

          {/* Language */}
          <View>
            <Text className="text-base font-benzinMedium text-gray-600 mb-2">
              Language
            </Text>
            <View className="bg-gray-100 rounded-xl px-4 py-3">
              <Text className="text-base font-benzinBold text-gray-800">
                English (Coming soon)
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Details Section */}
        <View
          style={{
            borderRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 8,
          }}
          className="bg-white p-6 mb-5"
        >
          <Text className="text-2xl font-benzinBold text-gray-800 mb-4">
            Personal Details
          </Text>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-base font-benzinMedium text-gray-600 mb-2">
              Email
            </Text>
            <View className="bg-gray-100 rounded-xl px-4 py-3">
              <Text className="text-base font-benzinMedium text-gray-800">
                {clerkUser?.primaryEmailAddress?.emailAddress || "N/A"}
              </Text>
            </View>
          </View>

          {/* Height */}
          <View className="mb-4">
            <Text className="text-base font-benzinMedium text-gray-600 mb-2">
              Height
            </Text>
            <View className="bg-gray-100 rounded-xl px-4 py-3">
              <Text className="text-base font-benzinBold text-gray-800">
                {userData?.height ? `${userData.height} cm` : "Not set"}
              </Text>
            </View>
          </View>

          {/* Weight - Clickable to navigate */}
          <TouchableOpacity
            onPress={handleNavigateToTrackWeight}
            className="mb-4"
          >
            <Text className="text-base font-benzinMedium text-gray-600 mb-2">
              Weight
            </Text>
            <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row justify-between items-center">
              <Text className="text-base font-benzinBold text-gray-800">
                {userData?.initial_weight
                  ? `${userData.initial_weight} kg`
                  : "Not set"}
              </Text>
              <Text className="text-gray-500 text-sm font-benzinMedium">
                Tap to update →
              </Text>
            </View>
          </TouchableOpacity>

          {/* Activity Level */}
          <View>
            <Text className="text-base font-benzinMedium text-gray-600 mb-2">
              Activity Level
            </Text>
            <View className="bg-gray-100 rounded-xl px-4 py-3">
              <Text className="text-base font-benzinBold text-gray-800">
                {userData?.activity_level
                  ? userData.activity_level.charAt(0).toUpperCase() +
                    userData.activity_level.slice(1)
                  : "Not set"}
              </Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <CustomButton
          title="Sign Out"
          onPress={handleSignOut}
          className="bg-red-600"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
