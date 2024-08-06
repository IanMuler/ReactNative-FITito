/*
* Tests:
* 1. should title, input and exercises with its images and names
* 2. button should be disabled if day name is empty or no exercises are selected
* 3. should allow to select and deselect exercises
* 4. should save a new training day
* 5. should don't allow to save if day name is the same as an existing day
* 6. should render different title and button text if editing an existing day
* 7. should save changes if you are editing an existing day
*/

// __tests__/anadir-dia.test.tsx

import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import AddTrainingDayScreen, { styles } from "@/app/(tabs)/dias-entreno/anadir-dia";
import StorageService, { StorageKey } from "@/services/storage";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';

jest.mock("@/services/storage");
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: jest.fn(),
}));

const mockRouter = {
    back: jest.fn(),
    push: jest.fn(),
};

const mockStorageService = {
    load: async (key: StorageKey) => {
        if (key === "exercises") {
            return [
                { name: "Exercise 1", image: "http://example.com/ex1.png" },
                { name: "Exercise 2", image: "http://example.com/ex2.png" },
            ];
        }
        if (key === "trainingDays") {
            return [
                { name: "Existing Day", exercises: [{ name: "Exercise 1", image: "http://example.com/ex1.png" }] },
            ];
        }
        return null;
    },
    save: async () => { },
};

jest.spyOn(Alert, 'alert');

