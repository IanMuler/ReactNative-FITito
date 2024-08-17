/* Tests:
* - should display the title
* - should load exercise details
* - should enable save button when all inputs are filled
* - should disable save button when any input is empty
* - should add a set
* - should remove a set
* - should add and remove RP field
* - should add and remove DS field
* - should add and remove Partials field
* - should save the training day with RP, DS, and Partials
*/

// __tests__/configurar-entreno.test.tsx

import React from "react";
import { render, waitFor, fireEvent, screen } from "@testing-library/react-native";
import ConfigureTrainingDayScreen from "@/app/(tabs)/rutina/configurar-entreno"; // Adjust the path if necessary
import StorageService, { StorageKey } from "@/services/storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PortalProvider } from '@gorhom/portal';

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
        if (key === "routineDays") {
            return [
                {
                    name: "Lunes",
                    rest: false,
                    trainingDayName: "Training Day 1",
                    exerciseDetails: [
                        {
                            name: "Exercise 1",
                            sets: [{ reps: "10", weight: "50", rir: "2" }],
                            image: "http://example.com/ex1.png",
                        },
                    ],
                },
            ];
        }
        if (key === "trainingDays") {
            return [
                {
                    name: "Training Day 1",
                    exercises: [{ name: "Exercise 1", image: "http://example.com/ex1.png" }],
                },
            ];
        }
        return null;
    },
    save: jest.fn(),
};

