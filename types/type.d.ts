import { TextInputProps, TouchableOpacityProps } from "react-native";

declare interface ButtonProps extends TouchableOpacityProps {
  title: string;
  bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
  textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  className?: string;
}

declare interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: any;
  secureTextEntry?: boolean;
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
}

export type UserGoal = 'lose weight' | 'gain weight' | 'be fit';

export type RadialChartProps = {
  startWeight: number;
  goalWeight: number;
  checkpoints: number;
  entries: number[]; // weight entries (last days)
  goal: UserGoal;
  onNextCheckpointCalculated?: (weight: number) => void;
  onSetNewGoal: () => void;
};

export interface WeightAreaChartProps {
  entries: WeightEntry[];
  setScrollEnabled?: (enabled: boolean) => void;
}

export type WeightEntry = {
  date: string;
  weight: number;
}

export interface UserData {
  goal: UserGoal;
  heightCm?: number | null;
}

export interface WeightGoalData {
  startWeight: number;
  targetWeight: number;
  checkpoints: number;
}

export type FoodEntry = {
  name: string;
  cals: number;
  mealType: MealType;
  isSaved: bool | false;
  date: string;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
}

export interface FoodStatsProps {
  entries: FoodEntry[];
}

type MealType = 
  'breakfast' | 
  'lunch' | 
  'dinner' | 
  'snack';

interface FoodTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodUserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}


