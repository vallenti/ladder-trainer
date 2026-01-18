export interface ExampleComponentProps {
  title: string;
  onPress: () => void;
}

export interface HomeScreenProps {
  navigation: any; // Replace 'any' with a more specific type if using a navigation library
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}