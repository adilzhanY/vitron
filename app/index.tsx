import { Text, View } from "react-native";
import "./global.css";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="flex flex-row bg-white">
      <Text className="text-3xl font-bold text-blue-500">
        Welcome to Vitron!
      </Text>
    </SafeAreaView>
  );
}