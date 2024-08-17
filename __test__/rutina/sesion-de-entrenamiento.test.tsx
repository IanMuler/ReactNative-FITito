/* Tests:
* - should display the title and list of exercises
* - should update reps, weight, and RIR for Exercise 1
* - should navigate to next exercise
* - should update reps, weight, and RIR for Exercise 2
* - should add and update RP, DS, and Partials for Exercise 1
* - should navigate to previous exercise
* - should save the session with RP, DS, Partials, and RIR
*/

// __test__/rutina/sesion-de-entrenamiento.test.tsx
import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { PortalProvider } from "@gorhom/portal";
import TrainingSessionScreen from "@/app/(tabs)/rutina/sesion-de-entrenamiento";
import StorageService, { StorageKey } from "@/services/storage";
import { useRouter } from "expo-router";
import { currentDayIndex, dayNames } from "@/constants/Dates";
import { Day } from "@/app/(tabs)/rutina";

jest.mock("@/services/storage");
jest.mock("expo-router", () => ({
    useRouter: jest.fn(),
}));

const mockRouter = {
    back: jest.fn(),
    push: jest.fn(),
};

const mockStorageService = {
    load: async (key: StorageKey) => {
        if (key === "routineDays") {
            const routineDays: Day[] = dayNames.map((name) => ({ name, rest: false }));
            routineDays[currentDayIndex].trainingDayName = "Training Day 1";
            routineDays[currentDayIndex].exerciseDetails = [
                {
                    name: "Exercise 1", sets: [{
                        reps: "10", weight: "50", rir: "2", rp: [{ value: "RP1", time: 5 }], ds: [{ reps: "5", peso: "30" }], partials: { reps: "3" }
                    }], image: "http://example.com/ex1.png"
                },
                {
                    name: "Exercise 2", sets: [{ reps: "12", weight: "60", rir: "3", rp: [{ value: "RP2", time: 6 }], ds: [{ reps: "6", peso: "40" }], partials: { reps: "4" } }
                    ], image: "http://example.com/ex2.png"
                },
            ];

            return routineDays;
        }
        return null;
    },
    save: jest.fn(),
};