describe("ConfigureTrainingDayScreen", () => {

    beforeAll(() => {
        jest.useFakeTimers();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useLocalSearchParams as jest.Mock).mockReturnValue({ dayName: "Lunes", trainingDayName: "Training Day 1" });
        (StorageService.load as jest.Mock).mockImplementation(mockStorageService.load);
        (StorageService.save as jest.Mock).mockImplementation(mockStorageService.save);
    });

    const renderWithProviders = (component: JSX.Element) => {
        return render(
            <PortalProvider>
                {component}
            </PortalProvider>
        );
    };

    test("should display the title", async () => {
        renderWithProviders(<ConfigureTrainingDayScreen />);

        await waitFor(() => {
            expect(screen.getByTestId("config-title")).toHaveTextContent("Configurar Training Day 1 para Lunes");
        });
    });

    test("should load exercise details", async () => {
        renderWithProviders(<ConfigureTrainingDayScreen />);

        await waitFor(() => {
            expect(screen.getByTestId("exercise-Exercise 1")).toBeTruthy();
            expect(screen.getByTestId("input-reps-Exercise 1-0")).toHaveProp("value", "10");
            expect(screen.getByTestId("input-weight-Exercise 1-0")).toHaveProp("value", "50");
            expect(screen.getByTestId("input-rir-Exercise 1-0")).toHaveProp("value", "2");
        });
    });

    test("should enable save button when all inputs are filled", async () => {
        renderWithProviders(<ConfigureTrainingDayScreen />);

        await waitFor(() => {
            expect(screen.getByTestId("button-save").props.accessibilityState.disabled).toBe(false);
        });
    });

    test("should disable save button when any input is empty", async () => {
        renderWithProviders(<ConfigureTrainingDayScreen />);

        await waitFor(() => {
            fireEvent.changeText(screen.getByTestId("input-reps-Exercise 1-0"), "");
        });

        await waitFor(() => {
            expect(screen.getByTestId("button-save").props.accessibilityState.disabled).toBe(true);
        });
    });

    test("should add a set", async () => {
        renderWithProviders(<ConfigureTrainingDayScreen />);

        await waitFor(() => {
            fireEvent.press(screen.getByTestId("button-add-set-Exercise 1"));
        });

        await waitFor(() => {
            expect(screen.getByTestId("input-reps-Exercise 1-1")).toBeTruthy();
            expect(screen.getByTestId("input-weight-Exercise 1-1")).toBeTruthy();
            expect(screen.getByTestId("input-rir-Exercise 1-1")).toBeTruthy();
        });
    });

    test("should remove a set", async () => {
        renderWithProviders(<ConfigureTrainingDayScreen />);

        await waitFor(() => {
            fireEvent.press(screen.getByTestId("button-add-set-Exercise 1"));
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId("button-remove-set-Exercise 1"));
        });

        await waitFor(() => {
            expect(screen.queryByTestId("input-reps-Exercise 1-1")).toBeNull();
            expect(screen.queryByTestId("input-weight-Exercise 1-1")).toBeNull();
            expect(screen.queryByTestId("input-rir-Exercise 1-1")).toBeNull();
        });
    });

    test("should add and remove RP field", async () => {
        renderWithProviders(<ConfigureTrainingDayScreen />);

        await waitFor(() => {
            fireEvent.press(screen.getByTestId("button-rp-toggle-Exercise 1-0"));
        });

        await waitFor(() => {
            expect(screen.getByTestId("input-rp-Exercise 1-0-0")).toBeTruthy();
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId("button-rp-toggle-Exercise 1-0"));
        });

        await waitFor(() => {
            expect(screen.queryByTestId("input-rp-Exercise 1-0-0")).toBeNull();
        });
    });

    test("should add and remove DS field", async () => {
        renderWithProviders(<ConfigureTrainingDayScreen />);

        await waitFor(() => {
            fireEvent.press(screen.getByTestId("button-ds-toggle-Exercise 1-0"));
        });

        await waitFor(() => {
            expect(screen.getByTestId("input-ds-reps-Exercise 1-0-0")).toBeTruthy();
            expect(screen.getByTestId("input-ds-peso-Exercise 1-0-0")).toBeTruthy();
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId("button-ds-toggle-Exercise 1-0"));
        });

        await waitFor(() => {
            expect(screen.queryByTestId("input-ds-reps-Exercise 1-0-0")).toBeNull();
            expect(screen.queryByTestId("input-ds-peso-Exercise 1-0-0")).toBeNull();
        });
    });

    test("should add and remove Partials field", async () => {
        renderWithProviders(<ConfigureTrainingDayScreen />);

        await waitFor(() => {
            fireEvent.press(screen.getByTestId("button-p-toggle-Exercise 1-0"));
        });

        await waitFor(() => {
            expect(screen.getByTestId("input-partials-reps-Exercise 1-0")).toBeTruthy();
            fireEvent.changeText(screen.getByTestId("input-partials-reps-Exercise 1-0"), "3");
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId("button-p-toggle-Exercise 1-0"));
        });

        await waitFor(() => {
            expect(screen.queryByTestId("input-partials-reps-Exercise 1-0")).toBeNull();
        });
    });

    test("should save the training day with RP, DS, and Partials", async () => {
        renderWithProviders(<ConfigureTrainingDayScreen />);

        await waitFor(() => {
            fireEvent.press(screen.getByTestId("button-rp-toggle-Exercise 1-0"));
            fireEvent.press(screen.getByTestId("button-ds-toggle-Exercise 1-0"));
            fireEvent.press(screen.getByTestId("button-p-toggle-Exercise 1-0"));
        });

        await waitFor(() => {
            fireEvent.changeText(screen.getByTestId("input-rp-Exercise 1-0-0"), "RP1");
            fireEvent.changeText(screen.getByTestId("input-reps-Exercise 1-0"), "15");
            fireEvent.changeText(screen.getByTestId("input-weight-Exercise 1-0"), "60");
            fireEvent.changeText(screen.getByTestId("input-ds-reps-Exercise 1-0-0"), "5");
            fireEvent.changeText(screen.getByTestId("input-ds-peso-Exercise 1-0-0"), "30");
            fireEvent.changeText(screen.getByTestId("input-partials-reps-Exercise 1-0"), "3");
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId("button-save"));
        });

        await waitFor(() => {
            expect(StorageService.save).toHaveBeenCalledWith("routineDays", expect.arrayContaining([
                expect.objectContaining({
                    name: "Lunes",
                    trainingDayName: "Training Day 1",
                    exerciseDetails: expect.arrayContaining([
                        expect.objectContaining({
                            name: "Exercise 1",
                            sets: expect.arrayContaining([
                                expect.objectContaining({
                                    reps: "15",
                                    weight: "60",
                                    rp: expect.arrayContaining([{ value: "RP1", time: 5 }]),
                                    ds: expect.arrayContaining([{ reps: "5", peso: "30" }]),
                                    partials: { reps: "3" }
                                }),
                            ]),
                        }),
                    ]),
                }),
            ]));
            expect(mockRouter.push).toHaveBeenCalledWith({ pathname: "/(tabs)/rutina" });
        });
    });
});
