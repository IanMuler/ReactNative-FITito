/*
* Tests:
* - should display the title and list of routine days
* - should toggle rest day option in menu
* - should go to assign training day screen in menu
* - should go to edit training day screen in menu
* - should remove training day in menu
* - should start session on button press
*/

// __tests__/rutina.test.tsx
import React from "react";
import { render, waitFor, fireEvent, screen } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import RoutineScreen from "@/app/(tabs)/rutina"; // Adjust the path if necessary
import StorageService, { StorageKey } from "@/services/storage";
import { useRouter } from 'expo-router';
import { PortalProvider } from '@gorhom/portal';

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
        if (key === "routineDays") {
            return [
                { name: "Lunes", rest: false, trainingDayName: "Training Day 1", completed: false },
                { name: "Martes", rest: false, trainingDayName: "Training Day 2", completed: false },
                { name: "Miércoles", rest: false, trainingDayName: "Training Day 3", completed: false },
                { name: "Jueves", rest: false, trainingDayName: "Training Day 4", completed: false },
                { name: "Viernes", rest: false, trainingDayName: "Training Day 5", completed: false },
                { name: "Sábado", rest: false, trainingDayName: "Training Day 6", completed: false },
                { name: "Domingo", rest: false, trainingDayName: "Training Day 7", completed: false },
            ];
        }
        return null;
    },
    save: jest.fn(),
};

describe("RoutineScreen", () => {

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

    test("should display the title and list of routine days", async () => {
        renderWithProviders(<RoutineScreen />);

        await waitFor(() => {
            expect(screen.getByText("Rutina")).toBeTruthy();
            expect(screen.getByText("Lunes")).toBeTruthy();
            expect(screen.getByText("Martes")).toBeTruthy();
            expect(screen.getByText("Miércoles")).toBeTruthy();
            expect(screen.getByText("Jueves")).toBeTruthy();
            expect(screen.getByText("Viernes")).toBeTruthy();
            expect(screen.getByText("Sábado")).toBeTruthy();
            expect(screen.getByText("Domingo")).toBeTruthy();
        });
    });

    test("should toggle rest day option in menu", async () => {
        renderWithProviders(<RoutineScreen />);

        await waitFor(() => {
            expect(screen.getByText("Lunes")).toBeTruthy();
        });

        fireEvent.press(screen.getByTestId("ellipsis-vertical-Lunes"));
        fireEvent.press(screen.getByTestId("menu-option-toggle-rest-Lunes"));

        await waitFor(() => {
            expect(mockStorageService.save).toHaveBeenCalledWith(
                "routineDays",
                expect.arrayContaining([
                    expect.objectContaining({
                        name: "Lunes",
                        rest: true,
                        trainingDayName: "Training Day 1",
                        completed: false
                    })
                ])
            );
        });
    });

    test("should go to assign training day screen in menu", async () => {
        renderWithProviders(<RoutineScreen />);

        await waitFor(() => {
            expect(screen.getByText("Lunes")).toBeTruthy();
        });

        fireEvent.press(screen.getByTestId("ellipsis-vertical-Lunes"));
        fireEvent.press(screen.getByTestId("menu-option-assign-Lunes"));

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith({
                pathname: "/(tabs)/rutina/asignar-entreno",
                params: { dayName: "Lunes" },
            });
        });
    });

    test("should go to edit training day screen in menu", async () => {
        renderWithProviders(<RoutineScreen />);

        await waitFor(() => {
            expect(screen.getByText("Lunes")).toBeTruthy();
        });

        fireEvent.press(screen.getByTestId("ellipsis-vertical-Lunes"));
        fireEvent.press(screen.getByTestId("menu-option-edit-Lunes"));

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith({
                pathname: "/(tabs)/rutina/configurar-entreno",
                params: { dayName: "Lunes", trainingDayName: "Training Day 1" },
            });
        });
    });

    test("should remove training day in menu", async () => {
        renderWithProviders(<RoutineScreen />);

        await waitFor(() => {
            expect(screen.getByText("Lunes")).toBeTruthy();
        });

        fireEvent.press(screen.getByTestId("ellipsis-vertical-Lunes"));
        fireEvent.press(screen.getByTestId("menu-option-remove-Lunes"));

        await waitFor(() => {
            expect(mockStorageService.save).toHaveBeenCalledWith("routineDays",
                expect.arrayContaining([
                    expect.objectContaining({
                        name: "Lunes",
                        rest: false,
                        trainingDayName: undefined,
                        exerciseDetails: undefined,
                        completed: false
                    }),
                ]));
        });
    });

    test("should start session on button press", async () => {
        renderWithProviders(<RoutineScreen />);

        await waitFor(() => {
            expect(screen.getByText("Lunes")).toBeTruthy();
        });

        fireEvent.press(screen.getByTestId("button-start-session"));

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith("/(tabs)/rutina/sesion-de-entrenamiento");
        });
    });
});
