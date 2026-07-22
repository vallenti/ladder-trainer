# Prompt: Refactoring — LadFit

> No behavior change includes JSON compatibility, route params, round indexing, snapshots, totals, and share output. Add characterization tests first.

> Copy this prompt and fill in the `[PLACEHOLDERS]`. Use it to safely refactor code with an AI assistant.

---

## Prompt Template

```
You are an expert React Native / TypeScript engineer working on LadFit — an offline-first functional fitness app.

## Project Context
Read before refactoring:
- AI_CONTEXT.md — project overview and constraints
- docs/coding-standards.md — the conventions this codebase follows
- src/types/index.ts — domain types

## Refactoring Task
[DESCRIBE WHAT NEEDS TO BE REFACTORED AND WHY]

## Target Code
File: [FILE PATH]
[Paste the relevant code section OR describe it precisely]

## Refactoring Goals
1. [GOAL 1 — e.g. extract shared logic into utility function]
2. [GOAL 2 — e.g. reduce component size below 200 lines]
3. [GOAL 3 — e.g. eliminate duplication between X and Y]

## Constraints
- Do NOT change external behavior or public API
- Do NOT rename exported types or store actions (breaking change)
- Do NOT change AsyncStorage key names
- Preserve all TypeScript types (no widening to any)
- All existing tests must still pass (there are none yet, but write them if refactoring utils)

## Validation
After refactoring, the following must still work:
- [FUNCTIONALITY 1]
- [FUNCTIONALITY 2]

Please:
1. Show the refactored code
2. List all files that changed
3. Highlight any behavioral change (should be none)
4. Flag any edge cases you encountered
```

---

## Common Refactoring Recipes

### Extract Component
```
The component [ComponentName] in [file path] is [N] lines and is hard to maintain.

Extract the [SECTION NAME] section (lines ~[X] to ~[Y]) into a new component:
- New file: src/components/[NewComponentName].tsx
- Props interface: [describe the props it needs]
- The parent component should pass [data] and [callbacks]

Ensure the extracted component:
- Uses useTheme() for colors
- Uses StyleSheet.create() at the bottom
- Has a proper Props interface
- Is exported as default
```

### Extract Utility Function
```
The function [functionName] is duplicated in:
- [FILE 1]
- [FILE 2]

Extract it to src/utils/[utilFileName].ts as a shared utility.

The function signature should be:
[describe input and output types]

Update both files to import from the shared utility.
```

### Simplify Store Action
```
The store action [actionName] in [storeFile] does too many things.
Split it into:
1. [subAction1] — [what it does]
2. [subAction2] — [what it does]

Ensure the original action still exists and composes the two new ones 
for backward compatibility (existing callers don't need to change).
```

### Convert Any Types
```
The following usages of 'any' need to be fixed in [file]:
1. [Line/context]: replace with [specific type or unknown + guard]
2. [Line/context]: replace with [specific type or unknown + guard]

For unknown types that are deserialized from JSON (AsyncStorage), use:
- unknown type + type guard function
- or explicit interface matching the stored JSON shape
```

### Remove Inline Styles
```
[ComponentName] in [file] has inline styles:
style={{ padding: 16, marginBottom: 8, borderRadius: 8 }}

Replace with StyleSheet.create() at the bottom of the file.
Use spacing.* and borderRadius.* from src/constants/theme.ts.
Import: import { spacing, borderRadius } from '../../constants/theme';
```
