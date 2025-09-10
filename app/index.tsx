import { Text, View } from "react-native";
import "./global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

const Index = () => {
  // const { isSignedIn } = useAuth();

  // if (isSignedIn) {
  //   return <Redirect href={"./(root)/(tabs)/home"} />
  // }
  return <Redirect href="./welcome" />;
}

export default Index;