// jestSetupFile.js
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// jest.mock("expo-router", () => ({
//   useRouter: jest.fn(() => ({
//     back: jest.fn(),
//     push: jest.fn(),
//   })),
//   useLocalSearchParams: jest.fn().mockReturnValue({}),
// }));
