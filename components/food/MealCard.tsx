import { View, Text } from "react-native";
import { useFoodData } from "@/hooks/useFoodData";
import { Ionicons } from "@expo/vector-icons";

export interface FoodEntry {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  is_saved: boolean;
  entry_date: string;
  logged_at: string;
}

interface MealCardProps {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  is_saved: boolean;
  logged_at: string;
}

const MealCard = ({
  name,
  calories,
  protein,
  carbs,
  fat,
  meal_type,
}: MealCardProps) => {
  return (
    <View
      style={{
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
      }}
      className="bg-white py-5 px-7 mt-2"
    >
      <View className="flex-row">
        <View className="flex-col">
          <Text className="text-2xl font-benzinBold">{name}</Text>
          <Text className="font-benzinBold mb-3">
            <Text className="text-3xl">{calories}</Text>
            <Text className="text-sm text-gray-400"> calories</Text>
          </Text>
          {/* Badges */}
          <View className="flex-row gap-3">
            {/* Carbs */}
            <View className="flex-row items-center bg-[#BBF7D0] p-2 rounded-lg gap-1">
              <Ionicons name="leaf" size={20} color="#22C55E" />
              <Text className="font-benzinBold text-[#22C55E]">{carbs}g</Text>
            </View>
            {/* Protein */}
            <View className="flex-row bg-[#BFDBFE] p-2 rounded-lg gap-1">
              <Ionicons name="fish" size={20} color="#3B82F6" />
              <Text className="font-benzinBold text-[#3B82F6]">{protein}g</Text>
            </View>
            {/* Fat */}
            <View className="flex-row bg-[#FED7AA] p-2 rounded-lg gap-1">
              <Ionicons name="water" size={20} color="#F59E0B" />
              <Text className="font-benzinBold text-[#F59E0B]">{fat}g</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MealCard;
