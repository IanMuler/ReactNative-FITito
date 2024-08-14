// app/(tabs)/rutina/historico.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import StorageService from "@/services/storage";
import { dayNames } from "@/constants/Dates";

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

export type HistoryEntry = {
  date: string;
  exerciseDetails: ExerciseDetail[];
};

const HistoricoScreen = () => {
  const [history, setHistory] = useState<HistoryEntry[] | undefined>([]);
  const { date } = useLocalSearchParams<{ date: string }>(); // formato: DD/MM/YYYY
  const splitDate = date!.split("/");
  const validDate = new Date(+splitDate[2], +splitDate[1] - 1, +splitDate[0]);
  const dayName = dayNames[validDate.getDay()];

  useEffect(() => {
    const loadHistory = async () => {
      const allHistory = await StorageService.load("history");
      const dayHistory = allHistory?.filter((entry) => entry.date === date);
      setHistory(dayHistory);
    };

    loadHistory();
  }, [date]);

  return (
    <View style={styles.container} testID="historico-screen">
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title} testID="historico-title">
          Histórico de {dayName} {date}
        </Text>
        {history?.map((entry, index) => (
          <View key={index} style={styles.historyCard} testID={`historico-entry-${index}`}>
            {entry.exerciseDetails.map((exercise, exIndex) => (
              <View key={exIndex} style={styles.exerciseCard} testID={`historico-exercise-${exercise.name}`}>
                <Text style={styles.exerciseName} testID={`historico-exercise-name-${exercise.name}`}>
                  {exercise.name}
                </Text>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle} testID={`historico-section-planned-${exercise.name}`}>
                    Planificado
                  </Text>
                  {exercise.sets.map((set, setIndex) => (
                    <View key={setIndex}>
                      <Text style={styles.exerciseInfo} testID={`historico-set-planned-${exercise.name}-${setIndex}`}>
                        Set {setIndex + 1}: {set.reps} reps, {set.weight}kg, RIR: {set.rir ?? "N/A"}
                      </Text>
                      {set.rp && set.rp.length > 0 && set.rp.map((rpDetail, rpIndex) => (
                        <Text key={rpIndex} style={styles.exerciseInfo} testID={`historico-rp-planned-${exercise.name}-${rpIndex}`}>
                          RP {rpIndex + 1}: {rpDetail.value} reps, Time: {rpDetail.time}"
                        </Text>
                      ))}
                      {set.ds && set.ds.length > 0 && set.ds.map((dsDetail, dsIndex) => (
                        <Text key={dsIndex} style={styles.exerciseInfo} testID={`historico-ds-planned-${exercise.name}-${dsIndex}`}>
                          DS {dsIndex + 1}: {dsDetail.reps} reps, {dsDetail.peso} kg
                        </Text>
                      ))}
                      {set.partials && (
                        <Text style={styles.exerciseInfo} testID={`historico-partials-planned-${exercise.name}-${setIndex}`}>
                          Partials: {set.partials.reps} reps
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle} testID={`historico-section-performed-${exercise.name}`}>
                    Realizado
                  </Text>
                  {exercise.performedSets?.map((performedSet, setIndex) => (
                    <View key={setIndex}>
                      <Text style={styles.performedText} testID={`historico-set-performed-${exercise.name}-${setIndex}`}>
                        Set {setIndex + 1}: {performedSet.reps} reps, {performedSet.weight} kg, RIR: {performedSet.rir ?? "N/A"}
                      </Text>
                      {performedSet.rp && performedSet.rp.length > 0 && performedSet.rp.map((rpDetail, rpIndex) => (
                        <Text key={rpIndex} style={styles.performedText} testID={`historico-rp-performed-${exercise.name}-${rpIndex}`}>
                          RP {rpIndex + 1}: {rpDetail.value} reps, Time: {rpDetail.time}"
                        </Text>
                      ))}
                      {performedSet.ds && performedSet.ds.length > 0 && performedSet.ds.map((dsDetail, dsIndex) => (
                        <Text key={dsIndex} style={styles.performedText} testID={`historico-ds-performed-${exercise.name}-${dsIndex}`}>
                          DS {dsIndex + 1}: {dsDetail.reps} reps, {dsDetail.peso} kg
                        </Text>
                      ))}
                      {performedSet.partials && (
                        <Text style={styles.performedText} testID={`historico-partials-performed-${exercise.name}-${setIndex}`}>
                          Partials: {performedSet.partials.reps} reps
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ))}
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
    textAlign: "center",
  },
  historyCard: {
    marginBottom: 20,
  },
  exerciseCard: {
    backgroundColor: "#1F2940",
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
  },
  exerciseName: {
    color: "#FFFFFF",
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#A5A5A5",
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  exerciseInfo: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  performedText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

export default HistoricoScreen;
