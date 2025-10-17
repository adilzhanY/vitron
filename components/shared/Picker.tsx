import React, { useCallback, useEffect, useMemo, memo } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
  withTiming,
  Easing,
  SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

// Helper function to clamp values
const clamp = (value: number, min: number, max: number) => {
  "worklet";
  return Math.min(Math.max(value, min), max);
};

export type PickerItem<T> = {
  value: T;
  label?: string;
};

// Separate PickerItem component to avoid hooks in map
interface AnimatedPickerItemProps<T> {
  item: PickerItem<T>;
  index: number;
  itemHeight: number;
  containerHeight: number;
  translateY: SharedValue<number>;
  enable3DEffect: boolean;
  perspective: number;
  RADIUS: number;
  textStyle?: StyleProp<TextStyle>;
  selectedTextStyle?: StyleProp<TextStyle>;
  renderItem?: (params: {
    item: PickerItem<T>;
    index: number;
    isSelected: boolean;
  }) => React.ReactNode;
}

const AnimatedPickerItem = memo(<T,>({
  item,
  index,
  itemHeight,
  containerHeight,
  translateY,
  enable3DEffect,
  perspective,
  RADIUS,
  textStyle,
  selectedTextStyle,
  renderItem,
}: AnimatedPickerItemProps<T>) => {
  const animatedItemStyle = useAnimatedStyle(() => {
    const itemCenterY =
      index * itemHeight + translateY.value + itemHeight / 2;
    const distanceFromCenter = itemCenterY - containerHeight / 2;
    const absDistance = Math.abs(distanceFromCenter);

    const opacity = interpolate(
      absDistance,
      [0, itemHeight, itemHeight * 2],
      [1, 0.6, 0.3],
      Extrapolate.CLAMP,
    );

    if (!enable3DEffect) {
      return {
        height: itemHeight,
        justifyContent: "center" as const,
        alignItems: "center" as const,
        opacity,
      };
    }

    // Normalized distance from -1 to 1
    const normalizedDistance = interpolate(
      distanceFromCenter,
      [-RADIUS, 0, RADIUS],
      [-1, 0, 1],
      Extrapolate.CLAMP,
    );

    // Calculate rotation (in radians)
    const rotateXValue = Math.asin(normalizedDistance);

    return {
      height: itemHeight,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      opacity,
      transform: [
        { perspective },
        { rotateX: `${rotateXValue}rad` },
      ],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const itemCenterY =
      index * itemHeight + translateY.value + itemHeight / 2;
    const distanceFromCenter = Math.abs(
      itemCenterY - containerHeight / 2,
    );
    const isSelected = distanceFromCenter < itemHeight / 2;

    const fontSize = interpolate(
      distanceFromCenter,
      [0, itemHeight],
      [24, 20],
      Extrapolate.CLAMP,
    );

    return {
      fontSize: isSelected ? 24 : fontSize,
    };
  });

  if (renderItem) {
    return (
      <Animated.View style={animatedItemStyle}>
        {renderItem({
          item,
          index,
          isSelected: false,
        })}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedItemStyle}>
      <Animated.Text
        style={[
          {
            color: "#9CA3AF",
            fontFamily: "Benzin-Bold",
            textAlign: "center" as const,
          },
          textStyle,
          textAnimatedStyle,
          selectedTextStyle,
        ]}
      >
        {item.label ?? String(item.value)}
      </Animated.Text>
    </Animated.View>
  );
}) as <T>(props: AnimatedPickerItemProps<T>) => React.ReactElement;

export interface PickerProps<T> {
  data: readonly PickerItem<T>[];
  selectedValue?: T;
  defaultIndex?: number;
  onValueChange?: (value: T, index: number) => void;
  keyExtractor?: (item: PickerItem<T>, index: number) => string;
  renderItem?: (params: {
    item: PickerItem<T>;
    index: number;
    isSelected: boolean;
  }) => React.ReactNode;
  itemHeight?: number;
  visibleItems?: number;
  containerStyle?: StyleProp<ViewStyle>;
  highlightStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  selectedTextStyle?: StyleProp<TextStyle>;
  // 3D Effect props
  enable3DEffect?: boolean;
  perspective?: number;
  // Mask/Gradient props
  showGradientMask?: boolean;
  // Animation props
  decayDeceleration?: number;
  snapAnimationDuration?: number;
}

const DEFAULT_ITEM_HEIGHT = 50;
const DEFAULT_VISIBLE_ITEMS = 5;
const DEFAULT_PERSPECTIVE = 600;
const DEFAULT_DECAY_DECELERATION = 0.998;
const DEFAULT_SNAP_DURATION = 300;

const Picker = <T,>({
  data,
  selectedValue,
  defaultIndex = 0,
  onValueChange,
  keyExtractor,
  renderItem,
  itemHeight = DEFAULT_ITEM_HEIGHT,
  visibleItems = DEFAULT_VISIBLE_ITEMS,
  containerStyle,
  highlightStyle,
  textStyle,
  selectedTextStyle,
  enable3DEffect = false,
  perspective = DEFAULT_PERSPECTIVE,
  showGradientMask = false,
  decayDeceleration = DEFAULT_DECAY_DECELERATION,
  snapAnimationDuration = DEFAULT_SNAP_DURATION,
}: PickerProps<T>) => {
  // Shared values for animation
  const translateY = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const containerHeight = useMemo(
    () => Math.max(itemHeight, itemHeight * visibleItems),
    [itemHeight, visibleItems],
  );

  // Calculate radius for 3D effect
  const RADIUS_REL = visibleItems * 0.5;
  const RADIUS = RADIUS_REL * itemHeight;

  const getKey = useCallback(
    (item: PickerItem<T>, index: number) => {
      return keyExtractor ? keyExtractor(item, index) : `${index}`;
    },
    [keyExtractor],
  );

  // Initialize position based on selectedValue or defaultIndex
  useEffect(() => {
    let initialIndex = defaultIndex;
    if (selectedValue !== undefined) {
      const valueIndex = data.findIndex((item) => item.value === selectedValue);
      if (valueIndex >= 0) {
        initialIndex = valueIndex;
      }
    }
    const clampedIndex = Math.min(Math.max(initialIndex, 0), data.length - 1);
    // Adjust for centering - add offset to position selected item at center
    const centerOffset = (containerHeight - itemHeight) / 2;
    const initialOffset = -clampedIndex * itemHeight + centerOffset;
    translateY.value = initialOffset;
    offsetY.value = initialOffset;
  }, []);

  // Handle value change callback
  const handleValueChange = useCallback(
    (index: number) => {
      const clampedIndex = Math.min(
        Math.max(Math.round(index), 0),
        data.length - 1,
      );
      if (onValueChange) {
        const item = data[clampedIndex];
        onValueChange(item.value, clampedIndex);
      }
    },
    [data, onValueChange],
  );

  // Pan gesture with Gesture API
  const panGesture = Gesture.Pan()
    .onStart(() => {
      offsetY.value = translateY.value;
    })
    .onUpdate((event) => {
      const newValue = offsetY.value + event.translationY;
      const centerOffset = (containerHeight - itemHeight) / 2;
      const maxScroll = -(data.length - 1) * itemHeight + centerOffset;
      const minScroll = centerOffset;
      translateY.value = clamp(newValue, maxScroll, minScroll);
    })
    .onEnd((event) => {
      // Calculate snap points with center offset
      const centerOffset = (containerHeight - itemHeight) / 2;
      const snapPoints = data.map((_, i) => -i * itemHeight + centerOffset);

      // Find the nearest snap point
      let nearestPoint = snapPoints[0];
      let minDistance = Math.abs(translateY.value - nearestPoint);

      snapPoints.forEach((point) => {
        const distance = Math.abs(translateY.value - point);
        if (distance < minDistance) {
          minDistance = distance;
          nearestPoint = point;
        }
      });

      // Apply decay if velocity is significant, otherwise snap
      if (Math.abs(event.velocityY) > 20) {
        const maxScroll = -(data.length - 1) * itemHeight + centerOffset;
        const minScroll = centerOffset;
        translateY.value = withDecay(
          {
            velocity: event.velocityY,
            deceleration: decayDeceleration,
            clamp: [maxScroll, minScroll],
          },
          (finished) => {
            if (finished) {
              // Snap to nearest after decay
              let finalSnapPoint = snapPoints[0];
              let finalMinDistance = Math.abs(
                translateY.value - finalSnapPoint,
              );

              snapPoints.forEach((point) => {
                const distance = Math.abs(translateY.value - point);
                if (distance < finalMinDistance) {
                  finalMinDistance = distance;
                  finalSnapPoint = point;
                }
              });

              translateY.value = withTiming(
                finalSnapPoint,
                {
                  duration: snapAnimationDuration,
                  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                },
                () => {
                  offsetY.value = finalSnapPoint;
                  const selectedIndex = Math.round(
                    (-finalSnapPoint + centerOffset) / itemHeight,
                  );
                  runOnJS(handleValueChange)(selectedIndex);
                },
              );
            }
          },
        );
      } else {
        translateY.value = withTiming(
          nearestPoint,
          {
            duration: snapAnimationDuration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          },
          () => {
            offsetY.value = nearestPoint;
            const centerOffset = (containerHeight - itemHeight) / 2;
            const selectedIndex = Math.round(
              (-nearestPoint + centerOffset) / itemHeight,
            );
            runOnJS(handleValueChange)(selectedIndex);
          },
        );
      }
    });

  // Update when selectedValue changes externally
  useEffect(() => {
    if (selectedValue === undefined) return;
    const valueIndex = data.findIndex((item) => item.value === selectedValue);
    if (valueIndex >= 0) {
      const centerOffset = (containerHeight - itemHeight) / 2;
      const targetOffset = -valueIndex * itemHeight + centerOffset;
      translateY.value = withSpring(targetOffset, {
        damping: 20,
        stiffness: 90,
      });
      offsetY.value = targetOffset;
    }
  }, [selectedValue, data, itemHeight]);

  // Container animated style
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <View
      style={[styles.container, { height: containerHeight }, containerStyle]}
    >
      {/* Gradient mask overlay */}
      {showGradientMask && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View
            style={[
              styles.gradientTop,
              { height: (containerHeight - itemHeight) / 2 },
            ]}
          />
          <View style={{ height: itemHeight }} />
          <View
            style={[
              styles.gradientBottom,
              { height: (containerHeight - itemHeight) / 2 },
            ]}
          />
        </View>
      )}

      {/* Highlight bar */}
      <View
        pointerEvents="none"
        style={[
          styles.highlight,
          {
            top: (containerHeight - itemHeight) / 2,
            height: itemHeight,
          },
          highlightStyle,
        ]}
      />

      {/* Items with gesture handling */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={StyleSheet.absoluteFill}>
          <Animated.View style={containerAnimatedStyle}>
            {data.map((item, index) => {
              const key = getKey(item, index);
              return (
                <AnimatedPickerItem
                  key={key}
                  item={item}
                  index={index}
                  itemHeight={itemHeight}
                  containerHeight={containerHeight}
                  translateY={translateY}
                  enable3DEffect={enable3DEffect}
                  perspective={perspective}
                  RADIUS={RADIUS}
                  textStyle={textStyle}
                  selectedTextStyle={selectedTextStyle}
                  renderItem={renderItem}
                />
              );
            })}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "center",
    position: "relative",
    overflow: "hidden",
  },
  highlight: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    zIndex: 10,
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    color: "#9CA3AF",
    fontFamily: "Benzin-Bold",
    textAlign: "center",
  },
  gradientTop: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  gradientBottom: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
});

export default Picker;
