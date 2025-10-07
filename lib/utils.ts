interface NeonDbError {
  code: string;
  detail: string;
}

type UserGoal = 'lose weight' | 'gain weight' | 'be fit';

export function isNeonDbError(error: unknown): error is NeonDbError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'detail' in error
  );
}

export const estimateMaintenanceCalories = (weightKg: number): number => {
  if (weightKg <= 0) return 2000;
  return Math.round(weightKg * 30);
};

export const computeDailyCalorieGoal(
  goal: UserGoal,
  currentWeight: number,
  targetWeight: number
): number => {
  const maintenance = estimateMaintenanceCalories(currentWeight);
  const deficit = 500;
  const surplus = 300;
  const minCalories = 1200;

  switch (goal) {
    case 'lose weight':
      return Math.max(maintenance - deficit, minCalories);
    case 'gain weight':
      return maintenance + surplus;
    case 'be fit':
    default:
      return maintenance;
  }
};