describe("TrainingSessionScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (StorageService.load as jest.Mock).mockImplementation(mockStorageService.load);
        (StorageService.save as jest.Mock).mockImplementation(mockStorageService.save);
    });

    const renderWithProviders = (component: JSX.Element) => {
        return render(
            <NavigationContainer>
                <PortalProvider>{component}</PortalProvider>
            </NavigationContainer>
        );
    };

    test("should render the training session screen with exercises", async () => {
        const { getByText, getByTestId } = renderWithProviders(<TrainingSessionScreen />);

        await waitFor(() => {
            expect(getByText("Training Day 1")).toBeTruthy();
            expect(getByText("Exercise 1")).toBeTruthy();
            expect(getByTestId("exercise-image-Exercise 1")).toBeTruthy();
            expect(getByTestId("input-reps-Exercise 1-0")).toBeTruthy();
            expect(getByTestId("input-weight-Exercise 1-0")).toBeTruthy();
            expect(getByTestId("input-rir-Exercise 1-0")).toBeTruthy();
        });
    });

    test("should update reps, weight, and RIR for Exercise 1", async () => {
        const { getByTestId } = renderWithProviders(<TrainingSessionScreen />);

        await waitFor(() => {
            fireEvent.changeText(getByTestId("input-reps-Exercise 1-0"), "12");
            fireEvent.changeText(getByTestId("input-weight-Exercise 1-0"), "55");
            fireEvent.changeText(getByTestId("input-rir-Exercise 1-0"), "3");
        });

        expect(getByTestId("input-reps-Exercise 1-0").props.value).toBe("12");
        expect(getByTestId("input-weight-Exercise 1-0").props.value).toBe("55");
        expect(getByTestId("input-rir-Exercise 1-0").props.value).toBe("3");
    });

    test("should navigate to next exercise", async () => {
        const { getByTestId, getByText } = renderWithProviders(<TrainingSessionScreen />);

        await waitFor(() => {
            expect(getByText("Training Day 1")).toBeTruthy();
        });

        fireEvent.press(getByTestId("button-next"));

        await waitFor(() => {
            expect(getByText("Exercise 2")).toBeTruthy();
        });
    });

    test("should update reps, weight, and RIR for Exercise 2", async () => {
        const { getByTestId, getByText } = renderWithProviders(<TrainingSessionScreen />);

        await waitFor(() => {
            expect(getByText("Training Day 1")).toBeTruthy();
        });

        fireEvent.press(getByTestId("button-next"));

        await waitFor(() => {
            expect(getByText("Exercise 2")).toBeTruthy();
        });

        await waitFor(() => {
            fireEvent.changeText(getByTestId("input-reps-Exercise 2-0"), "14");
            fireEvent.changeText(getByTestId("input-weight-Exercise 2-0"), "65");
            fireEvent.changeText(getByTestId("input-rir-Exercise 2-0"), "4");
        });

        expect(getByTestId("input-reps-Exercise 2-0").props.value).toBe("14");
        expect(getByTestId("input-weight-Exercise 2-0").props.value).toBe("65");
        expect(getByTestId("input-rir-Exercise 2-0").props.value).toBe("4");
    });

    test("should add and update RP, DS, and Partials for Exercise 1", async () => {
        const { getByTestId } = renderWithProviders(<TrainingSessionScreen />);

        await waitFor(() => {
            fireEvent.changeText(getByTestId("input-rp-Exercise 1-0-0"), "RP1");
            fireEvent.changeText(getByTestId("input-ds-reps-Exercise 1-0-0"), "5");
            fireEvent.changeText(getByTestId("input-ds-peso-Exercise 1-0-0"), "30");
            fireEvent.changeText(getByTestId("input-partials-reps-Exercise 1-0"), "3");
        });

        expect(getByTestId("input-rp-Exercise 1-0-0").props.value).toBe("RP1");
        expect(getByTestId("input-ds-reps-Exercise 1-0-0").props.value).toBe("5");
        expect(getByTestId("input-ds-peso-Exercise 1-0-0").props.value).toBe("30");
        expect(getByTestId("input-partials-reps-Exercise 1-0").props.value).toBe("3");
    });

    test("should navigate to previous exercise", async () => {
        const { getByText, getByTestId } = renderWithProviders(<TrainingSessionScreen />);

        await waitFor(() => {
            expect(getByText("Training Day 1")).toBeTruthy();
        });

        fireEvent.press(getByTestId("button-next"));

        await waitFor(() => {
            expect(getByText("Exercise 2")).toBeTruthy();
        });

        fireEvent.press(getByTestId("button-previous"));

        await waitFor(() => {
            expect(getByText("Exercise 1")).toBeTruthy();
        });
    });

    test("should save the session with RP, DS, Partials, and RIR", async () => {
        const { getByTestId } = renderWithProviders(<TrainingSessionScreen />);
        // RP, DS, and Partials loaded on mockStorageService.load

        await waitFor(() => {
            fireEvent.changeText(getByTestId("input-reps-Exercise 1-0"), "12");
            fireEvent.changeText(getByTestId("input-weight-Exercise 1-0"), "55");
            fireEvent.changeText(getByTestId("input-rir-Exercise 1-0"), "3");
            fireEvent.press(getByTestId("button-next"));
        });

        await waitFor(() => {
            fireEvent.changeText(getByTestId("input-reps-Exercise 2-0"), "14");
            fireEvent.changeText(getByTestId("input-weight-Exercise 2-0"), "65");
            fireEvent.changeText(getByTestId("input-rir-Exercise 2-0"), "4");
            fireEvent.press(getByTestId("button-finish"));
        });

        await waitFor(() => {
            expect(StorageService.save).toHaveBeenCalledWith("routineDays", expect.arrayContaining([
                expect.objectContaining({
                    name: dayNames[currentDayIndex],
                    trainingDayName: "Training Day 1",
                    exerciseDetails: expect.arrayContaining([
                        expect.objectContaining({
                            name: "Exercise 1",
                            sets: expect.arrayContaining([
                                expect.objectContaining({ reps: "10", weight: "50", rir: "2" }),
                            ]),
                            performedSets: expect.arrayContaining([
                                expect.objectContaining({
                                    reps: "12",
                                    weight: "55",
                                    rir: "3",
                                    rp: expect.arrayContaining([{ value: "RP1", time: 5 }]),
                                    ds: expect.arrayContaining([{ reps: "5", peso: "30" }]),
                                    partials: { reps: "3" },
                                }),
                            ]),
                        }),
                        expect.objectContaining({
                            name: "Exercise 2",
                            sets: expect.arrayContaining([
                                expect.objectContaining({ reps: "12", weight: "60", rir: "3" }),
                            ]),
                            performedSets: expect.arrayContaining([
                                expect.objectContaining({
                                    reps: "14",
                                    weight: "65",
                                    rir: "4",
                                }),
                            ]),
                        }),
                    ]),
                    completed: true,
                }),
            ]));
            expect(StorageService.save).toHaveBeenCalledWith("history", expect.arrayContaining([
                expect.objectContaining({
                    date: new Date().toLocaleDateString(),
                    exerciseDetails: expect.arrayContaining([
                        expect.objectContaining({
                            name: "Exercise 1",
                            performedSets: expect.arrayContaining([
                                expect.objectContaining({
                                    reps: "12",
                                    weight: "55",
                                    rir: "3",
                                    rp: expect.arrayContaining([{ value: "RP1", time: 5 }]),
                                    ds: expect.arrayContaining([{ reps: "5", peso: "30" }]),
                                    partials: { reps: "3" },
                                }),
                            ]),
                        }),
                        expect.objectContaining({
                            name: "Exercise 2",
                            performedSets: expect.arrayContaining([
                                expect.objectContaining({
                                    reps: "14",
                                    weight: "65",
                                    rir: "4",
                                }),
                            ]),
                        }),
                    ]),
                }),
            ]));
            expect(mockRouter.push).toHaveBeenCalledWith("/(tabs)/rutina");
        });
    });
});
