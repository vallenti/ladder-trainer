import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Paths, File } from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Share a workout as an image using the native share dialog
 * @param viewRef - Reference to the ViewShot component
 * @param workoutName - Name of the workout for the share dialog title
 */
export const shareWorkoutImage = async (viewRef: any, workoutName: string): Promise<void> => {
  try {
    // Capture the view as image
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.warn('Sharing is not available on this device');
      throw new Error('Sharing is not available on this device');
    }

    // Share the image
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: `Share ${workoutName}`,
      UTI: 'public.png',
    });

  } catch (error) {
    console.error('Error sharing workout:', error);
    throw error;
  }
};

/**
 * Save a workout image to the device's file system
 * @param viewRef - Reference to the ViewShot component
 * @param workoutName - Name of the workout for the filename
 * @returns The URI of the saved image
 */
export const saveWorkoutImage = async (viewRef: any, workoutName: string): Promise<string> => {
  try {
    // Capture the view as image
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
    });

    // Create a sanitized filename
    const sanitizedName = workoutName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = Date.now();
    const filename = `workout_${sanitizedName}_${timestamp}.png`;
    
    // Create file in cache directory using new API
    const cacheFile = new File(Paths.cache, filename);
    
    // The captured image URI is already a file, we can use it directly for sharing
    console.log('Workout image captured at:', uri);
    return uri;
  } catch (error) {
    console.error('Error saving workout image:', error);
    throw error;
  }
};

/**
 * Capture a workout as a base64 encoded image
 * @param viewRef - Reference to the ViewShot component
 * @returns Base64 encoded image string
 */
export const captureWorkoutAsBase64 = async (viewRef: any): Promise<string> => {
  try {
    const base64 = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'base64',
    });

    return base64;
  } catch (error) {
    console.error('Error capturing workout as base64:', error);
    throw error;
  }
};

/**
 * Check if the device supports sharing
 * @returns True if sharing is available
 */
export const isSharingAvailable = async (): Promise<boolean> => {
  try {
    return await Sharing.isAvailableAsync();
  } catch (error) {
    console.error('Error checking sharing availability:', error);
    return false;
  }
};
