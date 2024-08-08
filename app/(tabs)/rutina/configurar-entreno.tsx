// app/(tabs)/rutina/configurar-entreno.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import RadialGradientBackground from "@/components/RadialGradientBackground";
import StorageService from "@/services/storage";
import NumberInput from "@/components/NumberInput"; // Import NumberInput
import { Ionicons } from "@expo/vector-icons";

export type ExerciseDetail = {
  name: string;
  sets: { reps: string; weight: string }[];
  image: string;
};

const ConfigureTrainingDayScreen = () => {
  const [exerciseDetails, setExerciseDetails] = useState<ExerciseDetail[]>([]);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const router = useRouter();
  const { dayName, trainingDayName } = useLocalSearchParams();

  useEffect(() => {
    const loadTrainingDayDetails = async () => {
      const routineDays = await StorageService.load("routineDays");
      const selectedDay = routineDays?.find((day) => day.name === dayName);
      if (selectedDay && selectedDay.trainingDayName === trainingDayName) {
        setExerciseDetails(selectedDay.exerciseDetails || []);
      } else {
        const savedTrainingDays = await StorageService.load("trainingDays");
        const selectedTrainingDay = savedTrainingDays?.find(
          (day) => day.name === trainingDayName
        );
        if (selectedTrainingDay) {
          const details = selectedTrainingDay.exercises?.map((exercise) => ({
            name: exercise.name,
            sets: [{ reps: "", weight: "" }],
            image: exercise.image,
          }));
          details && setExerciseDetails(details);
        }
      }
    };

    loadTrainingDayDetails();
  }, [dayName, trainingDayName]);

  useEffect(() => {
    checkIfAllInputsAreFilled();
  }, [exerciseDetails]);

  const checkIfAllInputsAreFilled = () => {
    for (const exercise of exerciseDetails) {
      for (const set of exercise.sets) {
        if (!set.reps || !set.weight) {
          setIsSaveEnabled(false);
          return;
        }
      }
    }
    setIsSaveEnabled(true);
  };

  const handleSave = async () => {
    const routineDays = await StorageService.load("routineDays");
    const updatedRoutineDays = routineDays?.map((day: any) =>
      day.name === dayName ? { ...day, trainingDayName, exerciseDetails } : day
    );

    await StorageService.save("routineDays", updatedRoutineDays);
    router.push({ pathname: "/(tabs)/rutina" });
  };

  const updateExerciseDetail = (
    exerciseIndex: number,
    setIndex: number,
    key: string,
    value: string
  ) => {
    const updatedDetails = [...exerciseDetails];
    const updatedSets = [...updatedDetails[exerciseIndex].sets];
    updatedSets[setIndex] = { ...updatedSets[setIndex], [key]: value };
    updatedDetails[exerciseIndex].sets = updatedSets;
    setExerciseDetails(updatedDetails);
  };

  const addSet = (exerciseIndex: number) => {
    const updatedDetails = [...exerciseDetails];
    updatedDetails[exerciseIndex].sets.push({ reps: "", weight: "" });
    setExerciseDetails(updatedDetails);
  };

  const removeSet = (exerciseIndex: number) => {
    const updatedDetails = [...exerciseDetails];
    const updatedSets = [...updatedDetails[exerciseIndex].sets];
    updatedSets.pop();
    updatedDetails[exerciseIndex].sets = updatedSets;
    setExerciseDetails(updatedDetails);
  };

  return (
    <View style={styles.container}>
      <RadialGradientBackground />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title} testID="config-title">
          Configurar {trainingDayName} para {dayName}
        </Text>
        {exerciseDetails.map((exercise, exerciseIndex) => (
          <View key={exerciseIndex} style={styles.exerciseContainer} testID={`exercise-${exercise.name}`}>
            <Text style={styles.exerciseName} testID={`exercise-name-${exercise.name}`}>{exercise.name}</Text>
            {exercise.sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.setRow} testID={`exercise-set-${exercise.name}-${setIndex}`}>
                <Text style={styles.setText}>Set {setIndex + 1}</Text>
                <NumberInput
                  value={set.reps}
                  onChangeText={(text) =>
                    updateExerciseDetail(exerciseIndex, setIndex, "reps", text)
                  }
                  placeholder="Reps"
                  testID={`input-reps-${exercise.name}-${setIndex}`}
                />
                <NumberInput
                  value={set.weight}
                  onChangeText={(text) =>
                    updateExerciseDetail(
                      exerciseIndex,
                      setIndex,
                      "weight",
                      text
                    )
                  }
                  placeholder="Peso"
                  testID={`input-weight-${exercise.name}-${setIndex}`}
                />
              </View>
            ))}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addSet(exerciseIndex)}
                testID={`button-add-set-${exercise.name}`}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              {exercise.sets.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeSet(exerciseIndex)}
                  testID={`button-remove-set-${exercise.name}`}
                >
                  <Ionicons name="remove" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={[styles.button, !isSaveEnabled && styles.disabledButton]}
          onPress={handleSave}
          disabled={!isSaveEnabled}
          testID="button-save"
        >
          <Text style={styles.buttonText}>Guardar día de rutina</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121623",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 20,
  },
  exerciseContainer: {
    backgroundColor: "#1F2940",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  exerciseName: {
    color: "#FFFFFF",
    fontSize: 18,
    marginBottom: 10,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  setText: {
    color: "#A5A5A5",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  addButton: {
    backgroundColor: "#2979FF",
    width: 40,
    height: 40,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "#2979FF",
    width: 40,
    height: 40,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#2979FF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#A5A5A5", // Color para el botón deshabilitado
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ConfigureTrainingDayScreen;
