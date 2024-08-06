import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import RadialGradientBackground from "@/components/RadialGradientBackground";
import NumberInput from "@/components/NumberInput";
import StorageService from "@/services/storage";
import { Day } from "./index";
import { currentDayIndex } from "@/constants/Dates";

type ExerciseDetail = {
  name: string;
  sets: { reps: string; weight: string }[];
  image: string;
  performedReps?: string[];
  performedWeights?: string[];
};

type HistoryEntry = {
  date: string;
  exerciseDetails: ExerciseDetail[];
};

const TrainingSessionScreen = () => {
  const [day, setDay] = useState<Day | undefined>();
  const [exerciseDetails, setExerciseDetails] = useState<ExerciseDetail[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const loadCurrentDay = async () => {
      const routineDays = await StorageService.load("routineDays");
      const currentDay = routineDays?.[currentDayIndex];
      setDay(currentDay);
      if (currentDay) {
        const updatedExerciseDetails = currentDay.exerciseDetails?.map(
          (exercise: ExerciseDetail) => ({
            ...exercise,
            performedReps:
              exercise.performedReps || exercise.sets.map((set) => ""),
            performedWeights:
              exercise.performedWeights || exercise.sets.map((set) => ""),
          })
        );
        setExerciseDetails(updatedExerciseDetails!);
      }
    };

    loadCurrentDay();
  }, []);

  const handleSave = async () => {
    const routineDays = await StorageService.load("routineDays");
    const updatedRoutineDays = routineDays?.map((d: Day) =>
      d.name === day?.name ? { ...d, exerciseDetails, completed: true } : d
    );

    await StorageService.save("routineDays", updatedRoutineDays);

    const history = (await StorageService.load("history")) || [];
    const newHistoryEntry: HistoryEntry = {
      date: new Date().toLocaleDateString(),
      exerciseDetails,
    };
    await StorageService.save("history", [...history, newHistoryEntry]);

    router.push("/(tabs)/rutina");
  };

  const updatePerformedDetails = (
    exerciseIndex: number,
    setIndex: number,
    key: string,
    value: string
  ) => {
    const updatedDetails = [...exerciseDetails];
    const updatedExercise = { ...updatedDetails[exerciseIndex] };

    if (key === "performedReps") {
      updatedExercise.performedReps = updatedExercise.performedReps ?? [];
      updatedExercise.performedReps[setIndex] = value;
    } else if (key === "performedWeights") {
      updatedExercise.performedWeights = updatedExercise.performedWeights ?? [];
      updatedExercise.performedWeights[setIndex] = value;
    }

    updatedDetails[exerciseIndex] = updatedExercise;
    setExerciseDetails(updatedDetails);
  };

  const currentExercise = exerciseDetails[currentExerciseIndex];

  return (
    <View style={styles.container}>
      <RadialGradientBackground />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <Text style={styles.dayText}>{day?.trainingDayName}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
        </View>
        {currentExercise && (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseTitle}>EJERCICIO</Text>
            <Text style={styles.exerciseName}>{currentExercise.name}</Text>
            <Image
              source={{ uri: currentExercise.image }}
              style={styles.exerciseImage}
            />
            <View style={styles.setsContainer}>
              {currentExercise.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.setRow}>
                  <Text style={styles.setText}>Set {setIndex + 1}</Text>
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text style={styles.setDetailText}>{set.reps}</Text>
                    <NumberInput
                      value={currentExercise.performedReps?.[setIndex] || ""}
                      onChangeText={(text) =>
                        updatePerformedDetails(
                          currentExerciseIndex,
                          setIndex,
                          "performedReps",
                          text
                        )
                      }
                      placeholder="Reps"
                      defaultValue={set.reps}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text style={styles.setDetailText}>{set.weight} kg</Text>
                    <NumberInput
                      value={currentExercise.performedWeights?.[setIndex] || ""}
                      onChangeText={(text) =>
                        updatePerformedDetails(
                          currentExerciseIndex,
                          setIndex,
                          "performedWeights",
                          text
                        )
                      }
                      placeholder="Peso"
                      defaultValue={set.weight}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              { opacity: currentExerciseIndex === 0 ? 0.5 : 1 },
            ]}
            disabled={currentExerciseIndex === 0}
            onPress={() =>
              setCurrentExerciseIndex((prevIndex) => Math.max(prevIndex - 1, 0))
            }
          >
            <Text style={styles.buttonText}>Anterior</Text>
          </TouchableOpacity>
          {currentExerciseIndex === exerciseDetails.length - 1 ? (
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Finalizar sesión</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                setCurrentExerciseIndex((prevIndex) =>
                  Math.min(prevIndex + 1, exerciseDetails.length - 1)
                )
              }
            >
              <Text style={styles.buttonText}>Siguiente</Text>
            </TouchableOpacity>
          )}
        </View>
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
  header: {
    marginTop: 20,
  },
  dayText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  dateText: {
    color: "#A5A5A5",
    fontSize: 16,
    marginBottom: 20,
  },
  exerciseCard: {
    backgroundColor: "#1F2940",
    flex: 1,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  exerciseTitle: {
    color: "#A5A5A5",
    fontSize: 16,
    marginBottom: 10,
  },
  exerciseName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  exerciseImage: {
    height: 80,
    width: 80,
    marginBottom: 20,
  },
  setsContainer: {
    width: "100%",
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
  setDetailText: {
    color: "#A5A5A5",
    fontSize: 16,
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#2979FF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TrainingSessionScreen;
