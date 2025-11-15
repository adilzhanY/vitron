import { View, ScrollView, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { capitalizeWords } from "@/lib/utils";
export default function ExerciseDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Parse the data from params
  const exercise = {
    name: params.name as string,
    gifUrl: params.gifUrl as string,
    targetMuscles: JSON.parse(params.targetMuscles as string),
    equipments: JSON.parse(params.equipments as string),
    instructions: JSON.parse(params.instructions as string),
    secondaryMuscles: params.secondaryMuscles
      ? JSON.parse(params.secondaryMuscles as string)
      : [],
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
        >
          <FontAwesome5 name="arrow-left" size={18} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-interBold flex-1 text-center mr-10">
          Exercise Details
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* GIF Section - 2/3 of screen */}
        <View className="h-[400px] bg-gray-100 justify-center items-center">
          <Image
            source={{ uri: exercise.gifUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </View>

        {/* Exercise Info */}
        <View className="p-4">
          <Text className="text-2xl font-interExtraBold mb-2">
            {capitalizeWords(exercise.name)}
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-4">
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 font-interBold">
                {capitalizeWords(exercise.targetMuscles[0])}
              </Text>
            </View>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-700 font-interBold">
                {capitalizeWords(exercise.equipments[0])}
              </Text>
            </View>
          </View>

          {/* Instructions */}
          <Text className="text-xl font-interBold mb-3">Instructions</Text>
          {exercise.instructions.map((instruction: string, idx: number) => (
            <View key={idx} className="flex-row mb-3">
              <Text className="text-base font-inter text-gray-700">
                {instruction}
              </Text>
            </View>
          ))}

          {/* Secondary Muscles */}
          {exercise.secondaryMuscles.length > 0 && (
            <View className="mt-4">
              <Text className="text-xl font-interBold mb-2">
                Secondary Muscles
              </Text>
              <Text className="text-base font-inter text-gray-700">
                {capitalizeWords(exercise.secondaryMuscles.join(", "))}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
