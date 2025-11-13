import { View, Text, Image } from "react-native";
import { useFoodData } from "@/hooks/useFoodData";
import { Ionicons } from "@expo/vector-icons";

export interface FoodEntry {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  isSaved: boolean;
  entryDate: string;
  loggedAt: string;
  imageUrl?: string;
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
  imageUrl?: string;
}

const MealCard = ({
  name,
  calories,
  protein,
  carbs,
  fat,
  meal_type,
  logged_at,
  imageUrl,
}: MealCardProps) => {
  console.log('MealCard render:', { name, logged_at, imageUrl });

  // Format time from logged_at
  const formatTime = (timestamp: string) => {
    if (!timestamp) {
      console.log('MealCard: No timestamp provided');
      return '--:--';
    }
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.log('MealCard: Invalid timestamp:', timestamp);
      return '--:--';
    }
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

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
      <View className="flex-row justify-between">
        <View className="flex-col flex-1 mr-4">
          <Text className="text-lg font-interExtraBold">{name}</Text>
          <Text className="font-interBlack mb-3">
            <Text className="text-2xl">{calories}</Text>
            <Text className="text-sm text-gray-400"> calories</Text>
          </Text>
          {/* Badges */}
          <View className="flex-row gap-2">
            {/* Carbs */}
            <View className="flex-row items-center bg-[#BBF7D0] p-2 rounded-lg gap-1">
              <Ionicons name="leaf" size={15} color="#22C55E" />
              <Text className="font-interExtraBold text-[#22C55E] text-sm">{carbs}g</Text>
            </View>
            {/* Protein */}
            <View className="flex-row bg-[#BFDBFE] p-2 rounded-lg gap-1">
              <Ionicons name="fish" size={15} color="#3B82F6" />
              <Text className="font-interExtraBold text-[#3B82F6] text-sm">{protein}g</Text>
            </View>
            {/* Fat */}
            <View className="flex-row bg-[#FED7AA] p-2 rounded-lg gap-1">
              <Ionicons name="water" size={15} color="#F59E0B" />
              <Text className="font-interExtraBold text-[#F59E0B] text-sm">{fat}g</Text>
            </View>
          </View>
          {/* Time display */}
          <Text className="text-gray-400 text-sm mt-3 font-interSemiBold">
            {formatTime(logged_at)}
          </Text>
        </View>
        {/* Image or placeholder */}
        <View className="justify-center">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 80, height: 80, borderRadius: 16 }}
              resizeMode="cover"
            />
          ) : (
            <View className="items-center justify-center" style={{ width: 80, height: 80 }}>
              <Ionicons name="fast-food" size={60} color="#D1D5DB" />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default MealCard;
