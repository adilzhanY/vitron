import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { onboarding } from "@/constants";
import CustomButton from "@/components/shared/CustomButton";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
// Some CJS libraries can have default export interop issues on newer React Native / bundler versions.
// We defensively resolve the component to avoid Swiper being undefined at runtime.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SwiperModule = require("react-native-swiper");
const Swiper: any = SwiperModule?.default ?? SwiperModule;

const Onboarding = () => {
  // Using any here because the library doesn't ship proper TS types; avoids undefined generic issues.
  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === onboarding.length - 1;

  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-white relative overflow-hidden">
      {/* Skip button */}
      <TouchableOpacity
        onPress={() => {
          router.replace("./sign-up");
        }}
        className="w-full flex justify-end items-end p-5 z-10"
      >
        <Text className="text-white text-md font-benzinBold">Skip</Text>
      </TouchableOpacity>

      {/* Swiper */}
      {Swiper ? (
        <Swiper
          ref={swiperRef}
          loop={false}
          dot={
            <View className="w-[16px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full" />
          }
          activeDot={
            <View className="w-[32px] h-[4px] mx-1 bg-green-300 rounded-full" />
          }
          onIndexChanged={(index: number) => setActiveIndex(index)}
        >
          {onboarding.map((item: any) => (
            <View
              key={item.id}
              className="flex items-center justify-center p-5 z-10"
            >
              <Image
                source={item.image}
                className="w-full h-[300px]"
                resizeMode="contain"
              />
              <View className="flex flex-row items-center justify-center w-full mt-10">
                <Text className="text-black text-3xl font-benzinBold mx-10 text-center">
                  {item.title}
                </Text>
              </View>
              <Text className="text-lg text-center font-benzin text-[#858585] mx-10 mt-3">
                {item.description}
              </Text>
            </View>
          ))}
        </Swiper>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      )}

      {/* CTA button */}
      <CustomButton
        title={isLastSlide ? "Get Started" : "Next"}
        onPress={() =>
          isLastSlide
            ? router.replace("./sign-up")
            : swiperRef.current?.scrollBy(1)
        }
        className="mt-10 mb-10 z-10"
        shadowVariant="m"
      />
    </SafeAreaView>
  );
};

export default Onboarding;
