/*
* Tests:
* 1. should display title, input and image picker
* 2. button should be disabled if exercise name or image is not provided
* 3. should save a new exercise
* 4. should not allow to save if exercise name is the same as an existing exercise
* 5. should render different title and button text if editing an existing exercise
* 6. should save changes if you are editing an existing exercise
*/

// __tests__/anadir-ejercicio.test.tsx

import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import AddExerciseScreen from "@/app/(tabs)/ejercicios/anadir-ejercicio"; // Adjust the path if necessary
import StorageService, { StorageKey } from "@/services/storage";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';

jest.mock("@/services/storage");
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: jest.fn(),
}));

const mockLaunchImageLibraryAsync = jest.fn();

jest.mock('expo-image-picker', () => ({
    launchImageLibraryAsync: () => mockLaunchImageLibraryAsync(),
    MediaTypeOptions: {
        Images: 'Images'
    }
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
        return null;
    },
    save: async () => { },
};

jest.spyOn(Alert, 'alert');

describe("AddExerciseScreen", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (StorageService.load as jest.Mock).mockImplementation(mockStorageService.load);
        (StorageService.save as jest.Mock).mockImplementation(mockStorageService.save);
        (useLocalSearchParams as jest.Mock).mockReturnValue({});
        mockLaunchImageLibraryAsync.mockResolvedValue({
            canceled: false,
            assets: [{ uri: 'http://example.com/new-image.png' }]
        });
    });

    test("should display title, input and image picker", async () => {
        const { getByTestId } = render(<AddExerciseScreen />);

        await waitFor(() => {
            expect(getByTestId("title")).toBeTruthy();
            expect(getByTestId("input-exercise-name")).toBeTruthy();
            expect(getByTestId("button-pick-image")).toBeTruthy();
        });
    });

    test("button should be disabled if exercise name or image is not provided", async () => {
        const { getByTestId } = render(<AddExerciseScreen />);

        await waitFor(() => {
            const saveButton = getByTestId("button-save-exercise");
            expect(saveButton.props.accessibilityState.disabled).toBe(true);
        });

        // Set exercise name but no image selected
        fireEvent.changeText(getByTestId("input-exercise-name"), "New Exercise");
        await waitFor(() => {
            const saveButton = getByTestId("button-save-exercise");
            expect(saveButton.props.accessibilityState.disabled).toBe(true);
        });

        // Set exercise name and select an image
        fireEvent.press(getByTestId("button-pick-image"));
        await waitFor(() => {
            const saveButton = getByTestId("button-save-exercise");
            expect(saveButton.props.accessibilityState.disabled).toBe(false);
        });
    });

    test("should save a new exercise", async () => {
        const { getByTestId } = render(<AddExerciseScreen />);
        const saveButton = getByTestId("button-save-exercise");

        await waitFor(() => {
            expect(getByTestId("title")).toBeTruthy();
        });

        fireEvent.changeText(getByTestId("input-exercise-name"), "New Exercise");
        fireEvent.press(getByTestId("button-pick-image"));

        await waitFor(() => {
            expect(saveButton.props.accessibilityState.disabled).toBe(false); // Wait for button to be enabled
            fireEvent.press(saveButton);
        });

        await waitFor(() => {
            expect(StorageService.save).toHaveBeenCalledWith("exercises", expect.arrayContaining([
                expect.objectContaining({
                    name: "New Exercise",
                    image: 'http://example.com/new-image.png'
                })
            ]));
            expect(mockRouter.back).toHaveBeenCalled();
        });
    });

    test("should not allow to save if exercise name is the same as an existing exercise", async () => {
        const { getByTestId } = render(<AddExerciseScreen />);

        await waitFor(() => {
            expect(getByTestId("title")).toBeTruthy();
        });

        fireEvent.changeText(getByTestId("input-exercise-name"), "Exercise 1");
        fireEvent.press(getByTestId("button-pick-image"));
        await waitFor(() => {
            expect(getByTestId("button-save-exercise").props.accessibilityState.disabled).toBe(false); // Wait for button to be enabled
            fireEvent.press(getByTestId("button-save-exercise"));
        });

        await waitFor(() => {
            expect(StorageService.save).not.toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalledWith("Error", "Ya existe un ejercicio con ese nombre.");
        });
    });

    test("should render different title and button text if editing an existing exercise", async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ name: "Exercise 1", image: "http://example.com/ex1.png" });

        const { getByTestId } = render(<AddExerciseScreen />);

        await waitFor(() => {
            expect(getByTestId("title")).toBeTruthy();
            expect(getByTestId("title").props.children).toBe("Editar ejercicio");
            expect(getByTestId("button-save-exercise-text").props.children).toBe("Guardar cambios");
        });
    });

    test("should save changes if you are editing an existing exercise", async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ name: "Exercise 1", image: "http://example.com/ex1.png" });

        const { getByTestId } = render(<AddExerciseScreen />);

        await waitFor(() => {
            expect(getByTestId("title")).toBeTruthy();
        });

        fireEvent.changeText(getByTestId("input-exercise-name"), "Exercise 1 Updated");
        await waitFor(() => {
            fireEvent.press(getByTestId("button-save-exercise"));
        });

        await waitFor(() => {
            expect(StorageService.save).toHaveBeenCalledWith("exercises", expect.arrayContaining([
                expect.objectContaining({
                    name: "Exercise 1 Updated",
                })
            ]));
            expect(mockRouter.back).toHaveBeenCalled();
        });
    });
});
