import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface LoadingLogoProps {
  size?: number;
}

const LoadingLogo: React.FC<LoadingLogoProps> = ({ size = 120 }) => {
  const shimmerTranslate = useSharedValue(-size * 2);

  useEffect(() => {
    shimmerTranslate.value = withRepeat(
      withTiming(size * 2, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1, // infinite repeat
      false
    );
  }, [size]);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerTranslate.value }],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Your logo */}
      <Image
        source={require('@/assets/icons/applogo.png')}
        style={[styles.logo, { width: size, height: size }]}
        resizeMode="contain"
      />

      {/* Shimmer overlay */}
      <View style={styles.shimmerContainer}>
        <AnimatedLinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.4)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.shimmer,
            { width: size * 2 },
            shimmerStyle,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  logo: {
    opacity: 0.9,
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shimmer: {
    height: '100%',
  },
});

export default LoadingLogo;
