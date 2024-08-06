// app/(tabs)/dias-entreno/anadir-dia.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import RadialGradientBackground from "@/components/RadialGradientBackground";
import StorageService from "@/services/storage";
import { Exercise } from "../ejercicios";

const AddTrainingDayScreen = () => {
  const [dayName, setDayName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();

  useEffect(() => {
    const loadExercises = async () => {
      const savedExercises = await StorageService.load("exercises");
      if (savedExercises) {
        setExercises(savedExercises);
      }
    };

    const loadTrainingDay = async () => {
      if (name) {
        const trainingDays = await StorageService.load("trainingDays");
        const trainingDay = trainingDays?.find(
          (day: { name: string }) => day.name === name
        );
        if (trainingDay) {
          setDayName(trainingDay.name);
          setSelectedExercises(trainingDay.exercises || []);
        }
      }
    };

    loadExercises();
    loadTrainingDay();
  }, [name]);

  const toggleExerciseSelection = (exercise: Exercise) => {
    setSelectedExercises((prevSelected) =>
      prevSelected.some((ex) => ex.name === exercise.name)
        ? prevSelected.filter((ex) => ex.name !== exercise.name)
        : [...prevSelected, exercise]
    );
  };

  const saveTrainingDay = async () => {
    const newTrainingDay = {
      name: dayName,
      exercises: selectedExercises,
    };
    const trainingDays = (await StorageService.load("trainingDays")) || [];
    const nameExists = trainingDays.some(
      (day: { name: string }) => day.name === dayName && day.name !== name
    );

    if (nameExists) {
      Alert.alert("Error", "Ya existe un día de entreno con ese nombre.");
      return;
    }

    if (name) {
      const index = trainingDays.findIndex(
        (day: { name: string }) => day.name === name
      );
      if (index !== -1) {
        trainingDays[index] = newTrainingDay;
      }
    } else {
      trainingDays.push(newTrainingDay);
    }
    await StorageService.save("trainingDays", trainingDays);
    router.back();
  };

  return (
    <View style={styles.container}>
      <RadialGradientBackground />
      <ScrollView>
        <Text testID="title" style={styles.title}>
          {name ? "Editar día de entreno" : "Añadir día de entreno"}
        </Text>
        <Text style={styles.label}>Nombre:</Text>
        <TextInput
          testID="input-day-name"
          style={styles.input}
          placeholder="Día de entreno"
          placeholderTextColor="#A5A5A5"
          value={dayName}
          onChangeText={setDayName}
        />
        <Text style={styles.label}>Ejercicios:</Text>
        <View style={styles.exercisesContainer}>
          {exercises.map((exercise, index) => (
            <TouchableOpacity
              key={index}
              testID={`exercise-${exercise.name}`}
              style={[
                styles.exerciseCard,
                selectedExercises.some((ex) => ex.name === exercise.name) &&
                styles.selectedExerciseCard,
              ]}
              onPress={() => toggleExerciseSelection(exercise)}
            >
              <Image
                testID={`exercise-${exercise.name}-image`}
                source={{ uri: exercise.image }}
                style={styles.exerciseImage}
              />
              <Text testID={`exercise-${exercise.name}-text`} style={styles.exerciseText}>
                {exercise.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity
        testID="button-save-training-day"
        style={[
          styles.button,
          (!dayName || selectedExercises.length === 0) && styles.buttonDisabled,
        ]}
        onPress={saveTrainingDay}
        disabled={!dayName || selectedExercises.length === 0}
      >
        <Text style={styles.buttonText} testID="button-save-training-day-text">
          {name ? "Guardar cambios" : "Guardar día de entreno"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141A30",
    padding: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 20,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#1F2940",
    color: "#FFFFFF",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    fontSize: 16,
  },
  exercisesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  exerciseCard: {
    backgroundColor: "#1F2940",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    width: "45%",
    marginBottom: 10,
  },
  selectedExerciseCard: {
    backgroundColor: "#394867",
  },
  exerciseImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  exerciseText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#2979FF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#A5A5A5",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AddTrainingDayScreen;