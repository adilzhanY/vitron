import "react-native-get-random-values";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Sha256 } from "@aws-crypto/sha256-js";
import { readAsStringAsync } from "expo-file-system/legacy";

const BUCKET_NAME = "vitron-meal-images";
const REGION = "eu-central-1";

// Initialize S3 client with React Native compatible configuration
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
  },
  sha256: Sha256,
});

export type ImageUploadMode = "scan" | "label" | "gallery";

interface UploadToS3Params {
  imageUri: string;
  userId: string;
  mode: ImageUploadMode;
}

interface UploadToS3Response {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Upload an image to S3 bucket
 * @param imageUri - Local file URI of the image
 * @param userId - User's clerk ID
 * @param mode - Upload mode: 'scan' for meal-images folder, 'label' for meal-labels folder
 * @returns Upload result with S3 URL
 */
export async function uploadImageToS3({
  imageUri,
  userId,
  mode,
}: UploadToS3Params): Promise<UploadToS3Response> {
  try {
    // Determine folder and filename prefix based on mode
    const folder = mode === "label" ? "meal-labels" : "meal-images";
    const prefix = mode === "label" ? "meal_label" : "meal_image";

    // Generate timestamp
    const timestamp = Date.now();

    // Create filename: {prefix}{userId}{timestamp}.jpg
    const filename = `${prefix}_${userId}_${timestamp}.jpg`;
    const key = `${folder}/${filename}`;

    // Read the file as base64 using legacy API
    const base64 = await readAsStringAsync(imageUri, {
      encoding: "base64",
    });

    // Convert base64 to Uint8Array (React Native compatible)
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: bytes,
      ContentType: "image/jpeg",
    });

    await s3Client.send(command);

    // Construct the public URL
    const url = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

    console.log("Image uploaded successfully to S3:", url);

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get the public URL for an S3 object
 * @param key - S3 object key
 * @returns Public URL
 */
export function getS3PublicUrl(key: string): string {
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
}
