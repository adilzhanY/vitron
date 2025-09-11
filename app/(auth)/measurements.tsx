import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useRef, useState } from 'react';
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
  const { user } = useUser();
  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [userMeasurements, setUserMeasurements] = useState({
    weight: '',
    height: '',
    age: '',
    target: 'lost weight' as Goal,
    targetWeight: '',
    dailyCalorieGoal: '',
  });
  const [weightUnit, setWeightUnit] = useState('kg');
  const [heightUnit, setHeightUnit] = useState('cm');

  const totalSlides = 6;
  const isLastSlide = activeIndex === totalSlides - 1;

  const handleNext = async () => {
    if (isLastSlide) {
      try {
        const weightInKg =
          weightUnit === 'lb'
            ? parseFloat(userMeasurements.weight) * 0.453592
            : parseFloat(userMeasurements.weight);
        const heightInCm =
          heightUnit === 'ft'
            ? parseFloat(userMeasurements.height) * 30.48
            : parseFloat(userMeasurements.height);
        const targetWeightInKg = userMeasurements.targetWeight
          ? weightUnit === 'lb'
            ? parseFloat(userMeasurements.targetWeight) * 0.453592
            : parseFloat(userMeasurements.targetWeight)
          : null;

        await fetchAPI('/(api)/user', {
          method: 'PATCH',
          body: JSON.stringify({
            clerkId: user?.id,
            weight: weightInKg,
            height: heightInCm,
            weightGoal: targetWeightInKg,
            dailyCalorieGoal: userMeasurements.dailyCalorieGoal ? parseInt(userMeasurements.dailyCalorieGoal) : null,
          }),
        });

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
        onIndexChanged={(index: number) => setActiveIndex(index)}
        scrollEnabled={false}
      >
        {/* Slide 1: Weight */}
        <View key="weight-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>What is your weight?</Text>
          <View className={inputContainerStyle}>
            <TextInput
              className={textInputStyle}
              placeholder="0"
              placeholderTextColor="#858585"
              keyboardType="numeric"
              value={userMeasurements.weight}
              onChangeText={(text) => setUserMeasurements({ ...userMeasurements, weight: text })}
            />
            <View className={unitContainerStyle}>
              <UnitButton currentUnit={weightUnit} targetUnit="kg" onPress={() => setWeightUnit('kg')}>kg</UnitButton>
              <UnitButton currentUnit={weightUnit} targetUnit="lb" onPress={() => setWeightUnit('lb')}>lb</UnitButton>
            </View>
          </View>
        </View>

        {/* Slide 2: Height */}
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

        {/* Slide 3: Age */}
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

        {/* Slide 4: Goal */}
        <View key="goal-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>What is your goal?</Text>
          <View className="flex-row mt-5">
            {(['lose weight', 'gain weight', 'be fit'] as Goal[]).map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setUserMeasurements({ ...userMeasurements, target: option })}
                className={`p-3 mx-2 rounded-lg ${userMeasurements.target === option ? 'bg-[#B957FF]' : 'bg-gray-700'}`}
              >
                <Text className="text-white font-benzin">{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Slide 5: Target Weight */}
        <View key="target-weight-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>What is your target weight?</Text>
          <View className={inputContainerStyle}>
            <TextInput
              className={textInputStyle}
              placeholder="70"
              placeholderTextColor="#858585"
              keyboardType="numeric"
              value={userMeasurements.targetWeight}
              onChangeText={(text) => setUserMeasurements({ ...userMeasurements, targetWeight: text })}
            />
            <View className={unitContainerStyle}>
              <Text className="text-white font-benzin p-3">{weightUnit}</Text>
            </View>
          </View>
        </View>

        {/* Slide 6: Daily Calorie Goal */}
        <View key="calorie-goal-slide" className={slideContainerStyle}>
          <Text className={titleStyle}>Your daily calorie goal</Text>

          {/* Calculated number here*/}

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