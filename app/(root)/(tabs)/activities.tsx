import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { colors } from "@/constants";
import CustomButton from "@/components/shared/CustomButton";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { FontAwesome5 } from "@expo/vector-icons";
import { Page } from "openai/pagination";
import { useRouter } from "expo-router";

const programs = [
  {
    name: "Legs",
    exercises: [
      {
        exerciseId: "0br45wL",
        name: "push-up inside leg kick",
        gifUrl: "https://static.exercisedb.dev/media/0br45wL.gif",
        targetMuscles: ["glutes"],
        bodyParts: ["upper legs"],
        equipments: ["body weight"],
        secondaryMuscles: ["quadriceps", "hamstrings", "calves", "core"],
        instructions: [
          "Step:1 Start in a push-up position with your hands slightly wider than shoulder-width apart and your feet together.",
          "Step:2 Lower your body towards the ground by bending your elbows, keeping your back straight and your core engaged.",
          "Step:3 As you push back up, lift one leg off the ground and kick it out to the side, keeping it straight.",
          "Step:4 Lower your leg back down and repeat the push-up, then switch to the other leg.",
          "Step:5 Continue alternating leg kicks with each push-up repetition.",
        ],
      },
      {
        exerciseId: "ecl28tP",
        name: "dumbbell contralateral forward lunge",
        gifUrl: "https://static.exercisedb.dev/media/ecl28tP.gif",
        targetMuscles: ["glutes"],
        bodyParts: ["upper legs"],
        equipments: ["dumbbell"],
        secondaryMuscles: ["quadriceps", "hamstrings", "calves"],
        instructions: [
          "Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand.",
          "Step:2 Take a step forward with your right foot, keeping your back straight and core engaged.",
          "Step:3 Lower your body by bending both knees until your right thigh is parallel to the ground.",
          "Step:4 Push through your right heel to return to the starting position.",
          "Step:5 Repeat with your left leg.",
          "Step:6 Alternate legs for the desired number of repetitions.",
        ],
      },
    ],
  },
];

const Activities = () => {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-[#F7F3E9]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <PageHeader
          title="Activities/Workouts"
          actionText=""
          onActionPress={() => {}}
        />
        <Text className="text-3xl font-interExtraBold">Programs</Text>
        <Text className="text-2xl font-InterBold">
          My Programs ({programs.length})
        </Text>

        <View className="flex flex-wrap flex-row gap-4 mt-4">
          {programs.map((program, index) => (
            <TouchableOpacity
              key={index}
              className="w-[48%] h-36 rounded-2xl p-2 border border-gray-300"
              onPress={() => {
                setSelectedProgram(program);
                setModalVisible(true);
              }}
            >
              <Text className="text-xl font-interBold">{program.name}</Text>
              <Text className="text-gray-700 font-inter">
                {program.exercises.map((e) => e.name).join(", ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-11/12 bg-white rounded-3xl p-4">
            <View className="flex-row justify-between items-center mb-2">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 rounded-full bg-gray-200 justify-center items-center"
              >
                <Text className="text-xl">×</Text>
              </TouchableOpacity>

              <View className="w-8"></View>
            </View>

            <Text className="text-center text-2xl font-interExtraBold mb-4">
              {selectedProgram?.name}
            </Text>

            <ScrollView
              style={{ maxHeight: 300 }}
              showsVerticalScrollIndicator={false}
            >
              {selectedProgram?.exercises.map((ex, i) => {
                const imageUrl = ex.gifUrl;
                return (
                  <View
                    key={i}
                    className="flex-row items-center justify-between mb-4"
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <Image
                        source={{ uri: imageUrl }}
                        className="w-12 h-12 rounded-lg bg-gray-200"
                      />
                      <View className="ml-3 flex-1">
                        <Text className="text-lg font-interBold">
                          3 × {ex.name}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          {ex.targetMuscles[0]}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      className="w-8 h-8 rounded-full bg-blue-100 justify-center items-center"
                      onPress={() => {
                        router.push({
                          pathname: "/exercise-detail",
                          params: {
                            name: ex.name,
                            gifUrl: ex.gifUrl,
                            targetMuscles: JSON.stringify(ex.targetMuscles),
                            equipments: JSON.stringify(ex.equipments),
                            instructions: JSON.stringify(ex.instructions),
                            secondaryMuscles: JSON.stringify(
                              ex.secondaryMuscles,
                            ),
                          },
                        });
                      }}
                    >
                      <FontAwesome5 name="question" size={16} color="#22C55E" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity className="bg-green-400 p-4 rounded-2xl mt-4">
              <Text className="text-center text-white text-lg font-interExtraBold">
                Start Workout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Activities;
