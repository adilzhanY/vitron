import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import React, { useMemo, useRef, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import CustomButton from "@/components/shared/CustomButton";
import { useUser } from "@clerk/clerk-expo";
import { graphqlRequest } from "@/lib/graphqlRequest";
import { UPDATE_USER_MUTATION } from "@/lib/graphql/userQueries";
import { FontAwesome5 } from "@expo/vector-icons";
import BirthdayPicker from "@/components/measurements/BirthdayPicker";
import WeightInput from "@/components/measurements/WeightInput";
import HeightPicker from "@/components/measurements/HeightPicker";
import LazySlide from "@/components/measurements/LazySlide";

const SwiperModule = require("react-native-swiper");
const Swiper: any = SwiperModule?.default ?? SwiperModule;

type Goal = "lose weight" | "gain weight" | "be fit";
type ActivityLevel =
  | "sedentary"
  | "lightly active"
  | "moderately active"
  | "very active"
  | "extremely active";

// Move constants outside component to prevent recreation on every render
const ACTIVITY_OPTIONS: {
  value: ActivityLevel;
  label: string;
  icon: string;
}[] = [
    {
      label: "Sedentary",
      icon: "couch",
      value: "sedentary",
    },
    {
      label: "Lightly active",
      icon: "walking",
      value: "lightly active",
    },
    {
      label: "Moderately active",
      icon: "running",
      value: "moderately active",
    },
    {
      label: "Very active",
      icon: "bicycle",
      value: "very active",
    },
    {
      label: "Extremely active",
      icon: "dumbbell",
      value: "extremely active",
    },
  ];

const UNIT_SYSTEM_OPTIONS = [
  {
    value: "metric" as const,
    label: "Metric",
    examples: "kg, cm, m",
  },
  {
    value: "imperial" as const,
    label: "Imperial",
    examples: "lb, ft, in",
  },
] as const;

const GENDER_OPTIONS = ["Male", "Female"] as const;

const Measurements = () => {
  console.log("🏁 [Measurements] Component rendering...");

  const { user: clerkUser } = useUser();
  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track which slides have been visited to enable lazy loading
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(new Set([0]));

  console.log(`📍 [Measurements] Current activeIndex: ${activeIndex}, loadedSlides:`, Array.from(loadedSlides));

  const [userMeasurements, setUserMeasurements] = useState({
    gender: "",
    initialWeight: "",
    height: "",
    birthday: "1998-01-01",
    goal: "lose weight" as Goal,
    targetWeight: "",
    dailyCalorieGoal: "",
    checkpoints: "9",
    activityLevel: "sedentary" as ActivityLevel,
    unitSystem: "metric",
  });

  const [weightUnit, setWeightUnit] = useState("kg");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(
    null,
  );

  const [weightError, setWeightError] = useState<string | null>(null);
  const [targetWeightError, setTargetWeightError] = useState<string | null>(null);

  const totalSlides = 9; // Increased from 8 to 9 for unit system slide
  const isLastSlide = activeIndex === totalSlides - 1;

  const finalGoal = useMemo(() => {
    const weightInKg =
      weightUnit === "lb"
        ? parseFloat(userMeasurements.initialWeight) * 0.453592
        : parseFloat(userMeasurements.initialWeight);
    const targetWeightInKg = userMeasurements.targetWeight
      ? weightUnit === "lb"
        ? parseFloat(userMeasurements.targetWeight) * 0.453592
        : parseFloat(userMeasurements.targetWeight)
      : weightInKg;
    if (targetWeightInKg > weightInKg) return "gain weight";
    if (targetWeightInKg < weightInKg) return "lose weight";
    return "be fit";
  }, [
    userMeasurements.initialWeight,
    userMeasurements.targetWeight,
    weightUnit,
  ]);

  const handleIndexChanged = (index: number) => {
    console.log(`🔄 [Measurements] handleIndexChanged called with index: ${index}`);
    setActiveIndex(index);

    // Mark slides as loaded when we're close to them
    setLoadedSlides((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      // Pre-load next slide for smoother transition
      if (index + 1 < totalSlides) {
        newSet.add(index + 1);
      }
      console.log(`✨ [Measurements] Updating loadedSlides to:`, Array.from(newSet));
      return newSet;
    });

    if (index === totalSlides - 2) {
      calculateAndSetCalories();
    }
  }; const calculateAge = (birthdayString: string): number => {
    if (!birthdayString) return 0;
    const birthDate = new Date(birthdayString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const calculateAndSetCalories = () => {
    const { gender, initialWeight, height, birthday } = userMeasurements;
    if (!gender || !initialWeight || !height || !birthday) return;

    const ageNum = calculateAge(birthday);
    if (ageNum < 8) return;

    const weightInKg =
      weightUnit === "lb"
        ? parseFloat(initialWeight) * 0.453592
        : parseFloat(initialWeight);
    const heightInCm =
      heightUnit === "ft" ? parseFloat(height) * 30.48 : parseFloat(height);

    let bmr;
    if (gender === "male") {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * ageNum - 161;
    }

    const activityMultiplier = {
      sedentary: 1.2,
      "lightly active": 1.375,
      "moderately active": 1.55,
      "very active": 1.725,
      "extremely active": 1.9,
    }[userMeasurements.activityLevel];

    const tdee = bmr * activityMultiplier;
    let finalCalories;
    switch (finalGoal) {
      case "lose weight":
        finalCalories = tdee - 500;
        break;
      case "gain weight":
        finalCalories = tdee + 500;
        break;
      case "be fit":
      default:
        finalCalories = tdee;
        break;
    }
    const roundedCalories = Math.round(finalCalories / 10) * 10;
    setCalculatedCalories(roundedCalories);
    setUserMeasurements((prev) => ({
      ...prev,
      dailyCalorieGoal: roundedCalories.toString(),
    }));
  };

  const handleNext = async () => {
    // Check for validation errors before proceeding
    if (weightError || targetWeightError) {
      return;
    }

    if (isLastSlide) {
      try {
        const weightInKg =
          weightUnit === "lb"
            ? parseFloat(userMeasurements.initialWeight) * 0.453592
            : parseFloat(userMeasurements.initialWeight);
        const heightInCm =
          heightUnit === "ft"
            ? parseFloat(userMeasurements.height) * 30.48
            : parseFloat(userMeasurements.height);
        const targetWeightInKg = userMeasurements.targetWeight
          ? weightUnit === "lb"
            ? parseFloat(userMeasurements.targetWeight) * 0.453592
            : parseFloat(userMeasurements.targetWeight)
          : weightInKg;

        await graphqlRequest(UPDATE_USER_MUTATION, {
          input: {
            clerkId: clerkUser?.id,
            gender: userMeasurements.gender,
            height: heightInCm,
            age: calculateAge(userMeasurements.birthday),
            activityLevel: userMeasurements.activityLevel,
          },
        });

        try {
          const { graphqlRequest } = await import("@/lib/graphqlRequest");
          const { CREATE_WEIGHT_GOAL_MUTATION } = await import("@/lib/graphql/weightQueries");

          await graphqlRequest(CREATE_WEIGHT_GOAL_MUTATION, {
            input: {
              clerkId: clerkUser?.id,
              startWeight: weightInKg,
              targetWeight: targetWeightInKg,
              checkpoints: userMeasurements.checkpoints,
              dailyCalorieGoal: userMeasurements.dailyCalorieGoal
                ? parseInt(userMeasurements.dailyCalorieGoal)
                : null,
            },
          });
          console.log("Success, weight goal saved");
        } catch (error) {
          console.error("Failed to save weight goal:", error);
        }

        try {
          const { graphqlRequest } = await import("@/lib/graphqlRequest");
          const { CREATE_WEIGHT_MUTATION } = await import("@/lib/graphql/weightQueries");

          await graphqlRequest(CREATE_WEIGHT_MUTATION, {
            input: {
              clerkId: clerkUser?.id,
              weight: weightInKg,
            },
          });
          console.log("Success, weight saved");
        } catch (error) {
          console.error("Failed to save initial weight:", error);
        }

        router.replace("/(root)/(tabs)/home");
      } catch (error) {
        console.log(error);
        Alert.alert(
          "Error",
          "Something went wrong while saving your measurements.",
        );
      }
    } else {
      swiperRef.current?.scrollBy(1);
    }
  };

  const handleDateChange = useCallback(
    ({ day, month, year }: { day: number; month: number; year: number }) => {
      const formattedMonth = month.toString().padStart(2, "0");
      const formattedDay = day.toString().padStart(2, "0");
      const birthdayString = `${year}-${formattedMonth}-${formattedDay}`;
      setUserMeasurements((prev) => ({ ...prev, birthday: birthdayString }));
    },
    [],
  );

  const handleWeightChange = useCallback(
    (weight: number, unit: "kg" | "lb") => {
      setUserMeasurements((prev) => ({
        ...prev,
        initialWeight: weight.toString(),
      }));
      setWeightUnit(unit);
    },
    [],
  );

  const handleHeightChange = useCallback(
    (height: number, unit: "cm" | "ft") => {
      setUserMeasurements((prev) => ({
        ...prev,
        height: height.toString(),
      }));
      setHeightUnit(unit);
    },
    [],
  );

  const handleTargetWeightChange = useCallback(
    (weight: number, unit: "kg" | "lb") => {
      setUserMeasurements((prev) => ({
        ...prev,
        targetWeight: weight.toString(),
      }));
    },
    [],
  );

  const handleActivityLevelChange = useCallback((level: ActivityLevel) => {
    setUserMeasurements((prev) => ({
      ...prev,
      activityLevel: level,
    }));
  }, []);

  // Optimized unit system handler - use requestAnimationFrame for immediate UI response
  const handleUnitSystemChange = useCallback(
    (newSystem: "metric" | "imperial") => {
      console.log(`🎯 [Measurements] handleUnitSystemChange called with: ${newSystem}`);

      // Update UI immediately for instant feedback
      setUserMeasurements((prev) => ({
        ...prev,
        unitSystem: newSystem,
      }));

      // Defer heavy state updates to next frame
      requestAnimationFrame(() => {
        console.log(`⚙️ [Measurements] Updating weight/height units in next frame`);
        const newWeightUnit = newSystem === "metric" ? "kg" : "lb";
        const newHeightUnit = newSystem === "metric" ? "cm" : "ft";
        setWeightUnit(newWeightUnit);
        setHeightUnit(newHeightUnit);
      });
    },
    [],
  ); const slideContainerStyle = "flex-1 items-center justify-center p-5 z-10";
  const titleStyle = "text-black text-3xl font-benzinBold mx-10 text-center";
  const inputContainerStyle = "flex-row items-center mt-5";
  const textInputStyle =
    "text-white text-2xl font-benzinBold bg-gray-800 p-3 rounded-lg w-40 text-center";
  const unitContainerStyle = "flex-row ml-3";

  // Helper function to determine if a slide should be rendered
  const shouldRenderSlide = useCallback((slideIndex: number) => {
    const should = loadedSlides.has(slideIndex);
    console.log(`🤔 [Measurements] shouldRenderSlide(${slideIndex}) = ${should}`);
    return should;
  }, [loadedSlides]);

  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-white relative overflow-hidden">
      <Swiper
        ref={swiperRef}
        loop={false}
        dot={
          <View className="w-[16px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full" />
        }
        activeDot={
          <View className="w-[32px] h-[4px] mx-1 bg-primary rounded-full" />
        }
        onIndexChanged={handleIndexChanged}
        scrollEnabled={false}
      >
        {/* Slide 1: Gender */}
        <View key="gender-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>What is your gender?</Text>
          <View className="flex-row mt-5">
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() =>
                  setUserMeasurements((prev) => ({
                    ...prev,
                    gender: option.toLowerCase(),
                  }))
                }
                className={`p-3 mx-2 rounded-3xl ${userMeasurements.gender === option.toLowerCase() ? "bg-green-300" : "bg-gray-700"}`}
              >
                <Text className="text-white font-benzin">{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Slide 2: Unit System */}
        <View key="unit-system-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>Choose your unit system</Text>
          <View className="mt-5 w-full px-4">
            {UNIT_SYSTEM_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleUnitSystemChange(option.value)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className={`p-4 mx-2 my-2 rounded-3xl ${userMeasurements.unitSystem === option.value ? "bg-green-300" : "bg-gray-700"}`}
              >
                <Text className="text-white font-benzinBold text-lg text-center">
                  {option.label}
                </Text>
                <Text className="text-white font-benzin text-sm text-center mt-1">
                  {option.examples}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Slide 3: Weight */}
        <View key="initial-weight-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>What is your weight?</Text>
          <View className="mt-8 w-full px-4">
            <WeightInput
              onWeightChange={handleWeightChange}
              initialWeight={
                userMeasurements.initialWeight
                  ? parseFloat(userMeasurements.initialWeight)
                  : undefined
              }
              unitSystem={userMeasurements.unitSystem as "metric" | "imperial"}
              onValidationError={setWeightError}
            />
          </View>
        </View>

        {/* Slide 4: Height */}
        <View key="height-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>What is your height?</Text>
          <View className="mt-8 w-full px-4">
            <LazySlide shouldLoad={shouldRenderSlide(3)} slideName="HeightPicker">
              <HeightPicker
                onHeightChange={handleHeightChange}
                initialHeight={
                  userMeasurements.height
                    ? parseFloat(userMeasurements.height)
                    : undefined
                }
                unitSystem={userMeasurements.unitSystem as "metric" | "imperial"}
                enable3DEffect={false}
                showGradientMask={false}
                enableDecayAnimation={true}
                enableSpringAnimation={false}
                enableOpacityAnimation={true}
                enableFontSizeAnimation={true}
                disableAllAnimations={false}
              />
            </LazySlide>
          </View>
        </View>

        {/* Slide 5: Birthday*/}
        <View key="birthday-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>What is your date of birth?</Text>
          <LazySlide shouldLoad={shouldRenderSlide(4)} slideName="BirthdayPicker">
            <BirthdayPicker
              onDateChange={handleDateChange}
              initialYear={1998}
              enable3DEffect={false}
              showGradientMask={false}
              enableDecayAnimation={true}
              enableSpringAnimation={false}
              enableOpacityAnimation={true}
              enableFontSizeAnimation={true}
              disableAllAnimations={false}
            />
          </LazySlide>
        </View>
        {/* Slide 6: Activity Level */}
        <View key="activity-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>Select your activity level</Text>
          <View className="mt-5 w-full">
            {ACTIVITY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.label}
                onPress={() => handleActivityLevelChange(option.value)}
                className={`flex-row items-center p-4 m-2 rounded-2xl ${userMeasurements.activityLevel === option.value ? "bg-green-300" : "bg-gray-700"}`}
              >
                <View style={{ width: 30, alignItems: "center" }}>
                  <FontAwesome5 name={option.icon} size={24} color="white" />
                </View>
                <Text className="text-white font-benzinBold text-xl ml-4">
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Slide 7: Target Weight */}
        <View key="target-weight-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>What is your target weight?</Text>
          <View className="mt-8 w-full px-4">
            <WeightInput
              onWeightChange={handleTargetWeightChange}
              initialWeight={
                userMeasurements.targetWeight
                  ? parseFloat(userMeasurements.targetWeight)
                  : undefined
              }
              unitSystem={userMeasurements.unitSystem as "metric" | "imperial"}
              onValidationError={setTargetWeightError}
            />
          </View>
        </View>

        {/* Slide 8: Daily Calorie Goal */}
        <View key="calorie-goal-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>Your daily calorie goal</Text>
          {calculatedCalories ? (
            <Text className="text-gray-600 text-center mt-4 font-benzin px-4">
              Based on your data, we suggest a goal of {calculatedCalories} kcal
              per day. You can adjust it below.
            </Text>
          ) : (
            <Text className="text-gray-600 text-center mt-4 font-benzin px-4">
              We'll calculate a suggestion for you based on your previous
              answers.
            </Text>
          )}
          <View className={inputContainerStyle}>
            <TextInput
              className={textInputStyle}
              placeholder="2000"
              placeholderTextColor="#858585"
              keyboardType="numeric"
              value={userMeasurements.dailyCalorieGoal}
              onChangeText={(text) =>
                setUserMeasurements((prev) => ({
                  ...prev,
                  dailyCalorieGoal: text,
                }))
              }
            />
            <View className={unitContainerStyle}>
              <Text className="text-black font-benzin p-3">kcal</Text>
            </View>
          </View>
        </View>

        {/* Slide 9: Checkpoints */}
        <View key="checkpoints-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>How many checkpoints do you want?</Text>
          <View className={inputContainerStyle}>
            <TextInput
              className={textInputStyle}
              placeholder="9"
              placeholderTextColor="#858585"
              keyboardType="numeric"
              value={userMeasurements.checkpoints}
              onChangeText={(text) =>
                setUserMeasurements((prev) => ({ ...prev, checkpoints: text }))
              }
            />
          </View>
        </View>
      </Swiper>

      {/* Display validation error */}
      {(weightError || targetWeightError) && (
        <Text className="text-red-500 font-benzinBold text-center px-4 mb-2">
          {weightError || targetWeightError}
        </Text>
      )}

      <CustomButton
        title={isLastSlide ? "Finish" : "Next"}
        onPress={handleNext}
        className="w-6/12 mt-10 mb-10 z-10"
      />
    </SafeAreaView>
  );
};
export default Measurements;