describe("AddTrainingDayScreen", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (StorageService.load as jest.Mock).mockImplementation(mockStorageService.load);
        (StorageService.save as jest.Mock).mockImplementation(mockStorageService.save);
        (useLocalSearchParams as jest.Mock).mockReturnValue({});
    });

    test("should display title, input and exercises with their images and names", async () => {
        const { getByTestId } = render(<AddTrainingDayScreen />);

        await waitFor(() => {
            expect(getByTestId("title")).toBeTruthy();
            expect(getByTestId("input-day-name")).toBeTruthy();
            expect(getByTestId("exercise-Exercise 1")).toBeTruthy();
            expect(getByTestId("exercise-Exercise 2")).toBeTruthy();
            expect(getByTestId("exercise-Exercise 1-image")).toBeTruthy();
            expect(getByTestId("exercise-Exercise 2-image")).toBeTruthy();
            expect(getByTestId("exercise-Exercise 1-text")).toBeTruthy();
            expect(getByTestId("exercise-Exercise 2-text")).toBeTruthy();
        });
    });

    test("button should be disabled if day name is empty or no exercises are selected", async () => {
        const { getByTestId } = render(<AddTrainingDayScreen />);

        await waitFor(() => {
            // Initial state: no day name and no exercises selected
            const saveButton = getByTestId("button-save-training-day");
            expect(saveButton.props.accessibilityState.disabled).toBe(true);
        });

        // Set day name but no exercises selected
        fireEvent.changeText(getByTestId("input-day-name"), "New Day");
        await waitFor(() => {
            const saveButton = getByTestId("button-save-training-day");
            expect(saveButton.props.accessibilityState.disabled).toBe(true);
        });

        // Select an exercise but clear day name
        fireEvent.press(getByTestId("exercise-Exercise 1"));
        fireEvent.changeText(getByTestId("input-day-name"), "");
        await waitFor(() => {
            const saveButton = getByTestId("button-save-training-day");
            expect(saveButton.props.accessibilityState.disabled).toBe(true);
        });

        // Set day name and select an exercise
        fireEvent.changeText(getByTestId("input-day-name"), "New Day");
        await waitFor(() => {
            const saveButton = getByTestId("button-save-training-day");
            expect(saveButton.props.accessibilityState.disabled).toBe(false);
        });
    });

    test("should allow to select and deselect exercises", async () => {
        const { getByTestId } = render(<AddTrainingDayScreen />);

        await waitFor(() => {
            expect(getByTestId("exercise-Exercise 1")).toBeTruthy();
            expect(getByTestId("exercise-Exercise 2")).toBeTruthy();
        });

        const exercise1 = getByTestId("exercise-Exercise 1");
        const exercise2 = getByTestId("exercise-Exercise 2");

        // Select exercise 1
        fireEvent.press(exercise1);
        await waitFor(() => {
            expect(exercise1.props.style.backgroundColor).toBe(styles.selectedExerciseCard.backgroundColor);
        });

        // Select exercise 2
        fireEvent.press(exercise2);
        await waitFor(() => {
            expect(exercise2.props.style.backgroundColor).toBe(styles.selectedExerciseCard.backgroundColor);
        });

        // Deselect exercise 1
        fireEvent.press(exercise1);
        await waitFor(() => {
            expect(exercise1.props.style.backgroundColor).not.toBe(styles.selectedExerciseCard.backgroundColor);
        });

        // Deselect exercise 2
        fireEvent.press(exercise2);
        await waitFor(() => {
            expect(exercise2.props.style.backgroundColor).not.toBe(styles.selectedExerciseCard.backgroundColor);
        });
    });

    test("should save a new training day", async () => {
        const { getByTestId } = render(<AddTrainingDayScreen />);
        //wait for dom to load
        await waitFor(() => {
            expect(getByTestId("title")).toBeTruthy();
        });

        fireEvent.changeText(getByTestId("input-day-name"), "New Training Day");
        fireEvent.press(getByTestId("exercise-Exercise 1"));

        fireEvent.press(getByTestId("button-save-training-day"));

        await waitFor(() => {
            expect(StorageService.save).toHaveBeenCalledWith("trainingDays", expect.arrayContaining([
                expect.objectContaining({
                    name: "New Training Day",
                    exercises: expect.arrayContaining([
                        expect.objectContaining({ name: "Exercise 1" })
                    ])
                })
            ]));
            expect(mockRouter.back).toHaveBeenCalled();
        });
    });

    test("should not allow to save if day name is the same as an existing day", async () => {
        const { getByTestId } = render(<AddTrainingDayScreen />);

        //wait for dom to load
        await waitFor(() => {
            expect(getByTestId("title")).toBeTruthy();
        });

        fireEvent.changeText(getByTestId("input-day-name"), "Existing Day");
        fireEvent.press(getByTestId("exercise-Exercise 1"));

        fireEvent.press(getByTestId("button-save-training-day"));

        await waitFor(() => {
            expect(StorageService.save).not.toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalledWith("Error", "Ya existe un día de entreno con ese nombre.");
        });
    });

    test("should render different title and button text if editing an existing day", async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ name: "Existing Day" });

        const { getByTestId } = render(<AddTrainingDayScreen />);

        await waitFor(() => {
            expect(getByTestId("title")).toBeTruthy();
            expect(getByTestId("title").props.children).toBe("Editar día de entreno");
            expect(getByTestId("button-save-training-day-text").props.children).toBe("Guardar cambios");
        });
    });

    test("should save changes if you are editing an existing day", async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ name: "Existing Day" });

        const { getByTestId } = render(<AddTrainingDayScreen />);

        await waitFor(() => {
            expect(getByTestId("title")).toBeTruthy();
        });

        fireEvent.changeText(getByTestId("input-day-name"), "Existing Day Updated");
        fireEvent.press(getByTestId("exercise-Exercise 2"));

        fireEvent.press(getByTestId("button-save-training-day"));

        await waitFor(() => {
            expect(StorageService.save).toHaveBeenCalledWith("trainingDays", expect.arrayContaining([
                expect.objectContaining({
                    name: "Existing Day Updated",
                    exercises: expect.arrayContaining([
                        expect.objectContaining({ name: "Exercise 1" }),
                        expect.objectContaining({ name: "Exercise 2" })
                    ])
                })
            ]));
            expect(mockRouter.back).toHaveBeenCalled();
        });
    });
});
