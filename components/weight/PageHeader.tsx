import { View, Text } from 'react-native'

interface PageHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

const PageHeader = ({title, actionText, onActionPress}) => {
  return (
    <View >
      <Text></Text>
    </View>
  )
}

export default PageHeader
