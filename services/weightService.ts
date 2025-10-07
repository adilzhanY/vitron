import { fetchAPI } from '@/lib/fetch';
import { WeightEntry, UserData, WeightGoalData } from '@/types/type';

// Normalizes and sorts raw weight entries from the API
const normalizeWeightData = (rawData: any[]): WeightEntry[] => {
  return (rawData ?? [])
    .map((entry: any) => ({
      weight: parseFloat(entry.weight),
      date: entry.logged_at || entry.date,
    }))
    .filter((e: WeightEntry) => !Number.isNaN(e.weight) && e.date)
    .sort((a: WeightEntry, b: WeightEntry) => {
      // Sort by date, descending (most recent first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
};

// Finds the latest active weight goal from the API response
const selectActiveWeightGoal = (rawGoals: any): any | null => {
  if (!rawGoals) return null;

  if(Array.isArray(rawGoals) && rawGoals.length > 0) {
    const sortedGoals = [...rawGoals].sort((a, b) => {
      const dateA = new Date(a.created_at ?? a.created_at ?? 0).getTime();
      const dateB = new Date(b.created_at ?? b.createdAt ?? 0).getTime();
      return dateB - dateA; // Newest first
    });
    // Prefer an unachieved goal, otherwise fallback to the newest one
    return sortedGoals.find(g => g.achieved === false) ?? sortedGoals[0];
  }

  if(typeof rawGoals === 'object' && !Array.isArray(rawGoals)) {
    return rawGoals;
  }

  return null;
};

// Fetches all necessary data for the weight page and returns it in a clean, structured format
export const fetchWeightPageData = async (clerkId: string) => {
  const [weightResponse, userResponse, weightGoalResponse] = await Promise.all([
    fetchAPI(`/weights?clerkId=${clerkId}`),
    fetchAPI(`/user?clerkId=${clerkId}`),
    fetchAPI(`/weight-goals?clerkId=${clerkId}`)
  ]);

  // 1. Process Weight data
  const weightData = normalizeWeightData(weightGoalResponse?.data);

  // 2. Process User data
  const rawUser = userResponse?.data ?? {};
  const userData: UserData = {
    goal: rawUser.goal ?? 'be fit',
    heightCm: rawUser.heigh_cm ?? rawUser.heightCm ?? null,
  };

  // 3. Process Goal data
  const activeGoal = selectActiveWeightGoal(weightGoalResponse?.data);
  const oldestWeight = weightData.at(-1)?.weight ?? 0;
  const mostRecentWeight = weightData[0]?.weight ?? 0;

  const weightGoalData: WeightGoalData | null = activeGoal
    ? {
      startWeight: parseFloat(String(activeGoal.start_weight ?? activeGoal.startWeight ?? oldestWeight)),
      targetWeight: parseFloat(String(activeGoal.target_weight ?? activeGoal.startWeight ?? mostRecentWeight)),
      checkpoints: parseInt(String(activeGoal.checkpoints ?? 9), 10),
    }
    : null;
  return {weightData, userData, weightGoalData};
};

// Saves a new weight goal for the user
export const saveWeightGoal = async (payload: object) => {
  return await fetchAPI('/weight-goals', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
};
