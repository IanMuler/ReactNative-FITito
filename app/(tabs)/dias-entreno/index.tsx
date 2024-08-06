// app/(tabs)/dias-entreno/index.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import LinearGradientItem from "@/components/LinearGradientItem";
import RadialGradientBackground from "@/components/RadialGradientBackground";
import StorageService from "@/services/storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import MenuPopup from "@/components/MenuPopup";

export type TrainingDay = {
  name: string;
  exercises?: { name: string; image: string }[];
};

const TrainingDaysScreen = () => {
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<TrainingDay | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  const loadTrainingDays = async () => {
    const savedDays = await StorageService.load("trainingDays");
    if (savedDays) {
      setTrainingDays(savedDays);
    }
  };

  const deleteTrainingDay = async () => {
    if (selectedDay) {
      const updatedDays = trainingDays.filter((day) => day !== selectedDay);
      setTrainingDays(updatedDays);
      await StorageService.save("trainingDays", updatedDays);
      setModalVisible(false);
      setMenuVisible(false); // Ensure the menu is closed
    }
  };

  const handleEditTrainingDay = () => {
    router.push({
      pathname: "/dias-entreno/anadir-dia",
      params: { name: selectedDay?.name },
    });
    setModalVisible(false);
    setMenuVisible(false); // Ensure the menu is closed
  };

  const options = [
    { label: "Editar", onPress: handleEditTrainingDay },
    { label: "Eliminar", onPress: () => setModalVisible(true) },
  ];

  useFocusEffect(
    React.useCallback(() => {
      loadTrainingDays();
    }, [])
  );

  return (
    <View style={styles.container}>
      <RadialGradientBackground />
      <View style={styles.header}>
        <Text style={styles.title} testID="title">Días de entreno</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {trainingDays.map((day, index) => (
          <LinearGradientItem
            key={index}
            styles={{ dayContainer: { ...styles.dayContainer, zIndex: -index } }} // zIndex to make sure the menu is on top
          >
            <View style={styles.dayContent} testID={`training-day-${day.name}`}>
              <Text style={styles.dayText}>{day.name}</Text>
              <View style={styles.ellipsisContainer}>
                <TouchableOpacity
                  testID="ellipsis-vertical"
                  onPress={() => {
                    setSelectedDay(day);
                    setMenuVisible(true);
                  }}
                >
                  <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                {selectedDay === day && (
                  <MenuPopup
                    visible={menuVisible}
                    onClose={() => setMenuVisible(false)}
                    options={options}
                  />
                )}
              </View>
            </View>
          </LinearGradientItem>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/dias-entreno/anadir-dia")}
        testID="button-add-training-day"
      >
        <Text style={styles.buttonText}>Añadir</Text>
      </TouchableOpacity>

      {selectedDay && (
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirmar eliminación</Text>
              <Text style={styles.modalText}>
                ¿Estás seguro de que quieres eliminar este día de entreno?
              </Text>
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)}
                  testID="cancel-delete"
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={deleteTrainingDay}
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
  dayContainer: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  dayContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayText: {
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

export default TrainingDaysScreen;
