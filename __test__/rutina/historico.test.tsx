/* Tests:
* - should display the correct title and history entries with all details (RIR, RP, DS, Partials)
* - should render correctly when no history is available for the given date
*/

// __test__/rutina/historico.test.tsx
import React from "react";
import { render, waitFor, screen } from "@testing-library/react-native";
import HistoricoScreen from "@/app/(tabs)/rutina/historico"; // Adjust the path if necessary
import StorageService from "@/services/storage";
import { useLocalSearchParams } from "expo-router";
import { dayNames } from "@/constants/Dates";

jest.mock("@/services/storage");
jest.mock("expo-router", () => ({
    useLocalSearchParams: jest.fn(),
}));

const date = "06/08/2024";
const splitDate = date.split("/");
const validDate = new Date(+splitDate[2], +splitDate[1] - 1, +splitDate[0]);
const dayName = dayNames[validDate.getDay()];

const mockStorageService = {
    load: async (key: string) => {
        if (key === "history") {
            return [
                {
                    date,
                    exerciseDetails: [
                        {
                            name: "Exercise 1",
                            sets: [
                                {
                                    reps: "10",
                                    weight: "50",
                                    rir: "2",
                                    rp: [{ value: "5", time: 10 }],
                                    ds: [{ reps: "4", peso: "30" }],
                                    partials: { reps: "3" },
                                },
                            ],
                            performedSets: [
                                {
                                    reps: "12",
                                    weight: "55",
                                    rir: "1",
                                    rp: [{ value: "6", time: 12 }],
                                    ds: [{ reps: "5", peso: "35" }],
                                    partials: { reps: "4" },
                                },
                            ],
                        },
                        {
                            name: "Exercise 2",
                            sets: [{ reps: "12", weight: "60", rir: "3" }],
                            performedSets: [{ reps: "14", weight: "65", rir: "2" }],
                        },
                    ],
                },
            ];
        }
        return [];
    },
};

describe("HistoricoScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useLocalSearchParams as jest.Mock).mockReturnValue({ date: "06/08/2024" });
        (StorageService.load as jest.Mock).mockImplementation(mockStorageService.load);
    });

    test("should display the correct title and history entries with all details (RIR, RP, DS, Partials)", async () => {
        render(<HistoricoScreen />);

        await waitFor(() => {
            expect(screen.getByTestId("historico-title")).toHaveTextContent(`Histórico de ${dayName} ${date}`);

            // Verify Exercise 1 planned details
            expect(screen.getByTestId("historico-exercise-Exercise 1")).toBeTruthy();
            expect(screen.getByTestId("historico-set-planned-Exercise 1-0")).toHaveTextContent("Set 1: 10 reps, 50kg, RIR: 2");
            expect(screen.getByTestId("historico-rp-planned-Exercise 1-0")).toHaveTextContent("RP 1: 5 reps, Time: 10\"");
            expect(screen.getByTestId("historico-ds-planned-Exercise 1-0")).toHaveTextContent("DS 1: 4 reps, 30 kg");
            expect(screen.getByTestId("historico-partials-planned-Exercise 1-0")).toHaveTextContent("Partials: 3 reps");

            // Verify Exercise 1 performed details
            expect(screen.getByTestId("historico-set-performed-Exercise 1-0")).toHaveTextContent("Set 1: 12 reps, 55 kg, RIR: 1");
            expect(screen.getByTestId("historico-rp-performed-Exercise 1-0")).toHaveTextContent("RP 1: 6 reps, Time: 12\"");
            expect(screen.getByTestId("historico-ds-performed-Exercise 1-0")).toHaveTextContent("DS 1: 5 reps, 35 kg");
            expect(screen.getByTestId("historico-partials-performed-Exercise 1-0")).toHaveTextContent("Partials: 4 reps");

            // Verify Exercise 2 planned details
            expect(screen.getByTestId("historico-exercise-Exercise 2")).toBeTruthy();
            expect(screen.getByTestId("historico-set-planned-Exercise 2-0")).toHaveTextContent("Set 1: 12 reps, 60kg, RIR: 3");

            // Verify Exercise 2 performed details
            expect(screen.getByTestId("historico-set-performed-Exercise 2-0")).toHaveTextContent("Set 1: 14 reps, 65 kg, RIR: 2");
        });
    });

    test("should render correctly when no history is available for the given date", async () => {
        (StorageService.load as jest.Mock).mockResolvedValueOnce([]);

        render(<HistoricoScreen />);

        await waitFor(() => {
            expect(screen.getByTestId("historico-title")).toHaveTextContent(`Histórico de ${dayName} ${date}`);
            expect(screen.queryByTestId("historico-exercise-Exercise 1")).toBeNull();
            expect(screen.queryByTestId("historico-exercise-Exercise 2")).toBeNull();
        });
    });
});
