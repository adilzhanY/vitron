import { View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// Refactored Imports
import { useWeightData } from '@/hooks/useWeightData';
import { saveWeightGoal } from '@/services/weightService';
import { computeDailyCalorieGoal } from '@/lib/utils';
import { colors } from '@/constants';

// Component Imports
import CustomButton from '@/components/shared/CustomButton';
import PageHeader from '@/components/shared/PageHeader';
import RadialChart from '@/components/weight/RadialChart';
import WeightAreaChart from '@/components/weight/WeightAreaChart';
import SetGoalModal from '@/components/weight/SetGoalModal';
import WeightStats from '@/components/weight/WeightStats';
import WeightGoalDisplay from '@/components/weight/WeightGoalDisplay';
import WeightEntriesList from '@/components/weight/WeightEntriesList';
import WeightStreaks from '@/components/weight/WeightStreaks';
import EmptyState from '@/components/shared/EmptyState';

const Weight = () => {
  const {
    loading,
    weightData,
    startWeight,
    goalWeight,
    currentWeight,
    startDate,
    bmi,
    radialChartEntries,
    longestStreak,
    activeStreak,
    userGoal,
    checkpoints,
    refetch,
    user,
  } = useWeightData();

  console.log("Goal weight:", goalWeight);
  console.log("Current weight", currentWeight);
  console.log("Start Date:", startDate);
  console.log("Start weight:", startWeight);
  console.log("Weight data:", weightData);

  const [nextCheckpointWeight, setNextCheckpointWeight] = useState<number>(0);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleSaveGoal = useCallback(async (newGoal: { weight: string; checkpoints: string }) => {
    if (!user) return;

    const parsedGoal = parseFloat(newGoal.weight);
    const parsedCheckpoints = parseInt(newGoal.checkpoints, 10);

    if (isNaN(parsedGoal) || parsedGoal <= 0) {
      Alert.alert('Invalid Goal', 'Please enter a valid, positive goal weight.');
      return;
    }
    if (isNaN(parsedCheckpoints) || parsedCheckpoints < 1 || parsedCheckpoints > 50) {
      Alert.alert('Invalid Checkpoints', 'Please enter a count between 1 and 50.');
      return;
    }

    const dailyCalorieGoal = computeDailyCalorieGoal(userGoal, currentWeight, parsedGoal);
    const payload = {
      clerkId: user.id,
      startWeight: currentWeight,
      targetWeight: parsedGoal,
      checkpoints: parsedCheckpoints,
      dailyCalorieGoal,
    };

    await saveWeightGoal(payload);
    await refetch();
    setModalVisible(false);
  }, [user, userGoal, currentWeight, refetch]);

  if (loading) {
    return (
      <SafeAreaView className='bg-white flex-1 justify-center items-center'>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (weightData.length === 0) {
    return (
      <EmptyState
        title="No Weight Entries Found"
        buttonText="Track Your First Weight"
        onButtonPress={() => router.push('/track-weight')}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <PageHeader title="Track Your Weight" actionText="All Entries" onActionPress={() => { /* Navigate to entries screen */ }} />
        <View className="bg-white p-3" style={{
          borderRadius: 50,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 8,
        }}>
          <WeightStats bmi={bmi} nextCheckpoint={nextCheckpointWeight} />

          <RadialChart
            startWeight={startWeight}
            goalWeight={goalWeight}
            checkpoints={checkpoints}
            entries={radialChartEntries}
            goal={userGoal}
            onNextCheckpointCalculated={setNextCheckpointWeight}
            onSetNewGoal={() => setModalVisible(true)}
          />

          <WeightGoalDisplay
            startWeight={startWeight}
            startDate={startDate}
            goalWeight={goalWeight}
            onSetGoal={() => setModalVisible(true)}
          />

          <View className="my-4">
            <CustomButton title="Track Weight" onPress={() => router.push('/track-weight')} />
          </View>
        </View>

        <WeightStreaks activeStreak={activeStreak} longestStreak={longestStreak} />

        <View className="bg-white p-3 mt-3" style={{
          borderRadius: 50,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 8,
        }}>
          <WeightAreaChart entries={weightData} />
        </View>

        <View style={{
          borderRadius: 30,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 8,
        }}>
          <WeightEntriesList entries={weightData} />
        </View>
      </ScrollView>

      <SetGoalModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveGoal}
        initialGoalWeight={String(goalWeight)}
        initialCheckpoints={String(checkpoints)}
      />
    </SafeAreaView>
  );
};

export default Weight;


