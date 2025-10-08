import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from './CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  onButtonPress: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, subtitle, buttonText, onButtonPress }) => {
  return (
    <SafeAreaView className='bg-white flex-1 justify-center items-center p-4'>
      <MaterialCommunityIcons name="weight-lifter" size={64} color="#e5e7eb" />
      <Text className='text-black text-xl font-benzin text-center mt-4'>{title}</Text>
      {subtitle && (
        <Text className='text-gray-400 text-sm font-benzinMedium text-center mt-2'>{subtitle}</Text>
      )}
      <View className='h-6' />
      <CustomButton
        title={buttonText}
        onPress={onButtonPress}
        containerClassName="w-full max-w-xs"
      />
    </SafeAreaView>
  );
};

export default EmptyState;

