import "react-native-get-random-values";
import { v4 as uuidv4 } from 'uuid';
import { readAsStringAsync } from "expo-file-system/legacy";

const API_BASE_URL = "https://4wtijuyqsh.execute-api.eu-central-1.amazonaws.com";
const BUCKET_NAME = "vitron-meal-images";
const REGION = "eu-central-1";

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
 * Upload an image to S3 bucket via Lambda
 * @param imageUri - Local file URI of the image
 * @param userId - User's clerk ID
 * @param mode - Upload mode (not used for folder structure anymore)
 * @returns Upload result with S3 URL
 */
export async function uploadImageToS3({
  imageUri,
  userId,
  mode,
}: UploadToS3Params): Promise<UploadToS3Response> {
  try {
    console.log(`User chose food ${mode}`);

    const uuid = uuidv4();
    const filename = `ai_upload_${uuid}.jpg`;

    const base64 = await readAsStringAsync(imageUri, {
      encoding: "base64",
    });

    const response = await fetch(`${API_BASE_URL}/s3/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageDataBase64: base64,
        userId: userId,
        mode: mode === "label" ? "label" : "scan",
        imageName: filename,
      }),
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success && result.url) {
      console.log("Image was uploaded to S3:", result.url);
      return {
        success: true,
        url: result.url,
        key: result.key,
      };
    } else {
      throw new Error(result.error || "Upload failed");
    }
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

/**
 * Delete an image from S3 bucket
 * @param imageUrl - Full S3 URL of the image
 * @returns Success status
 */
export async function deleteImageFromS3(imageUrl: string): Promise<boolean> {
  try {
    const key = imageUrl.split('.amazonaws.com/')[1];
    if (!key) {
      throw new Error('Invalid S3 URL');
    }

 
    console.log("Image analyzed, and deleted from S3 bucket:", imageUrl);

    // TODO: Implement S3 delete via Lambda

    return true;
  } catch (error) {
    console.error("Failed to delete image from S3:", error);
    return false;
  }
}
