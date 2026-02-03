# Share Workout as Image Feature

## Overview
This feature allows users to share their completed workouts as beautiful, shareable images on social media or messaging apps. The implementation uses React Native ViewShot to capture a styled component as an image.

## Implementation Details

### Files Created

1. **`src/components/ShareableWorkoutCard.tsx`**
   - A specially designed component optimized for image sharing
   - Size: 1080px width (Instagram-optimized)
   - Contains: Workout stats, exercise summary, round times, and branding

2. **`src/utils/shareUtils.ts`**
   - Utility functions for capturing and sharing images
   - `shareWorkoutImage()` - Opens native share dialog
   - `saveWorkoutImage()` - Saves image to device
   - `captureWorkoutAsBase64()` - Returns base64 encoded image
   - `isSharingAvailable()` - Checks if sharing is supported

3. **Updated: `src/screens/workouts/WorkoutCompleteScreen.tsx`**
   - Added "Share Results" button
   - Hidden ViewShot component that renders the shareable card
   - Loading states and error handling with Snackbar feedback

### Dependencies Installed

```json
{
  "react-native-view-shot": "^3.8.0",
  "expo-sharing": "~12.0.1",
  "expo-file-system": "~17.0.1"
}
```

## How It Works

1. **Hidden Component**: A `ShareableWorkoutCard` is rendered off-screen using ViewShot
2. **Capture**: When user taps "Share Results", the card is captured as a PNG image
3. **Share**: The native share dialog opens with the generated image
4. **Feedback**: User sees a loading indicator and success/error message

## Customization Options

### Change Image Size

Edit `ShareableWorkoutCard.tsx`, line 51:

```typescript
container: {
  width: 1080,  // Change this value
  // For Instagram Square: 1080x1080
  // For Instagram Story: 1080x1920
  // For Twitter: 1200x675
}
```

### Customize Design

The `ShareableWorkoutCard` component uses your app's theme automatically. You can customize:

- **Colors**: Uses `theme.colors` from React Native Paper
- **Font Sizes**: Adjust in the StyleSheet (lines 150+)
- **Layout**: Modify the component structure (lines 30-135)
- **Branding**: Toggle with `showBranding` prop or edit the footer section

### Add More Stats

To display additional workout statistics, edit `ShareableWorkoutCard.tsx`:

```typescript
// Example: Add average round time
const avgRoundTime = workout.totalTime / workout.rounds.length;

// Then add to the UI:
<View style={styles.stat}>
  <Text style={styles.statLabel}>Avg Round</Text>
  <Text style={styles.statValue}>{formatTime(avgRoundTime)}</Text>
</View>
```

### Change Image Quality/Format

Edit `shareUtils.ts`, line 17:

```typescript
const uri = await captureRef(viewRef, {
  format: 'png',  // or 'jpg', 'webm'
  quality: 1,     // 0-1 (1 = highest quality)
  result: 'tmpfile',
});
```

## Advanced Features You Can Add

### 1. Multiple Design Templates

```typescript
// Add template prop to ShareableWorkoutCard
interface ShareableWorkoutCardProps {
  workout: Workout;
  template?: 'minimal' | 'athletic' | 'detailed';
}

// Then create different layouts based on template
```

### 2. Background Image/Gradient

```typescript
import { LinearGradient } from 'expo-linear-gradient';

// Wrap container in gradient:
<LinearGradient
  colors={['#4c669f', '#3b5998', '#192f6a']}
  style={styles.container}
>
  {/* existing content */}
</LinearGradient>
```

### 3. Personal Records Badge

```typescript
// Compare to previous workouts
const isPR = workout.totalTime < previousBestTime;

{isPR && (
  <View style={styles.prBadge}>
    <MaterialCommunityIcons name="trophy" size={30} color="gold" />
    <Text>Personal Record!</Text>
  </View>
)}
```

### 4. Save to Camera Roll

Install `expo-media-library`:
```bash
npx expo install expo-media-library
```

Then add function to `shareUtils.ts`:
```typescript
import * as MediaLibrary from 'expo-media-library';

export const saveToCameraRoll = async (viewRef: any) => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission denied');
  }

  const uri = await captureRef(viewRef, {
    format: 'png',
    quality: 1,
  });

  await MediaLibrary.saveToLibraryAsync(uri);
};
```

### 5. Add Charts/Graphs

Install `react-native-svg` and `react-native-chart-kit`:
```bash
npx expo install react-native-svg react-native-chart-kit
```

Then add to ShareableWorkoutCard:
```typescript
import { LineChart } from 'react-native-chart-kit';

<LineChart
  data={{
    labels: workout.rounds.map(r => `R${r.roundNumber}`),
    datasets: [{ data: workout.rounds.map(r => r.duration) }]
  }}
  width={1000}
  height={220}
  chartConfig={{...}}
/>
```

## Troubleshooting

### Share button doesn't work
- Check console for errors
- Ensure ViewShot ref is properly attached
- Verify sharing permissions on device

### Image quality is poor
- Increase quality setting to 1
- Use PNG format instead of JPG
- Increase container width for higher resolution

### Component not rendering correctly
- Check that all workout data exists
- Ensure theme is properly initialized
- Test with different ladder types

### Sharing not available on device
- Some simulators don't support sharing
- Test on a real device
- Check `isSharingAvailable()` returns true

## Usage Example

```typescript
import { shareWorkoutImage } from './utils/shareUtils';

// In your component:
const shareViewRef = useRef(null);

const handleShare = async () => {
  try {
    await shareWorkoutImage(shareViewRef.current, 'My Workout');
  } catch (error) {
    console.error('Share failed:', error);
  }
};

// In render:
<ViewShot ref={shareViewRef} style={{ position: 'absolute', left: -9999 }}>
  <ShareableWorkoutCard workout={completedWorkout} />
</ViewShot>

<Button onPress={handleShare}>Share</Button>
```

## Testing

1. Complete a workout in the app
2. On the completion screen, tap "Share Results"
3. Wait for the loading indicator
4. Native share dialog should appear with the workout image
5. Share to any app (Messages, Instagram, etc.)

## Performance Notes

- Image generation takes ~500ms-1s depending on device
- Images are cached temporarily and cleaned up by the system
- ViewShot is rendered off-screen, so no performance impact on UI
- Consider debouncing the share button to prevent multiple taps

## Future Enhancements

- [ ] Multiple design templates (minimal, athletic, detailed)
- [ ] Custom background colors/images
- [ ] Personal record indicators
- [ ] Comparison to previous workouts
- [ ] Weekly/monthly summary cards
- [ ] Direct posting to social media APIs
- [ ] Save to camera roll option
- [ ] Round-by-round pace graphs
- [ ] User-selectable stat cards
- [ ] Dark mode optimization

## Credits

Built using:
- [react-native-view-shot](https://github.com/gre/react-native-view-shot)
- [expo-sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)
- [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/)
