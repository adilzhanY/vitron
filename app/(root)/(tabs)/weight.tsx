import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/shared/CustomButton';
import RadialChart from '@/components/weight/RadialChart';
import { WeightEntry } from '@/types/type';
import WeightAreaChart from '@/components/weight/WeightAreaChart';
import { useUser } from '@clerk/clerk-expo';
import { fetchAPI } from '@/lib/fetch';
import { format, parseISO } from 'date-fns';
import { router, useFocusEffect } from 'expo-router';
import InputField from '@/components/shared/InputField';
import {colors} from '@/constants';

interface WeightGoalData {
  startWeight: number;
  targetWeight: number;
  // currentWeight: number;
  checkpoints: number;
}

interface UserData {
  goal: 'lose weight' | 'gain weight' | 'be fit';
  heightCm?: number | null;
  // weight_goal: number;
  // start_weight: number;
  // checkpoints: number;
}

const Weight = () => {
  const { user: clerkUser } = useUser();
  // User's weight data
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  // User's data
  const [userData, setUserData] = useState<UserData | null>(null);
  // User's goal weight data
  const [weightGoalData, setWeightGoalData] = useState<WeightGoalData | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingGoal, setSavingGoal] = useState(false);

  const [nextCheckpointWeight, setNextCheckpointWeight] = useState<number>(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newGoalWeight, setNewGoalWeight] = useState("");
  const [newCheckpoints, setNewCheckpoints] = useState('9');

  // Calculating daily calorie goal
  const estimateMaintenanceCalories = (weightKg: number) => Math.round(weightKg * 30);
  const computeDailyCalorieGoal = (
    goal: UserData['goal'],
    currentW: number,
    targetW: number
  ) => {
    const maintenance = estimateMaintenanceCalories(currentW || targetW);
    // conservative defaults; tweak as needed
    const deficit = 500;
    const surplus = 300;

    if (goal === 'lose weight') return Math.max(maintenance - deficit, 1200);
    if (goal === 'gain weight') return maintenance + surplus;
    return maintenance; // be fit
  };

  // Fetching all data
  const fetchAllData = useCallback(async () => {
    if (!clerkUser) return;
    try {
      setLoading(true);
      const [weightResponse, userResponse, weightGoalResponse] = await Promise.all([
        fetchAPI(`/weights?clerkId=${clerkUser.id}`),
        fetchAPI(`/user?clerkId=${clerkUser.id}`),
        fetchAPI(`/weight-goals?clerkId=${clerkUser.id}`)
      ]);

      const formattedData: WeightEntry[] = (weightResponse?.data ?? [])
        .map((entry: any) => ({
          weight: parseFloat(entry.weight),
          date: entry.logged_at || entry.date,
        }))
        .filter((e: WeightEntry) => !Number.isNaN(e.weight) && e.date)
        .sort((a: WeightEntry, b: WeightEntry) => {
          const da = new Date(a.date).getTime();
          const db = new Date(b.date).getTime();
          return db - da; // DESC
        });

      // Normalize user data to expected shape
      const rawUser = userResponse?.data ?? {};
      const normalizedUser: UserData = {
        goal: rawUser.goal ?? 'be fit',
        heightCm: rawUser.height_cm ?? rawUser.heightCm ?? null,
      };

      const rawGoals = weightGoalResponse?.data ?? null;

      // pick latest active goal if array; else use the object
      let selectedGoal: any | null = null;
      if (Array.isArray(rawGoals)) {
        if (rawGoals.length > 0) {
          // Sort newest first by created_at (fallback to id if needed)
          const goalsSorted = rawGoals.slice().sort((a: any, b: any) => {
            const at = new Date(a.created_at ?? a.createdAt ?? 0).getTime();
            const bt = new Date(b.created_at ?? b.createdAt ?? 0).getTime();
            return bt - at;
          });
          const active = goalsSorted.find((g: any) => g.achieved === false || g.achieved === 0);
          selectedGoal = active ?? goalsSorted[0];
        }
      } else if (rawGoals && typeof rawGoals === 'object') {
        selectedGoal = rawGoals;
      }

      const oldestWeight = formattedData.at(-1)?.weight ?? 0;
      const mostRecentWeight = formattedData[0]?.weight ?? 0;

      const normalizedGoal: WeightGoalData | null = selectedGoal
        ? {
          startWeight: Number.parseFloat(
            String(selectedGoal.start_weight ?? selectedGoal.startWeight ?? oldestWeight)
          ),
          targetWeight: Number.parseFloat(
            String(selectedGoal.target_weight ?? selectedGoal.targetWeight ?? mostRecentWeight)
          ),
          checkpoints: Number.parseInt(String(selectedGoal.checkpoints ?? 9), 10),
        }
        : null;

      setWeightData(formattedData);
      setUserData(normalizedUser);
      setWeightGoalData(normalizedGoal);
    } catch (error) {
      console.error("Failed to fetch weight data:", error);
    } finally {
      setLoading(false);
    }
  }, [clerkUser]);

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [fetchAllData])
  );


  const {
    startWeight,
    goalWeight,
    currentWeight,
    radialChartEntries,
    userGoal,
    checkpoints,
    startDateISO,
  } = useMemo(() => {
    if (weightData.length === 0 || !userData) {
      return {
        startWeight: 0,
        goalWeight: 0,
        currentWeight: 0,
        radialChartEntries: [],
        userGoal: 'be fit' as const,
        checkpoints: 0,
        startDateISO: null as string | null,
      };
    }
    // Most recent is first due to DESC sorting
    const mostRecentWeight = weightData[0].weight;

    // Oldest is last in DESC sorting
    const oldestWeight = weightData[weightData.length - 1].weight;
    const oldestDate = weightData[weightData.length - 1].date;

    // Use goal config if present; fallback to reasonable defaults
    const start = weightGoalData?.startWeight ?? oldestWeight;
    const goal = weightGoalData?.targetWeight ?? mostRecentWeight;
    const chkpts = weightGoalData?.checkpoints ?? 9;

    const entriesForRadial = weightData
      .slice()
      .reverse()
      .map(e => e.weight);

    return {
      startWeight: start,
      goalWeight: goal,
      currentWeight: mostRecentWeight,
      radialChartEntries: entriesForRadial,
      userGoal: userData.goal,
      checkpoints: chkpts,
      startDateISO: oldestDate ?? null,
    };
  }, [weightData, userData, weightGoalData]);


  // Counting BMI
  const bmi = useMemo(() => {
    if (!userData?.heightCm || !currentWeight) return null;
    const h = userData.heightCm / 100;
    if (!h) return null;
    return currentWeight / (h * h);
  }, [userData?.heightCm, currentWeight]);

  // Set goal modal
  const openSetGoalModal = useCallback(() => {
    // Pre-fill modal from the current goal
    setNewGoalWeight(goalWeight ? String(goalWeight) : '');
    setNewCheckpoints(checkpoints ? String(checkpoints) : '9');
    setModalVisible(true);
  }, [goalWeight, checkpoints]);


  const handleTrackWeight = () => {
    router.push('/track-weight');
  }
  // const handleSetGoal = () => {
  // router.push('/set-goal');
  // }
  const handleSaveGoal = useCallback(async () => {
    if (!clerkUser) return;

    const parsedGoal = parseFloat(newGoalWeight);
    const parsedCheckpoints = parseInt(newCheckpoints, 10);

    if (Number.isNaN(parsedGoal) || parsedGoal <= 0) {
      Alert.alert('Invalid goal', 'Please enter a valid goal weight.');
      return;
    }
    if (Number.isNaN(parsedCheckpoints) || parsedCheckpoints < 1 || parsedCheckpoints > 50) {
      Alert.alert('Invalid checkpoints', 'Please enter a checkpoints count between 1 and 50.');
      return;
    }

    // Use the most recent weight as the start of the goal
    const startWeightForGoal = currentWeight || weightData[0]?.weight || 0;

    const dailyCalorieGoal = computeDailyCalorieGoal(
      userData?.goal ?? 'be fit',
      startWeightForGoal,
      parsedGoal
    );

    const payload = {
      clerkId: clerkUser.id,
      // Persist startWeight as the current configured start (or fall back to oldest known)
      startWeight: startWeightForGoal,
      targetWeight: parsedGoal,
      checkpoints: parsedCheckpoints,
      dailyCalorieGoal: dailyCalorieGoal,
    };

    try {
      setSavingGoal(true);
      await fetchAPI('/weight-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setModalVisible(false);
      await fetchAllData(); // refresh UI from the server’s truth
    } catch (e) {
      console.error('Failed to save goal', e);
      Alert.alert('Error', 'Failed to save goal. Please try again.');
    } finally {
      setSavingGoal(false);
    }
  }, [clerkUser, newGoalWeight, newCheckpoints, currentWeight, weightData, userData?.goal, fetchAllData]);



  if (loading) {
    return (
      <SafeAreaView className='bg-black flex-1 justify-center items-center'>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    )
  }
  if (weightData.length === 0 && !loading) {
    return (
      <SafeAreaView className='bg-white flex-1 justify-center items-center p-4'>
        <Text className='text-black text-lg font-benzin text-center'>No weight entries found.</Text>
        <View className='h-4' />
        <CustomButton title="Track Your First Weight" onPress={handleTrackWeight} />
      </SafeAreaView>
    )
  }





  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-black text-2xl font-benzinExtraBold">Track Your Weight</Text>
          <TouchableOpacity>
            <Text className="text-gray-400 text-base font-benzinExtraBold">Entries</Text>
          </TouchableOpacity>
        </View>

        {/* Checkpoints */}
        <View className='flex-row justify-between items-center mt-4'>
          {/* BMI */}
          <View className="items-center">
            <View className='flex-row'>
              <Text className="text-gray-400 text-sm font-benzinMedium">BMI</Text>
              <FontAwesome5 name="weight" size={16} color={colors.black} style={{ marginLeft: 4 }} />
            </View>
            <Text className="text-black text-xl font-benzinBold">{bmi ? bmi.toFixed(1) : '-'}</Text>
          </View>
          {/* Next Checkpoint */}
          <View className="items-center">
            <View className='flex-row'>
              <Text className="text-gray-400 text-sm font-benzinMedium">Next</Text>
              <FontAwesome5 name="flag-checkered" size={16} color={colors.black} style={{ marginLeft: 4 }} />
            </View>
            <Text className="text-black text-xl font-benzinBold">
              {parseFloat(String(nextCheckpointWeight || 0)).toFixed(1)} kg
            </Text>
          </View>
        </View>
        {/* Radial Chart */}
        <RadialChart
          startWeight={startWeight}
          goalWeight={goalWeight}
          checkpoints={checkpoints}
          entries={radialChartEntries}
          goal={userGoal}
          onNextCheckpointCalculated={setNextCheckpointWeight}
          onSetNewGoal={openSetGoalModal}
        />

        {/* Start & Goal */}
        <View className="flex-row justify-between mx-4 mb-6">
          <View>
            <View className='flex-row'>
              <Text className="text-gray-400 text-base font-benzinExtraBold">Start</Text>
              <FontAwesome5 name="rocket" size={16} color={colors.black} style={{ marginLeft: 4 }} />
            </View>
            <Text className="text-black text-xl font-benzinExtraBold">{startWeight ? `${startWeight.toFixed(1)} kg` : '-'}</Text>
            <Text className="text-gray-400 text-sm font-benzinExtraBold">
              {startDateISO ? format(parseISO(startDateISO), 'd MMM yyyy') : '-'}
            </Text>
          </View>
          <View className="items-end">
            <View className='flex-row'>
              <Text className="text-gray-400 text-base font-benzinExtraBold">Goal</Text>
              <FontAwesome5 name="trophy" size={16} color={colors.black} style={{ marginLeft: 4 }} />
            </View>
            <Text className="text-black text-xl font-benzinExtraBold">
              {goalWeight ? `${goalWeight.toFixed(1)} kg` : '-'}
            </Text>
            <CustomButton title='Set goal' onPress={openSetGoalModal} />
          </View>
        </View>

        {/* Track button */}
        <CustomButton title="Track Weight" onPress={handleTrackWeight} />
        {/* Weight Streak */}
        <View className="flex-row gap-2 px-2 mt-4">
          {/* Active Streak */}
          <View className="flex-1 bg-white border border-yellow-400 rounded-2xl p-4 shadow">
            <Text className="text-yellow-400 text-sm font-benzinExtraBold">
              Active Streak
            </Text>
            <View className="flex-row items-center">
              <Text className="text-black text-3xl font-benzinBold mt-2">
                5
              </Text>
              <FontAwesome5 name="fire" size={24} color="#facc15" style={{ marginLeft: 4 }} />
            </View>
            <Text className="text-gray-300 text-sm mt-1 font-benzinBold">
              days in a row
            </Text>
          </View>

          {/* Longest Streak */}
          <View className="flex-1 bg-white border border-yellow-400 rounded-2xl p-4 shadow">
            <Text className="text-yellow-400 text-sm font-benzinExtraBold">
              Longest Streak
            </Text>
            <View className="flex-row items-center">
              <Text className="text-black text-3xl font-benzinBold mt-2">
                12
              </Text>
              <FontAwesome5 name="star" size={24} solid color="#fde047" style={{ marginLeft: 4 }} />
            </View>
            <Text className="text-gray-300 text-sm mt-1 font-benzinBold">
              best record
            </Text>
          </View>
        </View>

 
        {/* Entries */}
        <View className='flex flex-col mt-5'>
          <WeightAreaChart
            entries={weightData}
          />
        </View>

        <View className='mt-8 p-4 bg-white rounded-lg'>
          <Text className='text-black font-benzinExtraBold text-lg mb-2'>All Entries</Text>
          {weightData.map((entry, index) => (
            <View key={index} className='flex-row justify-between py-1'>
              <Text className='text-gray-300 font-benzinBold'>{format(parseISO(entry.date), 'eeee, d MMM yyyy')}</Text>
              <Text className='text-black font-benzinBold'>{entry.weight.toFixed(1)} kg</Text>
            </View>
          ))}

        </View>
        <View className='h-[500px]'></View>
      </ScrollView>
      {/* New Goal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/80">
          <View className="w-11/12 bg-white rounded-2xl p-6">
            <Text className="text-black text-2xl font-benzinBold mb-4">Set a New Goal</Text>

            <InputField
              label="New Goal Weight (kg)"
              value={newGoalWeight}
              onChangeText={setNewGoalWeight}
              keyboardType="numeric"
              placeholder="e.g., 75.5"
            />
            <View className='h-4' />
            <InputField
              label="Number of Checkpoints"
              value={newCheckpoints}
              onChangeText={setNewCheckpoints}
              keyboardType="numeric"
              placeholder="e.g., 9"
            />

            <View className="flex-row mt-6">
              <CustomButton
                title="Cancel"
                onPress={() => setModalVisible(false)}
                className="flex-1 bg-gray-600 mr-2"
              />
              <CustomButton
                title={savingGoal ? 'Saving...' : 'Save Goal'}
                onPress={savingGoal ? undefined : handleSaveGoal}
                className="flex-1 ml-2"
              />
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default Weight;
