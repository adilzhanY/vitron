import { graphqlRequest } from "@/lib/graphqlRequest";
import { GET_WEIGHTS_QUERY, GET_WEIGHT_GOAL_QUERY, CREATE_WEIGHT_GOAL_MUTATION } from "@/lib/graphql/weightQueries";
import { WeightEntry, UserData, WeightGoalData } from "@/types/type";

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
  console.log("DEBUG: Raw goals received: ", JSON.stringify(rawGoals, null, 2));
  if (!rawGoals) {
    console.log("No rawGoals - returning null");
    return null;
  }

  if (Array.isArray(rawGoals) && rawGoals.length > 0) {
    const sortedGoals = [...rawGoals].sort((a, b) => {
      const dateA = new Date(a.created_at ?? a.created_at ?? 0).getTime();
      const dateB = new Date(b.created_at ?? b.createdAt ?? 0).getTime();
      return dateB - dateA; // Newest first
    });
    console.log("Sorted goals: ", sortedGoals);
    console.log("Selected active goal: ", sortedGoals[0]);

    // Prefer an unachieved goal, otherwise fallback to the newest one
    return sortedGoals[0];
  }

  if (typeof rawGoals === "object" && !Array.isArray(rawGoals)) {
    console.log("Single goal object:", rawGoals);
    return rawGoals;
  }

  console.log("No valid goal format - returning null");

  return null;
};

// Fetches all necessary data for the weight page and returns it in a clean, structured format
export const fetchWeightPageData = async (clerkId: string) => {
  const [weightData, userData, weightGoalData] = await Promise.all([
    graphqlRequest(GET_WEIGHTS_QUERY, { clerkId }).then(data => normalizeWeightData(data.weights)),
    graphqlRequest(`query GetUser($clerkId: String!) { user(clerkId: $clerkId) { goal height } }`, { clerkId }).then(data => data.user),
    graphqlRequest(GET_WEIGHT_GOAL_QUERY, { clerkId }).then(data => data.weightGoal),
  ]);

  console.log("user response: ", JSON.stringify(userData, null, 2));
  console.log("weight response: last weight: ", JSON.stringify(weightData, null, 2));
  console.log("weight goal response:", JSON.stringify(weightGoalData, null, 2));

  // 1. Process Weight data (already normalized)
  // 2. Process User data
  const processedUserData: UserData = {
    goal: userData?.goal ?? "be fit",
    heightCm: parseFloat(userData?.height ?? 0),
  };

  // 3. Process Goal data
  const oldestWeight = weightData.at(-1)?.weight ?? 0;
  const mostRecentWeight = weightData[0]?.weight ?? 0;

  const processedWeightGoalData: WeightGoalData | null = weightGoalData
    ? {
      startWeight: parseFloat(String(weightGoalData.startWeight ?? 0)),
      targetWeight: parseFloat(String(weightGoalData.targetWeight ?? 0)),
      checkpoints: parseInt(String(weightGoalData.checkpoints ?? 9), 10),
    }
    : null;

  console.log("Final weightGoalData:", processedWeightGoalData);
  return {
    weightData,
    userData: processedUserData,
    weightGoalData: processedWeightGoalData
  };
};

// Saves a new weight goal for the user
export const saveWeightGoal = async (payload: any) => {
  const input = {
    clerkId: payload.clerkId,
    startWeight: payload.startWeight,
    targetWeight: payload.targetWeight,
    checkpoints: payload.checkpoints,
    dailyCalorieGoal: payload.dailyCalorieGoal,
  };

  return await graphqlRequest(CREATE_WEIGHT_GOAL_MUTATION, { input });
};
