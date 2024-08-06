import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import StorageService from "@/services/storage";
import { dayNames } from "@/constants/Dates";

type ExerciseDetail = {
  name: string;
  sets: { reps: string; weight: string }[];
  image: string;
  performedReps?: string[];
  performedWeights?: string[];
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>
          Histórico de {dayName} {date}
        </Text>
        {history?.map((entry, index) => (
          <View key={index} style={styles.historyCard}>
            {entry.exerciseDetails.map((exercise, exIndex) => (
              <View key={exIndex} style={styles.exerciseCard}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Planificado</Text>
                  {exercise.sets.map((set, setIndex) => (
                    <Text key={setIndex} style={styles.exerciseInfo}>
                      Set {setIndex + 1}: {set.reps} reps, {set.weight}kg
                    </Text>
                  ))}
                </View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Realizado</Text>
                  {exercise.performedReps?.map((rep, repIndex) => (
                    <Text key={repIndex} style={styles.performedText}>
                      Set {repIndex + 1}: {rep} reps,{" "}
                      {exercise.performedWeights?.[repIndex]} kg
                    </Text>
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
