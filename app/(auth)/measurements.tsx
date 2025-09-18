import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import CustomButton from '@/components/shared/CustomButton';
import { useUser } from '@clerk/clerk-expo';
import { fetchAPI } from '@/lib/fetch';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SwiperModule = require('react-native-swiper');
const Swiper: any = SwiperModule?.default ?? SwiperModule;

type Goal = 'lose weight' | 'gain weight' | 'be fit'

const Measurements = () => {
  const { user: clerkUser } = useUser();
  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [userMeasurements, setUserMeasurements] = useState({
    gender: '',
    initialWeight: '',
    height: '',
    age: '',
    goal: 'lose weight' as Goal,
    targetWeight: '',
    dailyCalorieGoal: '',
    checkpoints: '9',
  });
  const [weightUnit, setWeightUnit] = useState('kg');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null);

  const totalSlides = 6;
  const isLastSlide = activeIndex === totalSlides - 1;

  const finalGoal = useMemo(() => {
    const weightInKg =
      weightUnit === 'lb'
        ? parseFloat(userMeasurements.initialWeight) * 0.453592
        : parseFloat(userMeasurements.initialWeight);
    const targetWeightInKg = userMeasurements.targetWeight
      ? weightUnit === 'lb'
        ? parseFloat(userMeasurements.targetWeight) * 0.453592
        : parseFloat(userMeasurements.targetWeight)
      : weightInKg; // If no target, assume current weight for 'be fit'

    if (targetWeightInKg > weightInKg) return "gain weight";
    if (targetWeightInKg < weightInKg) return "lose weight";
    return "be fit";
  }, [userMeasurements.initialWeight, userMeasurements.targetWeight, weightUnit]);

  const handleIndexChanged = (index: number) => {
    setActiveIndex(index);
    if (index === totalSlides - 1) { // When on the calorie slide
      calculateAndSetCalories();
    }
  };

  const calculateAndSetCalories = () => {
    const { gender, initialWeight, height, age } = userMeasurements;
    if (!gender || !initialWeight || !height || !age) {
      return; // Not enough data
    }

    const weightInKg = weightUnit === 'lb' ? parseFloat(initialWeight) * 0.453592 : parseFloat(initialWeight);
    const heightInCm = heightUnit === 'ft' ? parseFloat(height) * 30.48 : parseFloat(height);
    const ageNum = parseInt(age);

    // Calculate BMR using Mifflin-St Jeor equation
    let bmr;
    if (gender === 'Male') {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * ageNum + 5;
    } else { // Female
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * ageNum - 161;
    }

    // Estimate TDEE (Total Daily Energy Expenditure) assuming a sedentary lifestyle (BMR * 1.2)
    const tdee = bmr * 1.2;

    // Adjust for goal
    let finalCalories;
    switch (finalGoal) {
      case 'lose weight':
        finalCalories = tdee - 500; // Deficit for weight loss
        break;
      case 'gain weight':
        finalCalories = tdee + 500; // Surplus for weight gain
        break;
      case 'be fit':
      default:
        finalCalories = tdee; // Maintenance
        break;
    }

    const roundedCalories = Math.round(finalCalories / 10) * 10;
    setCalculatedCalories(roundedCalories);
    setUserMeasurements(prev => ({ ...prev, dailyCalorieGoal: roundedCalories.toString() }));
  };

  const handleNext = async () => {
    if (isLastSlide) {
      try {
        const weightInKg =
          weightUnit === 'lb'
            ? parseFloat(userMeasurements.initialWeight) * 0.453592
            : parseFloat(userMeasurements.initialWeight);
        const heightInCm =
          heightUnit === 'ft'
            ? parseFloat(userMeasurements.height) * 30.48
            : parseFloat(userMeasurements.height);
        const targetWeightInKg = userMeasurements.targetWeight
          ? weightUnit === 'lb'
            ? parseFloat(userMeasurements.targetWeight) * 0.453592
            : parseFloat(userMeasurements.targetWeight)
          : weightInKg;


        await fetchAPI('/(api)/user', {
          method: 'PATCH',
          body: JSON.stringify({
            clerkId: clerkUser?.id,
            gender: userMeasurements.gender,
            weight: weightInKg,
            height: heightInCm,
            // weightGoal: targetWeightInKg,
            // dailyCalorieGoal: userMeasurements.dailyCalorieGoal ? parseInt(userMeasurements.dailyCalorieGoal) : null,
            goal: finalGoal,
          }),
        });
        try {
          await fetchAPI('/(api)/first-weight-goal', {
            method: 'POST',
            body: JSON.stringify({
              clerkId: clerkUser?.id,
              startWeight: weightInKg,
              targetWeight: targetWeightInKg,
              checkpoints: userMeasurements.checkpoints,
              dailyCalorieGoal: userMeasurements.dailyCalorieGoal ? parseInt(userMeasurements.dailyCalorieGoal) : null,
            }),
          });
          console.log("Success, weight goal saved");
        } catch (error) {
          console.error("Failed to save weight:", error);
        }
        try {
          await fetchAPI('/(api)/weights', {
            method: 'POST',
            body: JSON.stringify({
              clerkId: clerkUser?.id,
              weight: weightInKg,
            }),
          });
          console.log("Success, weight saved");
        } catch (error) {
          console.error("Failed to save weight:", error);
        }
        router.replace('/(root)/(tabs)/home');
      } catch (error) {
        console.log(error);
        Alert.alert('Error', 'Something went wrong while saving your measurements.');
      }
    } else {
      swiperRef.current?.scrollBy(1);
    }
  };

  const slideContainerStyle = "flex-1 items-center justify-center p-5 z-10";
  const titleStyle = "text-white text-3xl font-benzinBold mx-10 text-center";
  const inputContainerStyle = "flex-row items-center mt-5";
  const textInputStyle = "text-white text-2xl font-benzinBold bg-gray-800 p-3 rounded-lg w-40 text-center";
  const unitContainerStyle = "flex-row ml-3";

  const UnitButton = ({ currentUnit, targetUnit, onPress, children }: { currentUnit: string, targetUnit: string, onPress: () => void, children: React.ReactNode }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`p-3 mx-1 rounded-lg ${currentUnit === targetUnit ? 'bg-[#B957FF]' : 'bg-gray-700'}`}
    >
      <Text className="text-white font-benzin">{children}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-black relative overflow-hidden">
      <Swiper
        ref={swiperRef}
        loop={false}
        dot={<View className="w-[16px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full" />}
        activeDot={
          <View className="w-[32px] h-[4px] mx-1 bg-[#B957FF] rounded-full" />
        }
        onIndexChanged={handleIndexChanged}
        scrollEnabled={false}
      >
        {/* Slide 1: Gender */}
        <View key="gender-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>What is your gender?</Text>
          <View className="flex-row mt-5">
            {(['Male', 'Female']).map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setUserMeasurements({ ...userMeasurements, gender: option.toLowerCase() })}
                className={`p-3 mx-2 rounded-lg ${userMeasurements.gender === option.toLowerCase() ? 'bg-[#B957FF]' : 'bg-gray-700'}`}
              >
                <Text className="text-white font-benzin">{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Slide 2: Weight */}
        <View key="initial-weight-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>What is your weight?</Text>
          <View className={inputContainerStyle}>
            <TextInput
              className={textInputStyle}
              placeholder="0"
              placeholderTextColor="#858585"
              keyboardType="numeric"
              value={userMeasurements.initialWeight}
              onChangeText={(text) => setUserMeasurements({ ...userMeasurements, initialWeight: text })}
            />
            <View className={unitContainerStyle}>
              <UnitButton currentUnit={weightUnit} targetUnit="kg" onPress={() => setWeightUnit('kg')}>kg</UnitButton>
              <UnitButton currentUnit={weightUnit} targetUnit="lb" onPress={() => setWeightUnit('lb')}>lb</UnitButton>
            </View>
          </View>
        </View>

        {/* Slide 3: Height */}
        <View key="height-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>What is your height?</Text>
          <View className={inputContainerStyle}>
            <TextInput
              className={textInputStyle}
              placeholder="0"
              placeholderTextColor="#858585"
              keyboardType="numeric"
              value={userMeasurements.height}
              onChangeText={(text) => setUserMeasurements({ ...userMeasurements, height: text })}
            />
            <View className={unitContainerStyle}>
              <UnitButton currentUnit={heightUnit} targetUnit="cm" onPress={() => setHeightUnit('cm')}>cm</UnitButton>
              <UnitButton currentUnit={heightUnit} targetUnit="ft" onPress={() => setHeightUnit('ft')}>ft</UnitButton>
            </View>
          </View>
        </View>

        {/* Slide 4: Age */}
        <View key="age-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>What is your age?</Text>
          <View className={inputContainerStyle}>
            <TextInput
              className={textInputStyle}
              placeholder="25"
              placeholderTextColor="#858585"
              keyboardType="numeric"
              value={userMeasurements.age}
              onChangeText={(text) => setUserMeasurements({ ...userMeasurements, age: text })}
            />
          </View>
        </View>

        {/* Slide 5: Target Weight */}
        <View key="target-weight-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>What is your target weight?</Text>

          {/* Weight input */}
          <View className={inputContainerStyle}>
            <TextInput
              className={textInputStyle}
              placeholder="70"
              placeholderTextColor="#858585"
              keyboardType="numeric"
              value={userMeasurements.targetWeight}
              onChangeText={(text) =>
                setUserMeasurements({ ...userMeasurements, targetWeight: text })
              }
            />
            <View className={unitContainerStyle}>
              <Text className="text-white font-benzin p-3">{weightUnit}</Text>
            </View>
          </View>

          {/* "Be fit" button */}
          <TouchableOpacity
            className="mt-4 bg-purple-600 rounded-xl p-4"
            onPress={() => setUserMeasurements({ ...userMeasurements, targetWeight: userMeasurements.initialWeight })}
          >
            <Text className="text-white text-center font-benzinBold">
              I just wanna be fit!
            </Text>
          </TouchableOpacity>
        </View>

        {/* Slide 6: Daily Calorie Goal */}
        <View key="calorie-goal-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>Your daily calorie goal</Text>

          {/* Calculated number here*/}
          {calculatedCalories && (
            <Text className="text-gray-300 text-center mt-4 font-benzin px-4">
              Based on your data, we suggest a goal of {calculatedCalories} kcal per day. You can adjust it below.
            </Text>
          )}

          <View className={inputContainerStyle}>
            <TextInput
              className={textInputStyle}
              placeholder="2000"
              placeholderTextColor="#858585"
              keyboardType="numeric"
              value={userMeasurements.dailyCalorieGoal}
              onChangeText={(text) => setUserMeasurements({ ...userMeasurements, dailyCalorieGoal: text })}
            />
            <View className={unitContainerStyle}>
              <Text className="text-white font-benzin p-3">kcal</Text>
            </View>
          </View>
        </View>

        {/* Slide 6: Checkpoints */}
        <View key="checkpoints-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>How many checkpoints do you want?</Text>
          <View className={inputContainerStyle}>
            <TextInput
              className={textInputStyle}
              placeholder="5"
              placeholderTextColor="#858585"
              keyboardType="numeric"
              value={userMeasurements.age}
              onChangeText={(text) => setUserMeasurements({ ...userMeasurements, checkpoints: text })}
            />
          </View>
        </View>
      </Swiper>

      <CustomButton
        title={isLastSlide ? 'Finish' : 'Next'}
        onPress={handleNext}
        className="w-6/12 mt-10 mb-10 z-10"
      />
    </SafeAreaView>
  );
};

export default Measurements;