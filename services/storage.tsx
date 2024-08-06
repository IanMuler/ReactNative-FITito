// services/storage.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Exercise } from "@/app/(tabs)/ejercicios";
import { TrainingDay } from "@/app/(tabs)/dias-entreno";
import { Day } from "@/app/(tabs)/rutina";
import { HistoryEntry } from "@/app/(tabs)/rutina/historico";

export type StorageKey =
  | "exercises"
  | "trainingDays"
  | "routineDays"
  | "history";

type Response = {
  exercises: Exercise[];
  trainingDays: TrainingDay[];
  routineDays: Day[];
  history: HistoryEntry[];
};

const StorageService = {
  save: async (key: StorageKey, value: any): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error(e);
    }
  },

  load: async <K extends StorageKey>(key: K): Promise<Response[K] | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? (JSON.parse(jsonValue) as Response[K]) : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  remove: async (key: StorageKey): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(e);
    }
  },

  getAllKeys: async (): Promise<string[] | null> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  getAllItems: async (): Promise<{ key: string; value: any }[]> => {
    try {
      const keys = await StorageService.getAllKeys();
      if (keys) {
        const items = await AsyncStorage.multiGet(keys);
        return items.map(([key, value]) => ({
          key,
          value: value != null ? JSON.parse(value) : null,
        }));
      }
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },
};

export default StorageService;
