// app/(tabs)/rutina/[dayName].tsx
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
import { TrainingDay } from "../dias-entreno";

const AssignTrainingDayScreen = () => {
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const router = useRouter();
  const { dayName } = useLocalSearchParams();

  useEffect(() => {
    const loadTrainingDays = async () => {
      const savedTrainingDays = await StorageService.load("trainingDays");
      if (savedTrainingDays) {
        setTrainingDays(savedTrainingDays);
      }
    };

    loadTrainingDays();
  }, []);

  const assignTrainingDay = (trainingDay: TrainingDay) => {
    router.push({
      pathname: "/(tabs)/rutina/configurar-entreno",
      params: { dayName, trainingDayName: trainingDay.name },
    });
  };

  return (
    <View style={styles.container}>
      <RadialGradientBackground />
      <View style={styles.header}>
        <Text style={styles.title}>Asignar entreno a {dayName}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {trainingDays.map((trainingDay, index) => (
          <TouchableOpacity
            key={index}
            style={styles.trainingDayContainer}
            onPress={() => assignTrainingDay(trainingDay)}
          >
            <Text style={styles.trainingDayText}>{trainingDay.name}</Text>
          </TouchableOpacity>
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
  header: {
    marginTop: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  trainingDayContainer: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#1F2940",
    marginBottom: 10,
  },
  trainingDayText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
});

export default AssignTrainingDayScreen;
