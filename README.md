# LadFit

> Coding agents should begin with [`AI_CONTEXT.md`](AI_CONTEXT.md), then read `docs/business-rules.md` and `ai/development-workflow.md`.

LadFit is an offline-first Expo/React Native workout-template, timer, logbook, and sharing application for functional-fitness ladder workouts.

## Project Structure

```
my-expo-app
├── src
│   ├── components          # Reusable UI components
│   │   └── ExampleComponent.tsx
│   ├── screens             # Application screens
│   │   └── HomeScreen.tsx
│   ├── navigation          # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── types               # TypeScript types and interfaces
│   │   └── index.ts
│   └── App.tsx             # Main application entry point
├── app.json                # Expo configuration
├── package.json            # npm configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## Getting Started

To get started with this project, follow these steps:

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd my-expo-app
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm start
   ```

## Project Goals

- Implement a clean and maintainable folder structure.
- Utilize TypeScript for type safety and better development experience.
- Set up navigation using React Navigation.
- Create reusable components for UI consistency.
- Provide a template for CRUD functionality in the HomeScreen.

## License

This project is licensed under the MIT License.
