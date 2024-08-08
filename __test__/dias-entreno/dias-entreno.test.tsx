/*
* Tests:
* 1. should display the title and list of training days
* 2. should navigate to add training day screen on button press
* 3. should show edit and delete options for each training day
* 
* Not possible to test:
* 1. The menu interaction to go to the edit screen
* 2. The menu interaction to delete a training day
*/

// __tests__/dias-entreno.test.tsx
import React from "react";
import { render, waitFor, fireEvent, screen } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import TrainingDaysScreen from "@/app/(tabs)/dias-entreno"; // Ajusta la ruta si es necesario
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
        if (key === "trainingDays") {
            return [
                { name: "Training Day 1", exercises: [{ name: "Exercise 1", image: "http://example.com/ex1.png" }] },
                { name: "Training Day 2", exercises: [{ name: "Exercise 2", image: "http://example.com/ex2.png" }] },
            ];
        }
        return null;
    },
    save: async () => { },
};

describe("TrainingDaysScreen", () => {

    beforeAll(() => {
        jest.useFakeTimers();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (StorageService.load as jest.Mock).mockImplementation(mockStorageService.load);
        (StorageService.save as jest.Mock).mockImplementation(mockStorageService.save);
    });

    // Necesario para usar UseFocusEffect de react-navigation
    const renderWithProviders = (component: JSX.Element) => {
        return render(
            <NavigationContainer>
                <PortalProvider>
                    {component}
                </PortalProvider>
            </NavigationContainer>
        );
    };

    test("should display the title and list of training days", async () => {
        renderWithProviders(<TrainingDaysScreen />);

        await waitFor(() => {
            expect(screen.getByTestId("title")).toBeTruthy();
            expect(screen.getByTestId("training-day-Training Day 1")).toBeTruthy();
            expect(screen.getByTestId("training-day-Training Day 2")).toBeTruthy();
        });
    });

    test("should navigate to add training day screen on button press", async () => {
        renderWithProviders(<TrainingDaysScreen />);

        fireEvent.press(screen.getByTestId("button-add-training-day"));

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith("/dias-entreno/anadir-dia");
        });
    });

    test("should show edit and delete options for each training day", async () => {
        renderWithProviders(<TrainingDaysScreen />);

        await waitFor(() => {
            expect(screen.getByTestId("training-day-Training Day 1")).toBeTruthy();
            expect(screen.getByTestId("training-day-Training Day 2")).toBeTruthy();
        });

        fireEvent.press(screen.getAllByTestId("ellipsis-vertical")[0]);

        await waitFor(() => {
            expect(screen.getByTestId("menu-option-edit-Training Day 1")).toBeTruthy();
            expect(screen.getByTestId("menu-option-delete-Training Day 1")).toBeTruthy();
        });
    });

    test("should navigate to edit training day screen on menu option press", async () => {
        renderWithProviders(<TrainingDaysScreen />);

        await waitFor(() => {
            expect(screen.getAllByTestId("ellipsis-vertical")[0]).toBeTruthy();
        });

        fireEvent.press(screen.getAllByTestId("ellipsis-vertical")[0]);

        await waitFor(() => {
            fireEvent.press(screen.getByTestId("menu-option-edit-Training Day 1"));
        });

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith({
                pathname: "/dias-entreno/anadir-dia",
                params: { name: "Training Day 1" },
            });
        });
    });

    test("should delete training day on menu option press", async () => {
        renderWithProviders(<TrainingDaysScreen />);

        await waitFor(() => {
            expect(screen.getByTestId("training-day-Training Day 1")).toBeTruthy();
            expect(screen.getAllByTestId("ellipsis-vertical")[0]).toBeTruthy();
        });

        fireEvent.press(screen.getAllByTestId("ellipsis-vertical")[0]);
        fireEvent.press(screen.getByTestId("menu-option-delete-Training Day 1"));
        fireEvent.press(screen.getByTestId("confirm-delete"));

        await waitFor(() => {
            expect(screen.queryByText("Training Day 1")).toBeNull();
        });
    });
});
