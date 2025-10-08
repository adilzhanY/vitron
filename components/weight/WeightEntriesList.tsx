import React from 'react';
import { View, Text } from 'react-native';
import { format, parseISO } from 'date-fns';
import { WeightEntry } from '@/types/type';

interface WeightEntriesListProps {
  entries: WeightEntry[];
}

const WeightEntriesList: React.FC<WeightEntriesListProps> = ({ entries }) => {
  return (
    <View className='mt-8 p-4 bg-white rounded-lg'>
      <Text className='text-black font-benzinExtraBold text-lg mb-2'>All Entries</Text>
      {entries.map((entry, index) => (
        <View key={index} className='flex-row justify-between py-2 border-b border-gray-100'>
          <Text className='text-gray-400 font-benzinBold'>{format(parseISO(entry.date), 'eeee, d MMM')}</Text>
          <Text className='text-black font-benzinBold'>{entry.weight.toFixed(1)} kg</Text>
        </View>
      ))}
    </View>
  );
};

export default WeightEntriesList;

