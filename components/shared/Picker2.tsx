import React from 'react';
import { StyleProp, ViewStyle, TextStyle } from 'react-native';
import WheelPicker from '@quidone/react-native-wheel-picker';

export type PickerItem<T> = {
  value: T;
  label?: string;
};

export interface Picker2Props<T> {
  data: readonly PickerItem<T>[];
  value?: T;
  onValueChanged?: (item: PickerItem<T>, index: number) => void;
  onValueChanging?: (item: PickerItem<T>, index: number) => void;
  keyExtractor?: (item: PickerItem<T>, index: number) => string;
  renderItem?: (params: {
    item: PickerItem<T>;
    index: number;
    isSelected: boolean;
  }) => React.ReactNode;
  itemHeight?: number;
  visibleItemCount?: number;
  width?: number | string;
  readOnly?: boolean;
  enableScrollByTapOnItem?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  itemTextStyle?: StyleProp<TextStyle>;
  overlayItemStyle?: StyleProp<ViewStyle>;
}

/**
 * Picker2 component using @quidone/react-native-wheel-picker
 * This is a new implementation to test and compare with the existing Picker component
 */
const Picker2 = <T,>({
  data,
  value,
  onValueChanged,
  onValueChanging,
  keyExtractor,
  renderItem,
  itemHeight = 50,
  visibleItemCount = 5,
  width = '100%',
  readOnly = false,
  enableScrollByTapOnItem = true,
  containerStyle,
  itemTextStyle,
  overlayItemStyle,
}: Picker2Props<T>) => {
  // Transform our data format to the library's expected format
  const transformedData = data.map((item, index) => ({
    value: item.value,
    label: item.label ?? String(item.value),
  }));

  // Handle value changed event
  const handleValueChanged = React.useCallback(
    ({ item, index }: { item: { value: T; label: string }; index: number }) => {
      if (onValueChanged) {
        const originalItem = data[index];
        onValueChanged(originalItem, index);
      }
    },
    [data, onValueChanged]
  );

  // Handle value changing event (while scrolling)
  const handleValueChanging = React.useCallback(
    ({ item, index }: { item: { value: T; label: string }; index: number }) => {
      if (onValueChanging) {
        const originalItem = data[index];
        onValueChanging(originalItem, index);
      }
    },
    [data, onValueChanging]
  );

  // Key extractor
  const getKey = React.useCallback(
    (item: { value: T; label: string }, index: number) => {
      if (keyExtractor) {
        const originalItem = data[index];
        return keyExtractor(originalItem, index);
      }
      return `${index}`;
    },
    [data, keyExtractor]
  );

  // Custom render item
  const customRenderItem = React.useCallback(
    ({
      item,
      index,
      isSelected,
    }: {
      item: { value: T; label: string };
      index: number;
      isSelected: boolean;
    }) => {
      if (renderItem) {
        const originalItem = data[index];
        return renderItem({ item: originalItem, index, isSelected });
      }
      return undefined;
    },
    [data, renderItem]
  );

  return (
    <WheelPicker
      data={transformedData}
      value={value as T}
      onValueChanged={handleValueChanged}
      onValueChanging={handleValueChanging}
      keyExtractor={getKey}
      renderItem={renderItem ? (customRenderItem as any) : undefined}
      itemHeight={itemHeight}
      visibleItemCount={visibleItemCount}
      width={width as number}
      readOnly={readOnly}
      enableScrollByTapOnItem={enableScrollByTapOnItem}
      style={containerStyle}
      itemTextStyle={itemTextStyle}
      overlayItemStyle={overlayItemStyle}
    />
  );
};

export default Picker2;
