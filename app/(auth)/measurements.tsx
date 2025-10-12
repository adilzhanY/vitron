import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import CustomButton from '@/components/shared/CustomButton';
import { useUser } from '@clerk/clerk-expo';
import { fetchAPI } from '@/lib/fetch';
import { FontAwesome5 } from '@expo/vector-icons';
import BirthdayPicker from '@/components/shared/BirthdayPicker'; // Import the new component

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SwiperModule = require('react-native-swiper');
const Swiper: any = SwiperModule?.default ?? SwiperModule;

type Goal = 'lose weight' | 'gain weight' | 'be fit';
type ActivityLevel = 'sedentary' | 'lightly active' | 'moderately active' | 'very active' | 'extremely active';

const activityOptions: { label: ActivityLevel; icon: string }[] = [
  { label: 'sedentary', icon: 'couch' },
  { label: 'lightly active', icon: 'walking' },
  { label: 'moderately active', icon: 'running' },
  { label: 'very active', icon: 'bicycle' },
  { label: 'extremely active', icon: 'dumbbell' },
];

const Measurements = () => {
  const { user: clerkUser } = useUser();
  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [userMeasurements, setUserMeasurements] = useState({
    gender: '',
    initialWeight: '',
    height: '',
    birthday: '1998-01-01', // Default birthday, will be updated by picker
    goal: 'lose weight' as Goal,
    targetWeight: '',
    dailyCalorieGoal: '',
    checkpoints: '9',
    activityLevel: 'sedentary' as ActivityLevel,
  });

  const [weightUnit, setWeightUnit] = useState('kg');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null);

  const totalSlides = 8; // Total slides is now 8
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
      : weightInKg;
    if (targetWeightInKg > weightInKg) return "gain weight";
    if (targetWeightInKg < weightInKg) return "lose weight";
    return "be fit";
  }, [userMeasurements.initialWeight, userMeasurements.targetWeight, weightUnit]);

  const handleIndexChanged = (index: number) => {
    setActiveIndex(index);
    if (index === totalSlides - 2) { // When on the calorie slide (now second to last)
      calculateAndSetCalories();
    }
  };

  const calculateAge = (birthdayString: string): number => {
    if (!birthdayString) return 0;
    const birthDate = new Date(birthdayString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateAndSetCalories = () => {
    const { gender, initialWeight, height, birthday } = userMeasurements;
    if (!gender || !initialWeight || !height || !birthday) return;
    
    const ageNum = calculateAge(birthday);
    if (ageNum < 8) return; // Don't calculate for children

    const weightInKg = weightUnit === 'lb' ? parseFloat(initialWeight) * 0.453592 : parseFloat(initialWeight);
    const heightInCm = heightUnit === 'ft' ? parseFloat(height) * 30.48 : parseFloat(height);
    
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * ageNum - 161;
    }

    const activityMultiplier = {
      sedentary: 1.2,
      'lightly active': 1.375,
      'moderately active': 1.55,
      'very active': 1.725,
      'extremely active': 1.9,
    }[userMeasurements.activityLevel];

    const tdee = bmr * activityMultiplier;
    let finalCalories;
    switch (finalGoal) {
      case 'lose weight':
        finalCalories = tdee - 500;
        break;
      case 'gain weight':
        finalCalories = tdee + 500;
        break;
      case 'be fit':
      default:
        finalCalories = tdee;
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
            birthday: userMeasurements.birthday, // Sending correctly formatted birthday
            activityLevel: userMeasurements.activityLevel,
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
          console.error("Failed to save weight goal:", error);
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
          console.error("Failed to save initial weight:", error);
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

  const handleDateChange = ({ day, month, year }: { day: number; month: number; year: number }) => {
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    const birthdayString = `${year}-${formattedMonth}-${formattedDay}`;
    setUserMeasurements(prev => ({ ...prev, birthday: birthdayString }));
  };

  const slideContainerStyle = "flex-1 items-center justify-center p-5 z-10";
  const titleStyle = "text-black text-3xl font-benzinBold mx-10 text-center";
  const inputContainerStyle = "flex-row items-center mt-5";
  const textInputStyle = "text-white text-2xl font-benzinBold bg-gray-800 p-3 rounded-lg w-40 text-center";
  const unitContainerStyle = "flex-row ml-3";

  const UnitButton = ({ currentUnit, targetUnit, onPress, children }: { currentUnit: string, targetUnit: string, onPress: () => void, children: React.ReactNode }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`p-3 mx-1 rounded-lg ${currentUnit === targetUnit ? 'bg-primary' : 'bg-gray-700'}`}
    >
      <Text className="text-white font-benzin">{children}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-white relative overflow-hidden">
      <Swiper
        ref={swiperRef}
        loop={false}
        dot={<View className="w-[16px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full" />}
        activeDot={<View className="w-[32px] h-[4px] mx-1 bg-primary rounded-full" />}
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
        
        {/* Slide 4: Birthday*/}
        <View key="birthday-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>What is your date of birth?</Text>
          <BirthdayPicker onDateChange={handleDateChange} initialYear={1998} />
        </View>

        {/* Slide 5: Activity Level */}
        <View key="activity-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>Select your activity level</Text>
          <View className="mt-5 w-full">
            {activityOptions.map((option) => (
              <TouchableOpacity
                key={option.label}
                onPress={() => setUserMeasurements({ ...userMeasurements, activityLevel: option.label })}
                className={`flex-row items-center p-4 m-2 rounded-lg ${userMeasurements.activityLevel === option.label ? 'bg-[#B957FF]' : 'bg-gray-700'}`}
              >
                <FontAwesome5 name={option.icon} size={24} color='white' />
                <Text className="text-white font-benzin text-xl ml-4">{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Slide 6: Target Weight */}
        <View key="target-weight-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>What is your target weight?</Text>
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
          <TouchableOpacity
            className="mt-4 bg-purple-600 rounded-xl p-4"
            onPress={() => setUserMeasurements({ ...userMeasurements, targetWeight: userMeasurements.initialWeight })}
          >
            <Text className="text-white text-center font-benzinBold">I just wanna be fit!</Text>
          </TouchableOpacity>
        </View>

        {/* Slide 7: Daily Calorie Goal */}
        <View key="calorie-goal-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>Your daily calorie goal</Text>
          {calculatedCalories ? (
            <Text className="text-gray-600 text-center mt-4 font-benzin px-4">
              Based on your data, we suggest a goal of {calculatedCalories} kcal per day. You can adjust it below.
            </Text>
          ) : (
            <Text className="text-gray-600 text-center mt-4 font-benzin px-4">
              We'll calculate a suggestion for you based on your previous answers.
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
              <Text className="text-black font-benzin p-3">kcal</Text>
            </View>
          </View>
        </View>

        {/* Slide 8: Checkpoints */}
        <View key="checkpoints-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>How many checkpoints do you want?</Text>
          <View className={inputContainerStyle}>
            <TextInput
              className={textInputStyle}
              placeholder="9"
              placeholderTextColor="#858585"
              keyboardType="numeric"
              value={userMeasurements.checkpoints}
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
