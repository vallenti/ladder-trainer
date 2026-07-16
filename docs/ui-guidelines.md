# UI Guidelines — LadFit

> Last updated: June 24, 2026

---

## Design System

LadFit uses **Material Design 3 (MD3)** via `react-native-paper`. All UI decisions should be grounded in the MD3 spec and the custom theme defined in `src/constants/theme.ts`.

---

## Color Palette

### Light Theme

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#FF6B35` | Primary buttons, active states, key accents |
| `primaryContainer` | `#FFEEE8` | Chips, highlighted cards |
| `secondary` | `#4ECDC4` | Secondary actions, badges, progress |
| `secondaryContainer` | `#E0F7F6` | Secondary chip backgrounds |
| `tertiary` | `#F59E0B` | Warnings, timer highlights |
| `error` | `#E74C3C` | Destructive actions, validation errors |
| `background` | `#F8F9FA` | Screen background |
| `surface` | `#FFFFFF` | Card surfaces |
| `surfaceVariant` | `#F1F3F5` | Section separators, input fields |
| `onSurface` | `#1A1A1A` | Primary text on white |
| `onSurfaceVariant` | `#6C757D` | Secondary text, subtitles |
| `success` | `#2ECC71` | Completion states, round checkmarks |

### Dark Theme

| Token | Hex | Notes |
|---|---|---|
| `primary` | `#FF6B35` | Same orange — consistent brand identity |
| `background` | `#121212` | True dark |
| `surface` | `#1E1E1E` | Card background |
| `surfaceVariant` | `#2C2C2C` | Input, section backgrounds |
| `success` | `#3DDC84` | Brighter green for dark bg contrast |

---

## Typography

Use `react-native-paper` `Text` component with `variant` prop. Do **not** use bare React Native `Text`.

| Variant | Usage |
|---|---|
| `displayLarge` | Hero numbers (e.g., countdown timer) |
| `headlineLarge` | Screen titles |
| `headlineMedium` | Section headers, workout names |
| `titleLarge` | Card titles |
| `titleMedium` | Sub-section labels |
| `bodyLarge` | Primary body copy |
| `bodyMedium` | Secondary body copy |
| `bodySmall` | Captions, timestamps, metadata |
| `labelLarge` | Button labels |

---

## Spacing

Always import and use spacing tokens from `theme.ts`:

```typescript
import { spacing } from '../../constants/theme';

// Usage in StyleSheet
padding: spacing.md   // 16
gap: spacing.sm       // 8
marginBottom: spacing.lg  // 24
```

| Token | Value |
|---|---|
| `spacing.xs` | 4 |
| `spacing.sm` | 8 |
| `spacing.md` | 16 |
| `spacing.lg` | 24 |
| `spacing.xl` | 32 |

---

## Border Radius

```typescript
import { borderRadius } from '../../constants/theme';
```

| Token | Value | Usage |
|---|---|---|
| `borderRadius.sm` | 4 | Tags, chips |
| `borderRadius.md` | 8 | Cards, inputs |
| `borderRadius.lg` | 16 | Bottom sheets, large cards |

---

## Component Guidelines

### Cards
- Use `react-native-paper` `Card` component.
- Apply `elevation` of 1–2 for workout cards; avoid shadows > 4 to keep UI clean.
- Use `surface` background for card content.

### Buttons
- **Primary action** on a screen: `Button mode="contained"` (filled).
- **Secondary / cancel**: `Button mode="outlined"`.
- **Destructive actions** (delete): `Button textColor={theme.colors.error}`.
- **Icon buttons**: `IconButton` from react-native-paper.

### Inputs
- Use `TextInput` from `react-native-paper`.
- Always include a `label` and `mode="outlined"`.
- Numeric inputs: `keyboardType="numeric"` + `returnKeyType="done"`.

### Navigation Header
- All headers are hidden (`headerShown: false`) — custom headers are implemented inside screens.
- Back navigation via `useNavigation().goBack()` or custom header buttons.

---

## Workout Flow UI States

| State | Visual Indicator |
|---|---|
| Countdown | Large countdown number, full-screen primary color background |
| Active workout | Exercise list, round counter, elapsed timer |
| Rest period | Countdown timer, next exercise preview |
| Paused | Dimmed UI, resume/discard dialog |
| Workout complete | Summary card, share button, celebration state |

---

## Accessibility Requirements (TODO)

- [ ] All interactive elements must have `accessibilityLabel`.
- [ ] Minimum touch target size: 44×44 pts.
- [ ] Color contrast ratio ≥ 4.5:1 for body text.
- [ ] Support Dynamic Type (system font scaling).
- [ ] Timer screens should announce round completion via `AccessibilityInfo.announceForAccessibility`.

---

## Responsive Layout

- Designs are based on a mobile-first approach (iPhone/Android phone).
- Use `Dimensions.get('window')` only when absolutely necessary — prefer Flexbox.
- Avoid hardcoded pixel widths for layout; use `flex: 1` and percentage-based widths.
- Safe area: always wrap screen content in `SafeAreaView` from `react-native-safe-area-context`.

---

## Loading States

- Use `ActivityIndicator` from `react-native-paper` for async operations.
- Stores expose `isLoading: boolean` where applicable — bind this to `ActivityIndicator`.
- Never show a blank screen during a loading state.

---

## Error States

- Show `Snackbar` (react-native-paper) for transient, non-critical errors.
- For critical errors (data corruption), show an inline `Banner` or `Dialog`.
- Never silently swallow errors visible to the user.

---

## Icons

Icons come from `@expo/vector-icons` (MaterialCommunityIcons is the primary set):

```tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
<MaterialCommunityIcons name="dumbbell" size={24} color={theme.colors.primary} />
```

Common icon names used in the app:
- `dumbbell` — workouts
- `history` — logbook
- `cog` — settings
- `play` — start workout
- `pause` — pause
- `check` — complete
- `share-variant` — share
- `delete` — delete

---

## Animation

- Use `react-native-reanimated` for performant animations.
- Keep animations ≤ 300ms for micro-interactions.
- Do not animate on the JS thread — use `useSharedValue` and `useAnimatedStyle`.
- Respect the `reduceMotion` accessibility setting (TODO).
