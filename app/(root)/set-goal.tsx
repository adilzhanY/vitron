import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import InputField from "@/components/shared/InputField";
import CustomButton from "@/components/shared/CustomButton";
import { useUser } from "@clerk/clerk-expo";
import { fetchAPI } from "@/lib/fetch";

const SetGoal = () => {
  const { user: clerkUser } = useUser();
  const [newGoalWeight, setNewGoalWeight] = useState("");
  const [newCheckpoints, setNewCheckpoints] = useState("9");
  const [newStartWeight, setNewStartWeight] = useState("");
  const handleSetNewGoal = async () => {
    if (!newGoalWeight || !newCheckpoints || !clerkUser) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    // Get current weight from the most recent weight entry
    if (!newStartWeight) {
      Alert.alert("Error", "Please enter your current/start weight.");
      return;
    }

    try {
      // Send correct field names
      await fetchAPI("/(api)/weight-goals", {
        method: "POST",
        body: JSON.stringify({
          clerkId: clerkUser.id,
          startWeight: parseFloat(newStartWeight),
          targetWeight: parseFloat(newGoalWeight),
          checkpoints: parseInt(newCheckpoints, 10),
          dailyCalorieGoal: null,
        }),
      });
      console.log("Success, weight goal and meal goal created");
      Alert.alert("Success", "Your new weight goal has been set!");
      setNewGoalWeight("");
      setNewCheckpoints("9");
      setNewStartWeight("");
      router.back();
    } catch (error) {
      console.error("Failed to set new goal:", error);
      Alert.alert("Error", "Failed to set new goal. Please try again.");
    }
  };

  return (
    <SafeAreaView className="bg-black flex-1">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View className="bg-black px-4 py-3 border-b border-gray-800 flex-row items-center">
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.push("/weight")}
          className="mr-4"
        >
          <FontAwesome5 name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Title */}
        <Text className="text-white text-xl font-benzinExtraBold">
          Set Your Weight Goal
        </Text>
      </View>
      <View className="flex-1 justify-center items-center bg-black/80">
        <View className="w-11/12 bg-[#1C1C1E] rounded-2xl p-6">
          <Text className="text-white text-2xl font-benzinBold mb-4">
            Set a New Goal
          </Text>

          <InputField
            label="Current/Start Weight (kg)"
            value={newStartWeight}
            onChangeText={setNewStartWeight}
            keyboardType="numeric"
            placeholder="e.g., 85.0"
          />
          <View className="h-4" />

          <InputField
            label="Target Weight (kg)"
            value={newGoalWeight}
            onChangeText={setNewGoalWeight}
            keyboardType="numeric"
            placeholder="e.g., 75.5"
          />
          <View className="h-4" />
          <InputField
            label="Number of Checkpoints"
            value={newCheckpoints}
            onChangeText={setNewCheckpoints}
            keyboardType="numeric"
            placeholder="e.g., 9"
          />

          <View className="flex-row mt-6">
            <CustomButton
              title="Save Goal"
              onPress={handleSetNewGoal}
              className="flex-1 ml-2"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SetGoal;

