// app/(tabs)/ejercicios/index.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import LinearGradientItem from "@/components/LinearGradientItem";
import RadialGradientBackground from "@/components/RadialGradientBackground";
import { useRouter } from "expo-router";
import StorageService from "@/services/storage";
import { Ionicons } from "@expo/vector-icons";
import Menu, { MenuItem } from "@/components/Menu";

export type Exercise = {
  name: string;
  image: string;
};

const ExercisesScreen = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const router = useRouter();

  const loadExercises = async () => {
    const savedExercises = await StorageService.load("exercises");
    if (savedExercises) {
      setExercises(savedExercises);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadExercises();
    }, [])
  );

  const deleteExercise = async () => {
    if (exerciseToDelete) {
      const updatedExercises = exercises.filter(
        (exercise) => exercise.name !== exerciseToDelete.name
      );
      setExercises(updatedExercises);
      await StorageService.save("exercises", updatedExercises);
      setModalVisible(false);
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    router.push({
      pathname: "/ejercicios/anadir-ejercicio",
      params: { name: exercise.name, image: exercise.image },
    });
  };

  const options = (exercise: Exercise) => [
    { label: "Editar", onPress: () => handleEditExercise(exercise), testID: "menu-option-edit" },
    { label: "Eliminar", onPress: () => { setExerciseToDelete(exercise); setModalVisible(true); }, testID: "menu-option-delete" },
  ];

  return (
    <View style={styles.container} testID="exercises-screen">
      <RadialGradientBackground />
      <View style={styles.header}>
        <Text style={styles.title}>Ejercicios</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {exercises.map((exercise, index) => (
          <LinearGradientItem
            key={index}
            styles={{ dayContainer: { ...styles.exerciseContainer, zIndex: -index } }} // zIndex to make sure the menu is on top
          >
            <View style={styles.exerciseContent} testID={`exercise-${exercise.name}`}>
              <View style={styles.exerciseTextContainer}>
                <Image
                  source={{ uri: exercise.image }}
                  style={styles.exerciseImage}
                />
                <Text style={styles.exerciseText}>{exercise.name}</Text>
              </View>
              <View style={styles.ellipsisContainer}>
                <Menu trigger={
                  <Ionicons
                    name="ellipsis-vertical"
                    size={24}
                    color="#FFFFFF"
                    testID="ellipsis-vertical"
                  />}
                >
                  {options(exercise).map((option, index) => (
                    <MenuItem key={index} text={option.label} onPress={option.onPress} testID={option.testID} />
                  ))}
                </Menu>
              </View>
            </View>
          </LinearGradientItem>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/ejercicios/anadir-ejercicio")}
      >
        <Text style={styles.buttonText}>Añadir</Text>
      </TouchableOpacity>

      {exerciseToDelete && (
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirmar eliminación</Text>
              <Text style={styles.modalText}>
                ¿Estás seguro de que quieres eliminar este ejercicio?
              </Text>
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={deleteExercise}
                  testID="confirm-delete"
                >
                  <Text style={styles.modalButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  exerciseContainer: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  exerciseContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exerciseTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseImage: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  exerciseText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  ellipsisContainer: {
    position: 'relative',
  },
  menuOptionText: {
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: "#2979FF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    backgroundColor: "#1F2940",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    color: "#A5A5A5",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    backgroundColor: "#2979FF",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});

export default ExercisesScreen;
