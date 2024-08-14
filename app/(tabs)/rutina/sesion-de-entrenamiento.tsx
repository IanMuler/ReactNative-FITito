// app/(tabs)/rutina/sesion-de-entrenamiento.tsx
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

type RPDetail = {
  value: string;
  time: number;
};

type DSDetail = {
  reps: string;
  peso: string;
};

type PartialDetail = {
  reps: string;
};

type SetDetail = {
  reps: string;
  weight: string;
  rir?: string;
  rp?: RPDetail[];
  ds?: DSDetail[];
  partials?: PartialDetail;
};

type PerformedSetDetail = {
  reps: string;
  weight: string;
  rir?: string;
  rp?: RPDetail[];
  ds?: DSDetail[];
  partials?: PartialDetail;
};

type ExerciseDetail = {
  name: string;
  sets: SetDetail[];
  image: string;
  performedSets?: PerformedSetDetail[];
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
            performedSets: exercise.sets.map((set) => ({
              reps: set.reps || "",
              weight: set.weight || "",
              rir: set.rir || "",
              rp: set.rp?.map((rp) => ({ value: rp.value, time: rp.time })) || [],
              ds: set.ds?.map((ds) => ({ reps: ds.reps, peso: ds.peso })) || [],
              partials: set.partials ? { reps: set.partials.reps } : undefined,
            })),
          })
        ) as ExerciseDetail[];
        setExerciseDetails(updatedExerciseDetails);
      }
    };

    loadCurrentDay();
  }, []);

  const handleSave = async () => {
    const routineDays = await StorageService.load("routineDays");
    const updatedRoutineDays = routineDays?.map((d: Day) =>
      d.name === day?.name ? { ...d, exerciseDetails: exerciseDetails, completed: true } : d
    );

    await StorageService.save("routineDays", updatedRoutineDays);

    const history = (await StorageService.load("history")) || [];
    const newHistoryEntry: HistoryEntry = {
      date: new Date().toLocaleDateString(),
      exerciseDetails: exerciseDetails,
    };
    await StorageService.save("history", [...history, newHistoryEntry]);

    router.push("/(tabs)/rutina");
  };

  const updatePerformedDetails = (
    exerciseIndex: number,
    setIndex: number,
    key: string,
    value: string | number
  ) => {
    const updatedDetails = [...exerciseDetails];
    const updatedExercise = { ...updatedDetails[exerciseIndex] };

    // Asegúrate de que performedSets esté inicializado
    if (!updatedExercise.performedSets) {
      updatedExercise.performedSets = updatedExercise.sets.map(() => ({} as PerformedSetDetail));
    }

    if (key === "reps") {
      updatedExercise.performedSets[setIndex].reps = value as string;
    } else if (key === "weight") {
      updatedExercise.performedSets[setIndex].weight = value as string;
    } else if (key === "rir") {
      updatedExercise.performedSets[setIndex].rir = value as string;
    } else if (key.startsWith("rpValue")) {
      const rpIndex = parseInt(key.split("-")[1], 10);
      updatedExercise.performedSets[setIndex].rp = updatedExercise.performedSets[setIndex].rp ?? [];
      updatedExercise.performedSets[setIndex].rp![rpIndex] = {
        ...(updatedExercise.performedSets[setIndex].rp![rpIndex] || {}),
        value: value as string,
      };
    } else if (key.startsWith("rpTime")) {
      const rpIndex = parseInt(key.split("-")[1], 10);
      updatedExercise.performedSets[setIndex].rp = updatedExercise.performedSets[setIndex].rp ?? [];
      updatedExercise.performedSets[setIndex].rp![rpIndex] = {
        ...(updatedExercise.performedSets[setIndex].rp![rpIndex] || {}),
        time: value as number,
      };
    } else if (key.startsWith("dsReps")) {
      const dsIndex = parseInt(key.split("-")[1], 10);
      updatedExercise.performedSets[setIndex].ds = updatedExercise.performedSets[setIndex].ds ?? [];
      updatedExercise.performedSets[setIndex].ds![dsIndex] = {
        ...(updatedExercise.performedSets[setIndex].ds![dsIndex] || {}),
        reps: value as string,
      };
    } else if (key.startsWith("dsPeso")) {
      const dsIndex = parseInt(key.split("-")[1], 10);
      updatedExercise.performedSets[setIndex].ds = updatedExercise.performedSets[setIndex].ds ?? [];
      updatedExercise.performedSets[setIndex].ds![dsIndex] = {
        ...(updatedExercise.performedSets[setIndex].ds![dsIndex] || {}),
        peso: value as string,
      };
    } else if (key === "partials") {
      updatedExercise.performedSets[setIndex].partials = { reps: value as string };
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
          <Text style={styles.dayText} testID="training-day-name">{day?.trainingDayName}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
        </View>
        {currentExercise && (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseTitle}>EJERCICIO</Text>
            <Text style={styles.exerciseName}>{currentExercise.name}</Text>
            <Image
              source={{ uri: currentExercise.image }}
              style={styles.exerciseImage}
              testID={`exercise-image-${currentExercise.name}`}
            />
            <View style={styles.setsContainer}>
              {currentExercise.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.setRow}>
                  <Text style={styles.setText}>Set {setIndex + 1}</Text>
                  <View style={{ flexDirection: "column", gap: 10, flex: 1 }}>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <View style={{ flex: 1, gap: 5 }}>
                        <Text style={styles.setDetailText}>Reps: {set.reps}</Text>
                        <NumberInput
                          value={currentExercise.performedSets?.[setIndex]?.reps || ""}
                          onChangeText={(text) =>
                            updatePerformedDetails(
                              currentExerciseIndex,
                              setIndex,
                              "reps",
                              text
                            )
                          }
                          placeholder="Reps"
                          defaultValue={set.reps}
                          testID={`input-reps-${currentExercise.name}-${setIndex}`}
                        />
                      </View>
                      <View style={{ flex: 1, gap: 5 }}>
                        <Text style={styles.setDetailText}>Peso: {set.weight} kg</Text>
                        <NumberInput
                          value={currentExercise.performedSets?.[setIndex]?.weight || ""}
                          onChangeText={(text) =>
                            updatePerformedDetails(
                              currentExerciseIndex,
                              setIndex,
                              "weight",
                              text
                            )
                          }
                          placeholder="Peso"
                          defaultValue={set.weight}
                          testID={`input-weight-${currentExercise.name}-${setIndex}`}
                        />
                      </View>
                      <View style={{ flex: 1, gap: 5 }}>
                        <Text style={styles.setDetailText}>RIR: {set.rir}</Text>
                        <NumberInput
                          value={currentExercise.performedSets?.[setIndex]?.rir || ""}
                          onChangeText={(text) =>
                            updatePerformedDetails(
                              currentExerciseIndex,
                              setIndex,
                              "rir",
                              text
                            )
                          }
                          placeholder="RIR"
                          defaultValue={set.rir}
                          testID={`input-rir-${currentExercise.name}-${setIndex}`}
                        />
                      </View>
                    </View>
                    <View style={{ width: "60%", alignSelf: "center", gap: 5 }}>
                      {set.partials && (
                        <View style={{ flexDirection: "row", gap: 10 }}>
                          <View style={{ flex: 1, gap: 5 }}>
                            <Text style={styles.setDetailText}>Partials reps: {set.partials.reps}</Text>
                            <NumberInput
                              value={currentExercise.performedSets?.[setIndex]?.partials?.reps || ""}
                              onChangeText={(text) =>
                                updatePerformedDetails(
                                  currentExerciseIndex,
                                  setIndex,
                                  "partials",
                                  text
                                )
                              }
                              placeholder="Partials Reps"
                              defaultValue={set.partials.reps}
                              testID={`input-partials-reps-${currentExercise.name}-${setIndex}`}
                            />
                          </View>
                        </View>
                      )}
                      {set.rp && set.rp.length > 0 && (
                        set.rp.map((rpDetail, rpIndex) => (
                          <View key={rpIndex} style={{ flexDirection: "row", gap: 10 }}>
                            <View style={{ flex: 1, gap: 5, alignItems: "center" }}>
                              <View style={{ flexDirection: "row", gap: 5 }}>
                                <Text style={styles.setDetailText}>RP reps: {rpDetail.value}</Text>
                                <Text style={styles.setDetailText}>Time: {rpDetail.time}"</Text>
                              </View>
                              <NumberInput
                                value={currentExercise.performedSets?.[setIndex]?.rp?.[rpIndex]?.value || ""}
                                onChangeText={(text) =>
                                  updatePerformedDetails(
                                    currentExerciseIndex,
                                    setIndex,
                                    `rpValue-${rpIndex}`,
                                    text
                                  )
                                }
                                placeholder="RP"
                                defaultValue={rpDetail.value}
                                testID={`input-rp-${currentExercise.name}-${setIndex}-${rpIndex}`}
                              />
                            </View>
                          </View>
                        ))
                      )}
                      {set.ds && set.ds.length > 0 && (
                        set.ds.map((dsDetail, dsIndex) => (
                          <View key={dsIndex} style={{ flexDirection: "row", gap: 10 }}>
                            <View style={{ flexDirection: "row", gap: 10, flex: 1 }}>
                              <View style={{ width: "50%", gap: 5 }}>
                                <Text style={styles.setDetailText}>DS Reps: {dsDetail.reps}</Text>
                                <NumberInput
                                  value={currentExercise.performedSets?.[setIndex]?.ds?.[dsIndex]?.reps || ""}
                                  onChangeText={(text) =>
                                    updatePerformedDetails(
                                      currentExerciseIndex,
                                      setIndex,
                                      `dsReps-${dsIndex}`,
                                      text
                                    )
                                  }
                                  placeholder="DS Reps"
                                  defaultValue={dsDetail.reps}
                                  testID={`input-ds-reps-${currentExercise.name}-${setIndex}-${dsIndex}`}
                                />
                              </View>
                              <View style={{ width: "50%", gap: 5 }}>
                                <Text style={styles.setDetailText}>DS Peso: {dsDetail.peso} kg</Text>
                                <NumberInput
                                  value={currentExercise.performedSets?.[setIndex]?.ds?.[dsIndex]?.peso || ""}
                                  onChangeText={(text) =>
                                    updatePerformedDetails(
                                      currentExerciseIndex,
                                      setIndex,
                                      `dsPeso-${dsIndex}`,
                                      text
                                    )
                                  }
                                  placeholder="DS Peso"
                                  defaultValue={dsDetail.peso}
                                  testID={`input-ds-peso-${currentExercise.name}-${setIndex}-${dsIndex}`}
                                />
                              </View>
                            </View>
                          </View>
                        ))
                      )}
                    </View>
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
            testID="button-previous"
          >
            <Text style={styles.buttonText}>Anterior</Text>
          </TouchableOpacity>
          {currentExerciseIndex === exerciseDetails.length - 1 ? (
            <TouchableOpacity style={styles.button} onPress={handleSave} testID="button-finish">
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
              testID="button-next"
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
