# Bug Report Template — LadFit

> Record ladder type, persisted-data age, foreground/background and pause/rest/buy-in/out state, plus whether the issue occurs in active UI, completion, logbook, text share, or image share.

> Use this template when reporting a bug to an AI agent or filing a GitHub issue.

---

## Bug Report

**Title:**  
<!-- Short, specific description. E.g.: "Descending ladder shows wrong reps in round 3" -->

**Severity:**  
<!-- Critical (data loss / crash) / High (feature broken) / Medium (visual glitch) / Low (cosmetic) -->

**Date Found:**  
<!-- YYYY-MM-DD -->

**Reported By:**  
<!-- Developer / QA / user report -->

---

## Environment

- **Device:** <!-- iPhone 15 / Pixel 8 / Simulator -->
- **OS:** <!-- iOS 17.4 / Android 14 -->
- **App Version:** <!-- e.g. 1.0.0 -->
- **Expo SDK:** <!-- e.g. 54 -->

---

## Steps to Reproduce

1. ...
2. ...
3. ...

**Expected behavior:**  
<!-- What should have happened -->

**Actual behavior:**  
<!-- What actually happened -->

**Frequency:**  
<!-- Always / Sometimes / Rarely — and if conditional, what triggers it -->

---

## Screenshots / Logs

```
<!-- Paste relevant console.error output, stack traces, or AsyncStorage dump -->
```

---

## Context for AI Agent

> Provide codebase context to help the AI locate the root cause.

**Suspected file(s):**
- [ ] `src/utils/ladderStrategies.ts`
- [ ] `src/store/activeWorkoutStore.ts`
- [ ] `src/store/workoutStore.ts`
- [ ] `src/store/workoutHistoryStore.ts`
- [ ] `src/utils/storage.ts`
- [ ] `src/utils/calculations.ts`
- [ ] `src/screens/workouts/ActiveWorkoutScreen.tsx`
- [ ] `src/screens/workouts/CreateEditWorkoutScreen.tsx`
- [ ] `src/screens/logbook/LogBookScreen.tsx`
- [ ] Other: ___________________

**Affected ladder type(s):**
- [ ] christmas
- [ ] ascending
- [ ] descending
- [ ] pyramid
- [ ] flexible
- [ ] chipper
- [ ] amrap
- [ ] forreps
- [ ] All / Unknown

**Affected data entity:**
- [ ] Template
- [ ] Workout (session)
- [ ] Round
- [ ] Exercise
- [ ] ExerciseCatalogItem
- [ ] Theme preference
- [ ] Paused workout state

---

## Relevant State / Data

> If the bug involves corrupted or unexpected data, paste the relevant AsyncStorage value here.

```json
// Paste relevant stored data if available
```

---

## Hypotheses

> If you have a theory about the root cause, list it here.

1. ...

---

## AI Investigation Checklist

When investigating this bug, the AI agent should:

- [ ] Read the relevant store action(s) for the affected flow
- [ ] Read the ladder strategy class for the affected type
- [ ] Check for off-by-one errors in round numbering (rounds are 1-indexed in strategies, 0-indexed in `currentRoundIndex`)
- [ ] Check if `Date` objects are being compared as strings vs `Date` instances
- [ ] Check if the data migration path in `loadWorkouts` / `loadHistory` is causing the issue
- [ ] Verify `AsyncStorage` key names match between store and storage utility
- [ ] Check for race conditions in async store actions

---

## Fix Verification

After applying a fix:
- [ ] Steps to reproduce no longer produce the bug
- [ ] No regression in related flows
- [ ] If data was corrupted: migration handles old data format
- [ ] Console shows no new errors or warnings
