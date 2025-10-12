declare module 'react-native-date-time-scroll-picker' {
  import { ComponentType } from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  interface ColumnData {
    value: string;
    index: number;
  }

  interface DataSet {
    data: {
      firstColumn: ColumnData[];
      secondColumn: ColumnData[];
      thirdColumn: ColumnData[];
    };
    initials: [number, number, number];
  }

  interface ScrollPickerOptions {
    itemHeight?: number;
    wrapperHeight?: number;
    wrapperColor?: string;
    highlightColor?: string;
  }

  interface TextColor {
    primary?: string;
    secondary?: string;
    other?: string;
  }

  interface RNDateTimeSelectorProps {
    dataSet: DataSet;
    onValueChange: (value: any[]) => void;
    containerStyle?: ViewStyle;
    scrollPickerOptions?: ScrollPickerOptions;
    textStyle?: TextStyle;
    textColor?: TextColor;
    firstSeperatorComponent?: () => JSX.Element;
    secondSeperatorComponent?: () => JSX.Element;
    seperatorContainerStyle?: ViewStyle;
  }

  const RNDateTimeSelector: ComponentType<RNDateTimeSelectorProps>;
  export default RNDateTimeSelector;
}
