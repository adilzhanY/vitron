import { View, Text, TouchableOpacity } from 'react-native'

interface PageHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

const PageHeader = ({ title, actionText, onActionPress }) => {
  return (
    <View className="flex-row justify-between items-center mb-6">
      <Text className="text-black text-2xl font-interExtraBold">{title}</Text>
      {actionText && onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <Text className="text-gray-400 text-base font-interExtraBold">
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PageHeader;
