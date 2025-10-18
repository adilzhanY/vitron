import React, { ReactNode, useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";

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
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={{ marginTop: 12, color: "#9CA3AF", fontFamily: "Benzin-Bold" }}>
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
