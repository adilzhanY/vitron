import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Keyboard,
  Platform,
} from "react-native";
import Modal from "react-native-modal";
import * as Haptics from "expo-haptics";
import Svg, { Path } from "react-native-svg";
import { WorkoutProgram, WorkoutExercise, WorkoutSet, WorkoutSummary } from "@/types/type";
import { capitalizeWords } from "@/lib/utils";

interface WorkoutBottomSheetProps {
  isVisible: boolean;
  program: WorkoutProgram | null;
  onClose: () => void;
}

interface NumberPadProps {
  onNumberPress: (num: string) => void;
  onBackspace: () => void;
  onNext: () => void;
  onRPE: () => void;
}

const NumberPad: React.FC<NumberPadProps> = ({
  onNumberPress,
  onBackspace,
  onNext,
  onRPE,
}) => {
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  return (
    <View className="bg-[#2C2C2E] p-2">
      <View className="flex-row flex-wrap">
        {/* Numbers 1-9, 0 */}
        {numbers.map((num) => (
          <TouchableOpacity
            key={num}
            onPress={() => onNumberPress(num)}
            className="w-[33.33%] h-16 justify-center items-center"
          >
            <Text className="text-white text-3xl font-inter">{num}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom row with special buttons */}
      <View className="flex-row mt-2">
        <TouchableOpacity
          onPress={onRPE}
          className="flex-1 h-14 justify-center items-center bg-[#3A3A3C] rounded-lg mx-1"
        >
          <Text className="text-white text-lg font-interBold">⌨️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onBackspace}
          className="flex-1 h-14 justify-center items-center bg-[#3A3A3C] rounded-lg mx-1"
        >
          <Text className="text-white text-2xl font-interBold">⌫</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 h-14 justify-center items-center bg-[#3A3A3C] rounded-lg mx-1">
          <Text className="text-white text-xl font-interBold">−</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 h-14 justify-center items-center bg-[#3A3A3C] rounded-lg mx-1">
          <Text className="text-white text-xl font-interBold">+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNext}
          className="flex-1 h-14 justify-center items-center bg-blue-500 rounded-lg mx-1"
        >
          <Text className="text-white text-lg font-interBold">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const WorkoutBottomSheet: React.FC<WorkoutBottomSheetProps> = ({
  isVisible,
  program,
  onClose,
}) => {
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary | null>(null);
  const [activeInputs, setActiveInputs] = useState<{ [key: string]: string | null }>({});
  const [showNumberPad, setShowNumberPad] = useState(false);
  const [currentInputKey, setCurrentInputKey] = useState<string | null>(null);
  const [currentInputValue, setCurrentInputValue] = useState("");
  const intervalRef = useRef<any>(null);
  const restTimerIntervalRef = useRef<any>(null);

  // Initialize exercises when modal opens
  useEffect(() => {
    if (isVisible && program) {
      const initialExercises: WorkoutExercise[] = program.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        gifUrl: ex.gifUrl,
        targetMuscles: ex.targetMuscles,
        equipments: ex.equipments,
        sets: [
          {
            id: `${ex.exerciseId}-set-1`,
            setNumber: 1,
            kg: 0,
            reps: 0,
            isCompleted: false,
          },
        ],
      }));
      setWorkoutExercises(initialExercises);
      setStartTime(Date.now());
      setElapsedTime(0);
    } else {
      // Reset when closing
      setWorkoutExercises([]);
      setStartTime(null);
      setElapsedTime(0);
      setActiveInputs({});
      setShowNumberPad(false);
      setCurrentInputKey(null);
      setCurrentInputValue("");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (restTimerIntervalRef.current) {
        clearInterval(restTimerIntervalRef.current);
        restTimerIntervalRef.current = null;
      }
    }
  }, [isVisible, program]);

  // Stopwatch timer
  useEffect(() => {
    if (startTime && !showSummary) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTime, showSummary]);

  // Rest timer countdown
  useEffect(() => {
    if (!showSummary) {
      restTimerIntervalRef.current = setInterval(() => {
        setWorkoutExercises((prevExercises) => {
          const now = Date.now();
          let shouldPlaySound = false;

          const updatedExercises = prevExercises.map((exercise) => ({
            ...exercise,
            sets: exercise.sets.map((set) => {
              if (set.restTimerEndTime && now >= set.restTimerEndTime) {
                shouldPlaySound = true;
                return { ...set, restTimerEndTime: undefined };
              }
              return set;
            }),
          }));

          if (shouldPlaySound) {
            playNotificationSound();
          }

          return updatedExercises;
        });
      }, 1000);
    }

    return () => {
      if (restTimerIntervalRef.current) {
        clearInterval(restTimerIntervalRef.current);
      }
    };
  }, [showSummary]);

  const playNotificationSound = async () => {
    try {
      // Vibrate to notify user that rest time is over
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log("Rest timer completed!");
    } catch (error) {
      console.log("Error with haptic feedback:", error);
    }
  }; const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddSet = (exerciseId: string) => {
    setWorkoutExercises((prevExercises) =>
      prevExercises.map((ex) => {
        if (ex.exerciseId === exerciseId) {
          const newSetNumber = ex.sets.length + 1;
          const previousSet = ex.sets[ex.sets.length - 1];
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                id: `${exerciseId}-set-${newSetNumber}`,
                setNumber: newSetNumber,
                previousKg: previousSet?.kg,
                previousReps: previousSet?.reps,
                kg: 0,
                reps: 0,
                isCompleted: false,
              },
            ],
          };
        }
        return ex;
      })
    );
  };

  const handleSetComplete = (exerciseId: string, setId: string) => {
    setWorkoutExercises((prevExercises) =>
      prevExercises.map((ex) => {
        if (ex.exerciseId === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((set) => {
              if (set.id === setId && !set.isCompleted) {
                // Start 2-minute timer (120 seconds = 120000 ms)
                const restTimerEndTime = Date.now() + 120000;
                return { ...set, isCompleted: true, restTimerEndTime };
              }
              return set;
            }),
          };
        }
        return ex;
      })
    );
  };

  const handleInputChange = (
    exerciseId: string,
    setId: string,
    field: "kg" | "reps",
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    setWorkoutExercises((prevExercises) =>
      prevExercises.map((ex) => {
        if (ex.exerciseId === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((set) => {
              if (set.id === setId) {
                return { ...set, [field]: numValue };
              }
              return set;
            }),
          };
        }
        return ex;
      })
    );
  };

  const handleOpenNumberPad = (exerciseId: string, setId: string, field: "kg" | "reps") => {
    const key = `${exerciseId}-${setId}-${field}`;
    setCurrentInputKey(key);
    setCurrentInputValue("");
    setShowNumberPad(true);
  };

  const handleNumberPress = (num: string) => {
    setCurrentInputValue((prev) => prev + num);
  };

  const handleBackspace = () => {
    setCurrentInputValue((prev) => prev.slice(0, -1));
  };

  const handleNext = () => {
    if (currentInputKey && currentInputValue) {
      const [exerciseId, setId, field] = currentInputKey.split("-");
      handleInputChange(exerciseId, `${exerciseId}-set-${setId}`, field as "kg" | "reps", currentInputValue);
    }
    setShowNumberPad(false);
    setCurrentInputKey(null);
    setCurrentInputValue("");
  };

  const handleFinishWorkout = () => {
    const totalTime = elapsedTime;
    let totalReps = 0;
    let totalKgs = 0;
    let totalSets = 0;

    workoutExercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        if (set.isCompleted) {
          totalReps += set.reps;
          totalKgs += set.kg * set.reps;
          totalSets += 1;
        }
      });
    });

    const summary: WorkoutSummary = {
      totalTime,
      totalReps,
      totalExercises: workoutExercises.length,
      totalKgs,
      totalSets,
    };

    setWorkoutSummary(summary);
    setShowSummary(true);
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    setWorkoutSummary(null);
    onClose();
  };

  const getRemainingRestTime = (restTimerEndTime?: number) => {
    if (!restTimerEndTime) return null;
    const remaining = Math.max(0, Math.ceil((restTimerEndTime - Date.now()) / 1000));
    return remaining > 0 ? remaining : null;
  };

  if (!program) return null;

  return (
    <>
      <Modal
        isVisible={isVisible && !showSummary}
        onBackdropPress={onClose}
        onSwipeComplete={onClose}
        swipeDirection={["down"]}
        style={{ margin: 0, justifyContent: "flex-end" }}
        propagateSwipe
      >
        <View className="bg-white rounded-t-3xl max-h-[90%] pb-8">
          {/* Header */}
          <View className="p-4 border-b border-gray-200">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            <View className="flex-row justify-between items-center">
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 rounded-full bg-gray-200 justify-center items-center"
              >
                <Text className="text-xl">×</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFinishWorkout}
                className="bg-green-400 px-6 py-2 rounded-full"
              >
                <Text className="text-white font-interBold text-base">Finish</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-2xl font-interExtraBold mt-4">{program.name}</Text>
            <Text className="text-gray-600 font-inter mt-1">{formatTime(elapsedTime)}</Text>
            <Text className="text-gray-500 text-sm font-inter mt-1">Notes</Text>
          </View>

          {/* Exercises */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 0 }} // Full width for content
          >
            {workoutExercises.map((exercise, exIndex) => (
              <View key={exercise.exerciseId} className="mt-4">
                {/* Exercise Header */}
                <View className="flex-row justify-between items-center mb-2 px-3">
                  <Text
                    className="text-lg font-interBold text-green-500 flex flex-wrap mr-2"
                    style={{ flexShrink: 1 }}
                  >
                    {capitalizeWords(exercise.name)}
                  </Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity className="w-8 h-8 rounded-full bg-blue-100 justify-center items-center">
                      <Text className="text-blue-500 text-lg">✎</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="w-8 h-8 rounded-full bg-gray-200 justify-center items-center">
                      <Text className="text-gray-600">⋯</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Sets Table */}
                <View className="mt-2">
                  {/* Table Header */}
                  <View className="flex-row items-center mb-2">
                    <View style={{ width: 60 }} className="items-center">
                      <Text className="font-interBold text-base text-gray-700">Set</Text>
                    </View>
                    <View style={{ width: 100 }} className="items-center">
                      <Text className="font-interBold text-base text-gray-700">Previous</Text>
                    </View>
                    <View style={{ width: 100 }} className="items-center">
                      <Text className="font-interBold text-base text-gray-700">kg</Text>
                    </View>
                    <View style={{ width: 100 }} className="items-center">
                      <Text className="font-interBold text-base text-gray-700">Reps</Text>
                    </View>
                    <View style={{ width: 60 }} />
                  </View>

                  {/* Table Rows */}
                  {exercise.sets.map((set, setIndex) => {
                    const inputKeyKg = `${exercise.exerciseId}-${set.id}-kg`;
                    const inputKeyReps = `${exercise.exerciseId}-${set.id}-reps`;
                    const remainingRest = getRemainingRestTime(set.restTimerEndTime);

                    return (
                      <View key={set.id}>
                        <View
                          className={`flex-row items-center py-3 border-b border-gray-100 ${set.isCompleted ? "bg-green-100" : "bg-white"
                            }`}
                        >
                          {/* Set Number */}
                          <View style={{ width: 60 }} className="items-center">
                            <View className="bg-gray-100 rounded-full w-8 h-8 items-center justify-center">
                              <Text className="font-interBold text-base">{set.setNumber}</Text>
                            </View>
                          </View>

                          {/* Previous */}
                          <View style={{ width: 100 }} className="items-center">
                            <Text className="text-gray-400 font-inter text-base">—</Text>
                          </View>

                          {/* KG Input */}
                          <View style={{ width: 100 }} className="items-center">
                            <TouchableOpacity
                              onPress={() => {
                                if (!set.isCompleted) {
                                  setActiveInputs({ ...activeInputs, [inputKeyKg]: "kg" });
                                }
                              }}
                              className="bg-gray-100 rounded-xl px-4 py-2 min-w-[90px]"
                            >
                              {activeInputs[inputKeyKg] === "kg" && !set.isCompleted ? (
                                <TextInput
                                  autoFocus
                                  keyboardType="number-pad"
                                  value={set.kg > 0 ? set.kg.toString() : ""}
                                  onChangeText={(val) =>
                                    handleInputChange(exercise.exerciseId, set.id, "kg", val)
                                  }
                                  onBlur={() => {
                                    const newInputs = { ...activeInputs };
                                    delete newInputs[inputKeyKg];
                                    setActiveInputs(newInputs);
                                  }}
                                  className="text-center font-interBold text-base"
                                  placeholder="100"
                                  placeholderTextColor="#9CA3AF"
                                />
                              ) : (
                                <Text className="text-center font-interBold text-base">
                                  {set.kg > 0 ? set.kg : "100"}
                                </Text>
                              )}
                            </TouchableOpacity>
                          </View>

                          {/* Reps Input */}
                          <View style={{ width: 100 }} className="items-center">
                            <TouchableOpacity
                              onPress={() => {
                                if (!set.isCompleted) {
                                  setActiveInputs({ ...activeInputs, [inputKeyReps]: "reps" });
                                }
                              }}
                              className=" bg-gray-100 rounded-xl px-4 py-2 min-w-[90px]"
                            >
                              {activeInputs[inputKeyReps] === "reps" && !set.isCompleted ? (
                                <TextInput
                                  autoFocus
                                  keyboardType="number-pad"
                                  value={set.reps > 0 ? set.reps.toString() : ""}
                                  onChangeText={(val) =>
                                    handleInputChange(exercise.exerciseId, set.id, "reps", val)
                                  }
                                  onBlur={() => {
                                    const newInputs = { ...activeInputs };
                                    delete newInputs[inputKeyReps];
                                    setActiveInputs(newInputs);
                                  }}
                                  className="text-center font-interBold text-base"
                                  placeholder="1"
                                  placeholderTextColor="#9CA3AF"
                                />
                              ) : (
                                <Text className="text-center font-interBold text-base">
                                  {set.reps > 0 ? set.reps : "1"}
                                </Text>
                              )}
                            </TouchableOpacity>
                          </View>

                          {/* Done Button */}
                          <View style={{ width: 40 }} className="items-center">
                            <TouchableOpacity
                              onPress={() => handleSetComplete(exercise.exerciseId, set.id)}
                              disabled={set.isCompleted}
                              className={`rounded-lg p-2 ${set.isCompleted ? "bg-transparent" : "bg-transparent"
                                }`}
                            >
                              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <Path
                                  d="M20 6L9 17L4 12"
                                  stroke={set.isCompleted ? "#22C55E" : "#D1D5DB"}
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </Svg>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Rest Timer */}
                        {remainingRest && (
                          <View className="bg-blue-50 py-2 px-4 border-b border-gray-100">
                            <Text className="text-center text-blue-600 font-interBold text-sm">
                              Rest: {formatTime(remainingRest)}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Add Set Button */}
                <TouchableOpacity
                  onPress={() => handleAddSet(exercise.exerciseId)}
                  className="bg-gray-100 py-3 rounded-xl mt-3 mx-4"
                >
                  <Text className="text-center text-gray-700 font-interBold">+ Add Set</Text>
                </TouchableOpacity>

              </View>
            ))}

            <View className="h-20" />
          </ScrollView>
        </View>
      </Modal>

      {/* Summary Modal */}
      <Modal
        isVisible={showSummary}
        onBackdropPress={handleCloseSummary}
        style={{ margin: 0, justifyContent: "center", alignItems: "center" }}
      >
        <View className="bg-white rounded-3xl p-6 w-11/12 max-w-md">
          <Text className="text-2xl font-interExtraBold text-center mb-6">
            Workout Complete! 🎉
          </Text>

          <View className="space-y-4">
            <View className="flex-row justify-between py-3 border-b border-gray-200">
              <Text className="text-gray-600 font-inter">Total Time</Text>
              <Text className="font-interBold">
                {formatTime(workoutSummary?.totalTime || 0)}
              </Text>
            </View>

            <View className="flex-row justify-between py-3 border-b border-gray-200">
              <Text className="text-gray-600 font-inter">Total Exercises</Text>
              <Text className="font-interBold">{workoutSummary?.totalExercises || 0}</Text>
            </View>

            <View className="flex-row justify-between py-3 border-b border-gray-200">
              <Text className="text-gray-600 font-inter">Total Sets</Text>
              <Text className="font-interBold">{workoutSummary?.totalSets || 0}</Text>
            </View>

            <View className="flex-row justify-between py-3 border-b border-gray-200">
              <Text className="text-gray-600 font-inter">Total Reps</Text>
              <Text className="font-interBold">{workoutSummary?.totalReps || 0}</Text>
            </View>

            <View className="flex-row justify-between py-3">
              <Text className="text-gray-600 font-inter">Total Volume (kg)</Text>
              <Text className="font-interBold">{workoutSummary?.totalKgs || 0} kg</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCloseSummary}
            className="bg-green-400 py-4 rounded-2xl mt-6"
          >
            <Text className="text-center text-white text-lg font-interExtraBold">Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

export default WorkoutBottomSheet;
