import { fetchAPI } from '@/lib/fetch';
import { UserData } from '@/types/type';

interface MacrosCalculation {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacrosCalculationInput {
  heightCm: number;
  currentWeight: number;
  targetWeight: number;
  goal: 'lose weight' | 'gain weight' | 'be fit';
  activityLevel: 'sedentary' | 'lightly active' | 'moderately active' | 'very active' | 'extremely active';
  age?: number;
  gender?: 'male' | 'female';
}

/**
 * Calculates daily macronutrient requirements using advanced formulas
 * Based on Mifflin-St Jeor equation for BMR and Harris-Benedict for activity adjustment
 */
export const calculateMacros = ({
  heightCm,
  currentWeight,
  targetWeight,
  goal,
  activityLevel,
  age = 30, // Default age if not provided
  gender = 'male', // Default gender if not provided
}: MacrosCalculationInput): MacrosCalculation => {
  // 1. Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
  // Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
  // Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
  const genderConstant = gender === 'male' ? 5 : -161;
  const bmr = (10 * currentWeight) + (6.25 * heightCm) - (5 * age) + genderConstant;

  // 2. Apply activity level multiplier (Harris-Benedict Formula)
  const activityMultipliers = {
    'sedentary': 1.2,           // Little or no exercise
    'lightly active': 1.375,    // Light exercise 1-3 days/week
    'moderately active': 1.55,  // Moderate exercise 3-5 days/week
    'very active': 1.725,       // Hard exercise 6-7 days/week
    'extremely active': 1.9,    // Very hard exercise & physical job
  };
  const maintenanceCalories = bmr * activityMultipliers[activityLevel];

  // 3. Adjust calories based on goal
  let targetCalories: number;
  let proteinRatio: number;
  let carbRatio: number;
  let fatRatio: number;

  const weightDifference = targetWeight - currentWeight;
  const isLosing = weightDifference < 0;
  const isGaining = weightDifference > 0;

  switch (goal) {
    case 'lose weight':
      // Create a moderate deficit (15-25% based on how much to lose)
      const deficitPercent = Math.min(25, Math.max(15, Math.abs(weightDifference) * 0.5));
      targetCalories = maintenanceCalories * (1 - deficitPercent / 100);
      
      // High protein to preserve muscle, moderate carbs, lower fat
      proteinRatio = 0.35;  // 35% protein
      carbRatio = 0.35;     // 35% carbs
      fatRatio = 0.30;      // 30% fat
      break;

    case 'gain weight':
      // Create a moderate surplus (10-20% based on how much to gain)
      const surplusPercent = Math.min(20, Math.max(10, Math.abs(weightDifference) * 0.5));
      targetCalories = maintenanceCalories * (1 + surplusPercent / 100);
      
      // High protein for muscle growth, higher carbs for energy, moderate fat
      proteinRatio = 0.30;  // 30% protein
      carbRatio = 0.45;     // 45% carbs
      fatRatio = 0.25;      // 25% fat
      break;

    case 'be fit':
    default:
      // Maintenance or slight adjustment based on target vs current weight
      if (Math.abs(weightDifference) > 5) {
        // Small adjustment if target differs significantly
        const adjustmentPercent = isLosing ? -10 : isGaining ? 10 : 0;
        targetCalories = maintenanceCalories * (1 + adjustmentPercent / 100);
      } else {
        targetCalories = maintenanceCalories;
      }
      
      // Balanced macros for maintenance
      proteinRatio = 0.30;  // 30% protein
      carbRatio = 0.40;     // 40% carbs
      fatRatio = 0.30;      // 30% fat
      break;
  }

  // 4. Calculate macronutrients in grams
  // Protein: 4 calories per gram
  // Carbs: 4 calories per gram
  // Fat: 9 calories per gram
  const proteinGrams = Math.round((targetCalories * proteinRatio) / 4);
  const carbGrams = Math.round((targetCalories * carbRatio) / 4);
  const fatGrams = Math.round((targetCalories * fatRatio) / 9);

  // 5. Adjust for minimum protein requirement (1.6-2.2g per kg body weight)
  const minProteinPerKg = goal === 'gain weight' ? 2.0 : goal === 'lose weight' ? 1.8 : 1.6;
  const minProtein = Math.round(currentWeight * minProteinPerKg);
  
  const finalProtein = Math.max(proteinGrams, minProtein);
  
  // Recalculate calories if protein was adjusted
  const proteinCalories = finalProtein * 4;
  const remainingCalories = targetCalories - proteinCalories;
  const finalCarbs = Math.round((remainingCalories * (carbRatio / (carbRatio + fatRatio))) / 4);
  const finalFat = Math.round((remainingCalories * (fatRatio / (carbRatio + fatRatio))) / 9);

  return {
    calories: Math.round(targetCalories),
    protein: finalProtein,
    carbs: finalCarbs,
    fat: finalFat,
  };
};