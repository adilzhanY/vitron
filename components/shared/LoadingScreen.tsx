import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import LoadingLogo from './LoadingLogo';

interface LoadingScreenProps {
  message?: string;
  showSpinner?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  showSpinner = false
}) => {
  return (
    <View style={styles.container}>
      <LoadingLogo size={150} />

      {message && (
        <Text style={styles.message}>{message}</Text>
      )}

      {showSpinner && (
        <ActivityIndicator
          size="large"
          color="#22c55e"
          style={styles.spinner}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  message: {
    marginTop: 24,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  spinner: {
    marginTop: 16,
  },
});

export default LoadingScreen;
