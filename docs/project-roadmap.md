# Project Roadmap — LadFit

> Planning only, not current behavior. Confirm shipped status in source and `ai/feature-index.md`. Acceptance criteria must address persistence, lifecycle, errors, accessibility, and tests.

> Last updated: June 24, 2026  
> Status: v1.0.0 — Active Development

---

## Current Version: v1.0.0

### Shipped Features

- [x] 8 ladder workout types: Christmas, Ascending, Descending, Pyramid, Flexible, Chipper, AMRAP, ForReps
- [x] Workout template CRUD (create, edit, duplicate, delete)
- [x] Live workout session with round timing
- [x] Rest period timer between rounds
- [x] Countdown screen before workout starts
- [x] Pause / resume mid-workout with persistence
- [x] Workout completion summary screen
- [x] Buy-In / Buy-Out exercise support
- [x] Workout history logbook with search and date filters
- [x] Share workout results as PNG image
- [x] Exercise catalog (default + custom exercises)
- [x] Light / dark theme toggle
- [x] Benchmark workouts (Fran, 12 Days, etc.)
- [x] Mute / unmute workout audio beeps
- [x] Timer focus mode (simplified active screen)
- [x] Keep screen awake during active workout

---

## v1.1.0 — Quality & Polish

**Target: Q3 2026**

- [ ] **Add ESLint + Prettier configuration** — enforce code style automatically
- [ ] **Add unit test suite** — Jest tests for ladder strategies, calculations, and stores
- [ ] **Fix `@types/react-native` version** — align with React Native 0.81.x
- [ ] **Remove dead dependencies** — `axios`, `HomeScreen.tsx`, `ExampleComponent.tsx`
- [ ] **Add React Error Boundary** — prevent unhandled render errors from crashing app
- [ ] **Haptic feedback on round completion** — use `expo-haptics` (dependency already installed)
- [ ] **Template duplication** from WorkoutDetails screen
- [ ] **Workout notes** — add optional `notes: string` field to Workout session
- [ ] **Improved exercise search** — highlight matching characters in autocomplete results
- [ ] **Accessibility labels** — add `accessibilityLabel` to all interactive elements

---

## v1.2.0 — Statistics & Analytics

**Target: Q4 2026**

- [ ] **Personal Records (PR) tracking** — detect and highlight fastest time for a named workout
- [ ] **Volume analytics** — total reps per exercise over time
- [ ] **Workout frequency calendar** — heatmap-style calendar in Logbook
- [ ] **Per-ladder-type stats** — most used exercises, average workout duration
- [ ] **History export** — export workout history as CSV or JSON
- [ ] **Streak tracking** — daily workout streak counter

---

## v1.3.0 — Social & Sharing

**Target: Q1 2027**

- [ ] **Strava integration** — post completed workouts to Strava activity feed (type: `StravaTokens` already defined)
- [ ] **Shareable workout link** — deep link to open a template in LadFit (requires backend)
- [ ] **QR code template sharing** — encode template as QR for in-person sharing
- [ ] **Community benchmark library** — browse pre-built workouts contributed by users (requires backend)

---

## v2.0.0 — Cloud & Multi-Device

**Target: H1 2027**

- [ ] **User accounts** — optional sign-up for cloud features
- [ ] **Cloud sync** — sync workout templates and history across devices
- [ ] **Coach / athlete mode** — coaches can assign workouts to athletes
- [ ] **Workout programming** — schedule workouts on a calendar week view
- [ ] **Apple HealthKit / Google Fit integration** — write workout data to health platforms

---

## Technical Debt Backlog

| Priority | Item | Effort |
|---|---|---|
| High | Add ESLint + Prettier | Small |
| High | Add unit tests (≥80% coverage on utils + stores) | Medium |
| High | Fix `@types/react-native` version mismatch | Small |
| High | Add React Error Boundary | Small |
| Medium | Remove `axios` and dead files | Small |
| Medium | Replace `any` types in `types/index.ts` | Small |
| Medium | Consider SQLite for workout history as data grows | Large |
| Low | Investigate `react-native-view-shot` alternatives | Medium |
| Low | Storybook for component library | Medium |

---

## Discovered Opportunities for AI Automation

- **AI workout generation**: Given user's fitness level, goals, and available equipment, generate a custom ladder workout template.
- **Rep count suggestions**: Based on user's history, suggest appropriate startingReps / stepSize values.
- **Coaching cues**: Surface exercise form tips during active workout (rest screen).
- **Progress insights**: Natural language summary of recent workout performance trends.
