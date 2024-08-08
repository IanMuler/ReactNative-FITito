/*
* Tests:
* 1. should display the title and list of exercise
* 2. should navigate to add exercise screen on button press
* 3. should show edit and delete options for each exercise
* 4. should navigate to edit exercise screen on menu option press
* 5. should delete exercise on menu option press
*/

// __test__/ejercicios/ejercicios.test.tsx
import React from "react";
import { render, waitFor, fireEvent, screen } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import ExercisesScreen from "@/app/(tabs)/ejercicios"; // Adjust the path if necessary
import StorageService, { StorageKey } from "@/services/storage";
import { useRouter } from 'expo-router';
import { PortalProvider } from "@gorhom/portal";

jest.mock("@/services/storage");
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
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

describe("ExercisesScreen", () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (StorageService.load as jest.Mock).mockImplementation(mockStorageService.load);
        (StorageService.save as jest.Mock).mockImplementation(mockStorageService.save);
    });

    const renderWithProviders = (component: JSX.Element) => {
        return render(
            <NavigationContainer>
                <PortalProvider>
                    {component}
                </PortalProvider>
            </NavigationContainer>
        );
    };

    test("should display the title and list of exercises", async () => {
        renderWithProviders(<ExercisesScreen />);

        await waitFor(() => {
            expect(screen.getByText("Ejercicios")).toBeTruthy();
            expect(screen.getByText("Exercise 1")).toBeTruthy();
            expect(screen.getByText("Exercise 2")).toBeTruthy();
        });
    });

    test("should navigate to add exercise screen on button press", async () => {
        renderWithProviders(<ExercisesScreen />);

        fireEvent.press(screen.getByText("Añadir"));

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith("/ejercicios/anadir-ejercicio");
        });
    });

    test("should show edit and delete options for each exercise", async () => {
        renderWithProviders(<ExercisesScreen />);

        await waitFor(() => {
            expect(screen.getByText("Exercise 1")).toBeTruthy();
            expect(screen.getByText("Exercise 2")).toBeTruthy();
        });

        fireEvent.press(screen.getAllByTestId("ellipsis-vertical")[0]);

        await waitFor(() => {
            const editButtons = screen.getAllByText("Editar");
            const deleteButtons = screen.getAllByText("Eliminar");
            expect(editButtons.length).toBeGreaterThan(0);
            expect(deleteButtons.length).toBeGreaterThan(0);
        });
    });

    test("should navigate to edit exercise screen on menu option press", async () => {
        renderWithProviders(<ExercisesScreen />);

        await waitFor(() => {
            expect(screen.getAllByTestId("ellipsis-vertical")[0]).toBeTruthy();
        });

        fireEvent.press(screen.getAllByTestId("ellipsis-vertical")[0]);

        await waitFor(() => {
            fireEvent.press(screen.getAllByText("Editar")[0]);
        });

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith({
                pathname: "/ejercicios/anadir-ejercicio",
                params: { name: "Exercise 1", image: "http://example.com/ex1.png" },
            });
        });
    });

    test("should delete exercise on menu option press", async () => {
        renderWithProviders(<ExercisesScreen />);

        await waitFor(() => {
            expect(screen.getByTestId("exercise-Exercise 1")).toBeTruthy();
            expect(screen.getAllByTestId("ellipsis-vertical")[0]).toBeTruthy();
        });

        fireEvent.press(screen.getAllByTestId("ellipsis-vertical")[0]);
        fireEvent.press(screen.getByTestId("menu-option-delete"));
        fireEvent.press(screen.getByTestId("confirm-delete"));

        await waitFor(() => {
            expect(screen.queryByText("Exercise 1")).toBeNull();
        });
    });
});