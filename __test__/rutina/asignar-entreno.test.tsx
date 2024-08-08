// __tests__/asignar-entreno.test.tsx
import React from "react";
import { render, waitFor, fireEvent, screen } from "@testing-library/react-native";
import AssignTrainingDayScreen from "@/app/(tabs)/rutina/asignar-entreno"; // Adjust the path if necessary
import StorageService, { StorageKey } from "@/services/storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import '@testing-library/jest-native/extend-expect'; // Import jest-native matchers

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
        if (key === "trainingDays") {
            return [
                { name: "Training Day 1", exercises: [{ name: "Exercise 1", image: "http://example.com/ex1.png" }] },
                { name: "Training Day 2", exercises: [{ name: "Exercise 2", image: "http://example.com/ex2.png" }] },
            ];
        }
        return null;
    },
};

describe("AssignTrainingDayScreen", () => {

    beforeAll(() => {
        jest.useFakeTimers();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useLocalSearchParams as jest.Mock).mockReturnValue({ dayName: "Lunes" });
        (StorageService.load as jest.Mock).mockImplementation(mockStorageService.load);
    });

    test("should display the title and list of training days", async () => {
        render(<AssignTrainingDayScreen />);

        await waitFor(() => {
            expect(screen.getByTestId("assign-training-day-title")).toHaveTextContent("Asignar entreno a Lunes");
            expect(screen.getByTestId("training-day-Training Day 1")).toBeTruthy();
            expect(screen.getByTestId("training-day-Training Day 2")).toBeTruthy();
        });
    });

    test("should navigate to configure training day screen on training day press", async () => {
        render(<AssignTrainingDayScreen />);

        await waitFor(() => {
            expect(screen.getByTestId("training-day-Training Day 1")).toBeTruthy();
        });

        fireEvent.press(screen.getByTestId("training-day-Training Day 1"));

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith({
                pathname: "/(tabs)/rutina/configurar-entreno",
                params: { dayName: "Lunes", trainingDayName: "Training Day 1" },
            });
        });
    });
});
