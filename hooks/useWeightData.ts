import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { fetchWeightPageData } from '@/services/weightService';
import { WeightEntry, UserData, WeightGoalData } from '@/types/type';
import { format, parseISO } from 'date-fns';

export const useWeightData = () => {
  const { user: clerkUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Raw data from the service
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [weightGoalData, setWeightGoalData] = useState<WeightGoalData | null>(null);

  const fetchData = useCallback(async () => {
    if (!clerkUser) return;
    try {
      setLoading(true);
      setError(null);
      const {weightData, userData, weightGoalData} = await fetchWeightPageData(clerkUser.id);
      setWeightData(weightData);
      setUserData(userData);
      setWeightGoalData(weightGoalData);
    } catch(err) {
      console.error('Failed to fetch weight data:', err);
      setError('Could not load your weight data. Please try again');
    } finally {
      setLoading(false);
    }
  }, [clerkUser]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // All the derived data calculations now live here, away from the UI.
  const derivedData = useMemo(() => {
    if (weightData.length == 0 || !userData) {
      return {
        startWeight: 0,
        goalWeight: 0,
        currentWeight: 0,
        startDate: '-',
        bmi: '-',
        radialChartEntries: [],
        userGoal: 'be fit' as const,
        checkpoints: 9,
      };
    }

    const mostRecentWeight = weightData[0].weight;
    const oldestWeight = weightData.at(-1)?.weight ?? 0;
    const oldestDate = weightData.at(-1)?.date;

    const start = weightGoalData?.startWeight ?? oldestWeight;
    const goal = weightGoalData?.targetWeight ?? mostRecentWeight;
    const chkpts = weightGoalData?.checkpoints ?? 9;

    // Calculate BMI
    const heightM = (userData.heightCm ?? 0) / 100;
    const bmiValue = heightM > 0 ? (mostRecentWeight / (heightM * heightM)).toFixed(1)

    return {
      startWeight: start,
      goalWeight: goal,
      currentWeight: mostRecentWeight,
      startDate: oldestDate ? format(parseISO(oldestDate), 'd MMM yyyy') : '-',
      bmi: bmiValue,
      radialChartEntries: [...weightData].reverse().map(e => e.weight),
      userGoal: userData.goal,
      checkpoints: chkpts,
    };
  }, [weightData, userData, weightGoalData]);

  return {
    loading,
    error,
    weightData, // The raw entries for the list/chart
    ...derivedData, // All the calculated values
    refetch: fetchData, // Expose a refetch function
    user: clerkUser,
    userGoal: userData?.goal ?? 'be fit'
  };
};
