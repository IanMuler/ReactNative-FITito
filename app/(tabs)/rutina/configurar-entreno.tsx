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
import NumberInput from "@/components/NumberInput";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';

export type RPDetail = {
  value: string;
  time: number;
};

export type ExerciseDetail = {
  name: string;
  sets: { reps: string; weight: string; rir: string; rp?: RPDetail[] }[];
  image: string;
};

const ConfigureTrainingDayScreen = () => {
  const [exerciseDetails, setExerciseDetails] = useState<ExerciseDetail[]>([]);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [buttonsActive, setButtonsActive] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const { dayName, trainingDayName } = useLocalSearchParams();

  useEffect(() => {
    const loadTrainingDayDetails = async () => {
      const routineDays = await StorageService.load("routineDays");
      const selectedDay = routineDays?.find((day) => day.name === dayName);
      if (selectedDay && selectedDay.trainingDayName === trainingDayName) {
        setExerciseDetails(selectedDay.exerciseDetails || []);
        initializeRPButtons(selectedDay.exerciseDetails || []);
      } else {
        const savedTrainingDays = await StorageService.load("trainingDays");
        const selectedTrainingDay = savedTrainingDays?.find(
          (day) => day.name === trainingDayName
        );
        if (selectedTrainingDay) {
          const details = selectedTrainingDay.exercises?.map((exercise) => ({
            name: exercise.name,
            sets: [{ reps: "", weight: "", rir: "", rp: [{ value: "", time: 5 }] }],
            image: exercise.image,
          }));
          details && setExerciseDetails(details);
        }
      }
    };

    const initializeRPButtons = (exerciseDetails: ExerciseDetail[]) => {
      const initialButtonsActive: Record<string, boolean> = {};
      exerciseDetails.forEach((exercise, exerciseIndex) => {
        exercise.sets.forEach((set, setIndex) => {
          if (set.rp && set.rp.length > 0) {
            const key = `${exerciseIndex}-${setIndex}`;
            initialButtonsActive[key] = true; // Activar el botón RP si ya tiene valores
          }
        });
      });
      setButtonsActive(initialButtonsActive);
    };

    loadTrainingDayDetails();
  }, [dayName, trainingDayName]);

  useEffect(() => {
    checkIfAllInputsAreFilled();
  }, [exerciseDetails]);

  const checkIfAllInputsAreFilled = () => {
    for (const exercise of exerciseDetails) {
      for (const set of exercise.sets) {
        if (!set.reps || !set.weight || !set.rir) {
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
    value: string | number,
    rpIndex?: number
  ) => {
    const updatedDetails = [...exerciseDetails];
    const updatedSets = [...updatedDetails[exerciseIndex].sets];

    if (key === "rp" && rpIndex !== undefined) {
      const updatedRP = [...updatedSets[setIndex].rp || []];
      updatedRP[rpIndex] = { ...updatedRP[rpIndex], value: value as string };
      updatedSets[setIndex] = { ...updatedSets[setIndex], rp: updatedRP };
    } else if (key === "time" && rpIndex !== undefined) {
      const updatedRP = [...updatedSets[setIndex].rp || []];
      updatedRP[rpIndex] = { ...updatedRP[rpIndex], time: value as number };
      updatedSets[setIndex] = { ...updatedSets[setIndex], rp: updatedRP };
    } else {
      updatedSets[setIndex] = { ...updatedSets[setIndex], [key]: value };
    }

    updatedDetails[exerciseIndex].sets = updatedSets;
    setExerciseDetails(updatedDetails);
  };

  const toggleRP = (exerciseIndex: number, setIndex: number) => {
    const key = `${exerciseIndex}-${setIndex}`;
    setButtonsActive(prevState => ({
      ...prevState,
      [key]: !prevState[key],
    }));

    const updatedDetails = [...exerciseDetails];
    const updatedSets = [...updatedDetails[exerciseIndex].sets];
    const currentSet = updatedSets[setIndex];

    if (currentSet.rp?.length) {
      currentSet.rp = [{ value: "", time: 5 }];
    } else {
      currentSet.rp = [];
    }

    updatedSets[setIndex] = currentSet;
    updatedDetails[exerciseIndex].sets = updatedSets;
    setExerciseDetails(updatedDetails);
  };

  const addSet = (exerciseIndex: number) => {
    const updatedDetails = [...exerciseDetails];
    updatedDetails[exerciseIndex].sets.push({ reps: "", weight: "", rir: "", rp: [{ value: "", time: 5 }] });
    setExerciseDetails(updatedDetails);
  };

  const removeSet = (exerciseIndex: number) => {
    const updatedDetails = [...exerciseDetails];
    const updatedSets = [...updatedDetails[exerciseIndex].sets];
    updatedSets.pop();
    updatedDetails[exerciseIndex].sets = updatedSets;
    setExerciseDetails(updatedDetails);
  };

  const addRPField = (exerciseIndex: number, setIndex: number) => {
    const updatedDetails = [...exerciseDetails];
    const updatedSets = [...updatedDetails[exerciseIndex].sets];
    updatedSets[setIndex].rp?.push({ value: "", time: 5 });
    setExerciseDetails(updatedDetails);
  };

  const removeRPField = (exerciseIndex: number, setIndex: number, rpIndex: number) => {
    const updatedDetails = [...exerciseDetails];
    const updatedSets = [...updatedDetails[exerciseIndex].sets];
    updatedSets[setIndex].rp?.splice(rpIndex, 1);
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
              <View key={setIndex}>
                <View style={styles.setRow} testID={`exercise-set-${exercise.name}-${setIndex}`}>
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
                  <NumberInput
                    value={set.rir}
                    onChangeText={(text) =>
                      updateExerciseDetail(exerciseIndex, setIndex, "rir", text)
                    }
                    placeholder="RIR"
                    testID={`input-rir-${exercise.name}-${setIndex}`}
                  />
                  <TouchableOpacity
                    style={[styles.rpButton, buttonsActive[`${exerciseIndex}-${setIndex}`] ? styles.rpButtonActive : null]}
                    onPress={() => toggleRP(exerciseIndex, setIndex)}
                    testID={`button-rp-toggle-${exercise.name}-${setIndex}`}
                  >
                    <Text style={styles.rpButtonText}>RP</Text>
                  </TouchableOpacity>
                </View>
                {buttonsActive[`${exerciseIndex}-${setIndex}`] && (
                  <View>
                    {set.rp?.map((rpDetail, rpIndex) => (
                      <View key={rpIndex} style={styles.rpRow}>
                        <NumberInput
                          value={rpDetail.value}
                          onChangeText={(text) =>
                            updateExerciseDetail(exerciseIndex, setIndex, "rp", text, rpIndex)
                          }
                          placeholder={`RP ${rpIndex + 1}`}
                          testID={`input-rp-${exercise.name}-${setIndex}-${rpIndex}`}
                        />
                        <Picker
                          selectedValue={rpDetail.time}
                          style={styles.timePicker}
                          onValueChange={(itemValue) =>
                            updateExerciseDetail(exerciseIndex, setIndex, "time", itemValue, rpIndex)
                          }
                          testID={`picker-rp-time-${exercise.name}-${setIndex}-${rpIndex}`}
                        >
                          {[5, 10, 15, 20, 25, 30].map((time) => (
                            <Picker.Item key={time} label={`${time}"`} value={time} />
                          ))}
                        </Picker>
                        {rpIndex === 0 ? (
                          <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => addRPField(exerciseIndex, setIndex)}
                            testID={`button-add-rp-${exercise.name}-${setIndex}`}
                          >
                            <Ionicons name="add" size={24} color="#FFFFFF" />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => removeRPField(exerciseIndex, setIndex, rpIndex)}
                            testID={`button-remove-rp-${exercise.name}-${setIndex}-${rpIndex}`}
                          >
                            <Ionicons name="remove" size={24} color="#FFFFFF" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}
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
  rpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  timePicker: {
    width: 120,
    color: "#FFFFFF",
    backgroundColor: "#1F2940",
    borderRadius: 5,
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
    backgroundColor: "#A5A5A5",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  rpButton: {
    backgroundColor: "#A5A5A5",
    width: 40,
    height: 40,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  rpButtonActive: {
    backgroundColor: "#2979FF",
  },
  rpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ConfigureTrainingDayScreen;
