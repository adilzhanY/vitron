import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { CameraView, CameraType, FlashMode, useCameraPermissions } from "expo-camera";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

type CaptureMode = "scan" | "label" | "gallery";

interface FoodCameraViewProps {
  onCapture: (imageUri: string, mode: CaptureMode) => Promise<void>;
  onClose: () => void;
}

const FoodCameraView: React.FC<FoodCameraViewProps> = ({ onCapture, onClose }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [selectedMode, setSelectedMode] = useState<CaptureMode>("scan");
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to use the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo?.uri) {
        await onCapture(photo.uri, selectedMode);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsCapturing(true);
        await onCapture(result.assets[0].uri, "gallery");
        setIsCapturing(false);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setIsCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      />

      {/* Header with close button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Mode selector buttons */}
      <View style={styles.modeContainer}>
        <TouchableOpacity
          onPress={() => setSelectedMode("scan")}
          style={[
            styles.modeButton,
            selectedMode === "scan" && styles.modeButtonActive,
          ]}
        >
          <MaterialIcons
            name="camera-alt"
            size={20}
            color={selectedMode === "scan" ? "#fff" : "#ddd"}
          />
          <Text
            style={[
              styles.modeButtonText,
              selectedMode === "scan" && styles.modeButtonTextActive,
            ]}
          >
            Scan Food
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedMode("label")}
          style={[
            styles.modeButton,
            selectedMode === "label" && styles.modeButtonActive,
          ]}
        >
          <MaterialIcons
            name="label"
            size={20}
            color={selectedMode === "label" ? "#fff" : "#ddd"}
          />
          <Text
            style={[
              styles.modeButtonText,
              selectedMode === "label" && styles.modeButtonTextActive,
            ]}
          >
            Food Label
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickImageFromGallery}
          style={styles.modeButton}
        >
          <MaterialIcons name="photo-library" size={20} color="#ddd" />
          <Text style={styles.modeButtonText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom controls */}
      <View style={styles.controls}>
        {/* Flash toggle */}
        <TouchableOpacity onPress={toggleFlash} style={styles.flashButton}>
          <Ionicons
            name={flash === "off" ? "flash-off" : "flash"}
            size={32}
            color="white"
          />
        </TouchableOpacity>

        {/* Capture button */}
        <TouchableOpacity
          onPress={takePicture}
          style={styles.captureButton}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>

        {/* Spacer for alignment */}
        <View style={styles.flashButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "#374151",
  },
  permissionButton: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  closeButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    padding: 8,
  },
  modeContainer: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: "#22c55e",
  },
  modeButtonText: {
    color: "#ddd",
    fontSize: 14,
    fontWeight: "600",
  },
  modeButtonTextActive: {
    color: "#fff",
  },
  controls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  flashButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#22c55e",
  },
});

export default FoodCameraView;
