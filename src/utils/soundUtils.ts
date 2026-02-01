import { Audio } from 'expo-av';

let audioEnabled = true;

/**
 * Play a beep sound at the specified frequency and duration
 * @param frequency - Frequency in Hz (default 800)
 * @param duration - Duration in milliseconds (default 200)
 */
export const playBeep = async (frequency: number = 800, duration: number = 200): Promise<void> => {
  if (!audioEnabled) return;
  
  try {
    // Set audio mode for playback
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // Create a simple beep sound using Audio
    // Note: Expo AV doesn't have built-in tone generation, so we'll use a workaround
    // We'll create a data URI with a simple sine wave
    const { sound } = await Audio.Sound.createAsync(
      { uri: generateBeepDataUri(frequency, duration) },
      { shouldPlay: true, volume: 1.0 }
    );

    // Unload sound after it finishes playing
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.warn('Error playing beep:', error);
  }
};

/**
 * Play a short beep (300ms at 800Hz)
 */
export const playShortBeep = async (): Promise<void> => {
  await playBeep(800, 300);
};

/**
 * Play a long beep (1000ms at 800Hz)
 */
export const playLongBeep = async (): Promise<void> => {
  await playBeep(800, 1000);
};

/**
 * Generate a data URI for a beep sound
 * This creates a simple WAV file with a sine wave
 */
const generateBeepDataUri = (frequency: number, durationMs: number): string => {
  const sampleRate = 44100;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const amplitude = 0.3; // 30% volume to avoid clipping
  
  // WAV header
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  // "RIFF" chunk descriptor
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + numSamples * 2, true); // file size - 8
  view.setUint32(8, 0x57415645, false); // "WAVE"
  
  // "fmt " sub-chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // subchunk size
  view.setUint16(20, 1, true); // audio format (PCM)
  view.setUint16(22, 1, true); // number of channels (mono)
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  
  // "data" sub-chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, numSamples * 2, true); // subchunk size
  
  // Generate samples
  const samples = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const value = Math.sin(2 * Math.PI * frequency * t) * amplitude;
    samples[i] = Math.floor(value * 32767);
  }
  
  // Combine header and samples
  const wavData = new Uint8Array(44 + numSamples * 2);
  wavData.set(new Uint8Array(header), 0);
  wavData.set(new Uint8Array(samples.buffer), 44);
  
  // Convert to base64
  const base64 = arrayBufferToBase64(wavData);
  return `data:audio/wav;base64,${base64}`;
};

/**
 * Convert ArrayBuffer to base64 string
 */
const arrayBufferToBase64 = (buffer: Uint8Array): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Enable or disable audio
 */
export const setAudioEnabled = (enabled: boolean): void => {
  audioEnabled = enabled;
};

/**
 * Get current audio enabled state
 */
export const isAudioEnabled = (): boolean => {
  return audioEnabled;
};
