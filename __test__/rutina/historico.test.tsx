/* Tests:
* - should display the correct title and history entries
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
                            sets: [{ reps: "10", weight: "50" }],
                            performedReps: ["12"],
                            performedWeights: ["55"],
                        },
                        {
                            name: "Exercise 2",
                            sets: [{ reps: "12", weight: "60" }],
                            performedReps: ["14"],
                            performedWeights: ["65"],
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

    test("should display the correct title and history entries", async () => {
        render(<HistoricoScreen />);

        await waitFor(() => {
            expect(screen.getByTestId("historico-title")).toHaveTextContent(`Histórico de ${dayName} ${date}`);
            expect(screen.getByTestId("historico-exercise-Exercise 1")).toBeTruthy();
            expect(screen.getByTestId("historico-set-planned-Exercise 1-0")).toHaveTextContent("Set 1: 10 reps, 50kg");
            expect(screen.getByTestId("historico-set-performed-Exercise 1-0")).toHaveTextContent("Set 1: 12 reps, 55 kg");

            expect(screen.getByTestId("historico-exercise-Exercise 2")).toBeTruthy();
            expect(screen.getByTestId("historico-set-planned-Exercise 2-0")).toHaveTextContent("Set 1: 12 reps, 60kg");
            expect(screen.getByTestId("historico-set-performed-Exercise 2-0")).toHaveTextContent("Set 1: 14 reps, 65 kg");
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
