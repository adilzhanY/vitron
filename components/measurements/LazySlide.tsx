import React, { ReactNode, useEffect, useState } from "react";
import { View, Text } from "react-native";
import LoadingLogo from "@/components/shared/LoadingLogo";

interface LazySlideProps {
  shouldLoad: boolean;
  children: ReactNode;
  fallback?: ReactNode;
  slideName?: string; // For debugging
}

/**
 * LazySlide component prevents heavy child components from rendering
 * until shouldLoad is true. This is crucial for performance on weak devices.
 */
const LazySlide: React.FC<LazySlideProps> = ({ shouldLoad, children, fallback, slideName = "Unknown" }) => {
  const [hasLoaded, setHasLoaded] = useState(false);

  console.log(`🔍 [LazySlide - ${slideName}] Render called. shouldLoad=${shouldLoad}, hasLoaded=${hasLoaded}`);

  useEffect(() => {
    console.log(`📊 [LazySlide - ${slideName}] useEffect triggered. shouldLoad=${shouldLoad}, hasLoaded=${hasLoaded}`);

    if (shouldLoad && !hasLoaded) {
      console.log(`⏳ [LazySlide - ${slideName}] Scheduling load with requestAnimationFrame...`);

      // Use requestAnimationFrame to defer rendering to next frame
      // This keeps UI responsive while loading heavy components
      const frameId = requestAnimationFrame(() => {
        console.log(`✅ [LazySlide - ${slideName}] LOADING HEAVY COMPONENT NOW!`);
        setHasLoaded(true);
      });

      return () => {
        cancelAnimationFrame(frameId);
      };
    }
  }, [shouldLoad, hasLoaded, slideName]);

  if (!hasLoaded) {
    console.log(`⏸️ [LazySlide - ${slideName}] Showing fallback (not loaded yet)`);
    return (
      fallback || (
        <View className="flex-1 justify-center items-center">
          <LoadingLogo size={80} />
          <Text className="text-gray-600 font-benzinMedium mt-4">
            Loading...
          </Text>
        </View>
      )
    );
  }

  console.log(`🚀 [LazySlide - ${slideName}] Rendering children (heavy component)`);
  return <>{children}</>;
};

export default LazySlide;