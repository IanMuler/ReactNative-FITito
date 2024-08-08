// app/(tabs)/rutina/index.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import RadialGradientBackground from "@/components/RadialGradientBackground";
import LinearGradientItem from "@/components/LinearGradientItem";
import StorageService from "@/services/storage";
import * as Font from "expo-font";
import { currentDayIndex, monthNames } from "@/constants/Dates";
import { ExerciseDetail } from "./configurar-entreno";
import Menu, { MenuItem } from "@/components/Menu";
import { useFocusEffect } from "@react-navigation/native";

export type Day = {
  name: string;
  rest: boolean;
  trainingDayName?: string | undefined;
  exerciseDetails?: ExerciseDetail[] | undefined;
  completed?: boolean;
};

const daysOfWeek: Day[] = [
  { name: "Lunes", rest: false },
  { name: "Martes", rest: false },
  { name: "Miércoles", rest: false },
  { name: "Jueves", rest: false },
  { name: "Viernes", rest: false },
  { name: "Sábado", rest: false },
  { name: "Domingo", rest: false },
];

const RoutineScreen = () => {
  const [days, setDays] = useState<Day[]>(daysOfWeek);
  const [iconsLoaded, setIconsLoaded] = useState(false);
  const router = useRouter();

  const currentWeek = Math.ceil(new Date().getDate() / 7);
  const month = monthNames[new Date().getMonth()];
  const year = new Date().getFullYear();

  const loadDays = async () => {
    const savedDays = await StorageService.load("routineDays");
    if (!savedDays) {
      await StorageService.save("routineDays", days);
    } else {
      setDays(savedDays);
    }
  };

  const loadIcons = async () => {
    await Font.loadAsync({
      ...Ionicons.font,
    });
    setIconsLoaded(true);
  };

  useEffect(() => {
    loadIcons();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadDays();
    }, [])
  );

  const toggleRestDay = async (day: Day) => {
    const updatedDays: Day[] = days.map((d) =>
      d.name === day.name ? { ...d, rest: !d.rest } : d
    );
    setDays(updatedDays);
    await StorageService.save("routineDays", updatedDays);
  };

  const assignTrainingDay = (day: Day) => {
    router.push({
      pathname: "/(tabs)/rutina/asignar-entreno",
      params: { dayName: day.name },
    });
  };

  const editTrainingDay = (day: Day) => {
    router.push({
      pathname: "/(tabs)/rutina/configurar-entreno",
      params: { dayName: day.name, trainingDayName: day.trainingDayName },
    });
  };

  const removeTrainingDay = async (day: Day) => {
    const updatedDays: Day[] = days.map((d) =>
      d.name === day.name
        ? { ...d, trainingDayName: undefined, exerciseDetails: undefined }
        : d
    );
    setDays(updatedDays);
    await StorageService.save("routineDays", updatedDays);
  };

  const handleDayPress = (dayIndex: number) => {
    if (days[dayIndex].completed) {
      router.push({
        pathname: "/(tabs)/rutina/historico",
        params: {
          date: new Date(
            new Date().setDate(
              new Date().getDate() - (currentDayIndex - dayIndex)
            )
          ).toLocaleDateString(),
        },
      });
    }
  };

  const currentDay = days[currentDayIndex];
  const isSessionDisabled =
    currentDay?.completed || !currentDay?.trainingDayName;

  const ButtonText = currentDay.rest
    ? "Día de descanso"
    : !currentDay?.trainingDayName
      ? "No hay entrenamiento asignado"
      : currentDay?.completed
        ? "Sesión finalizada"
        : "Empezar sesión";

  const options = (day: Day) =>
    [
      { label: day.rest ? "Día de rutina" : "Día de descanso", onPress: () => toggleRestDay(day), testID: `menu-option-toggle-rest-${day.name}` },
      { label: "Asignar entreno", onPress: () => assignTrainingDay(day), testID: `menu-option-assign-${day.name}` },
      ...(day.trainingDayName ? [
        { label: "Editar entreno", onPress: () => editTrainingDay(day), testID: `menu-option-edit-${day.name}` },
        { label: "Remover entreno", onPress: () => removeTrainingDay(day), testID: `menu-option-remove-${day.name}` },
      ] : []),
    ]

  return (
    <View style={styles.container} testID="routine-screen">
      <RadialGradientBackground />
      <View style={styles.header}>
        <Text style={styles.title}>Rutina</Text>
        <Text style={styles.subtitle}>
          Semana {currentWeek} - {month} {year}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {days.map((day, index) => (
          <LinearGradientItem
            key={index}
            styles={{
              dayContainer: styles.dayContainer,
              restDayContainer: styles.restDayContainer,
              activeContainer: styles.activeDayContainer,
            }}
            day={day}
            isActive={currentDayIndex === index}
          >
            <View style={[styles.dayInnerContainer]} testID={`day-${day.name}`}>
              <View>
                <Text
                  style={[
                    styles.dayText,
                    day.rest && styles.restDayText,
                    currentDayIndex === index && styles.activeDayText,
                  ]}
                >
                  {day.name}
                </Text>
                {day.trainingDayName && (
                  <Text style={styles.trainingDayText}>
                    {day.trainingDayName}
                  </Text>
                )}
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {day.completed && (
                  <TouchableOpacity onPress={() => handleDayPress(index)} testID={`day-completed-${day.name}`}>
                    <Ionicons name={"book"} size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
                <View style={styles.ellipsisContainer}>
                  <Menu trigger={
                    <Ionicons
                      name="ellipsis-vertical"
                      size={24}
                      color="#FFFFFF"
                      testID={`ellipsis-vertical-${day.name}`}
                    />}
                  >
                    {options(day).map((option, index) => (
                      <MenuItem key={index} text={option.label} onPress={option.onPress} testID={option.testID} />
                    ))}
                  </Menu>
                </View>
              </View>
            </View>
          </LinearGradientItem>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={[styles.button, isSessionDisabled && styles.disabledButton]}
        onPress={() => router.push("/(tabs)/rutina/sesion-de-entrenamiento")}
        disabled={isSessionDisabled}
        testID="button-start-session"
      >
        <Text style={styles.buttonText}>{ButtonText}</Text>
      </TouchableOpacity>
      {iconsLoaded && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => router.push("/(tabs)/rutina/management")}
          testID="button-settings"
        >
          <Ionicons name="settings" size={24} color="white" />
        </TouchableOpacity>
      )}
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
    marginBottom: 5,
  },
  subtitle: {
    color: "#A5A5A5",
    fontSize: 16,
    marginBottom: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    zIndex: 1,
  },
  dayContainer: {
    padding: 22,
    borderRadius: 10,
    marginBottom: 8,
    opacity: 0.8,
  },
  activeDayContainer: {
    backgroundColor: "#2979FF",
  },
  restDayContainer: {
    backgroundColor: "#A5A5A5",
  },
  dayInnerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayText: {
    color: "#A5A5A5",
    fontSize: 18,
    fontWeight: "bold",
  },
  trainingDayText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 5,
  },
  activeDayText: {
    color: "#FFFFFF",
  },
  restDayText: {
    color: "#6c757d",
  },
  button: {
    backgroundColor: "#2979FF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#A5A5A5", // Color del botón deshabilitado
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  ellipsisContainer: {
    position: 'relative',
    zIndex: 2,
  },
  menuOptionText: {
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 10,
  },
  floatingButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#2979FF",
    padding: 10,
    borderRadius: 20,
  },
});

export default RoutineScreen;
