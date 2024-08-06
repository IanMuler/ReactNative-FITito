/* Testing:
 * - Renders correctly with default styles
 * - Applies activeContainer style when isActive is true
 * - Applies restDayContainer style when day is a rest day
 * - Renders children correctly within LinearGradientItem
 */

import React from "react";
import { render } from "@testing-library/react-native";
import LinearGradientItem from "../LinearGradientItem";
import { Text } from "react-native";

jest.mock("expo-linear-gradient", () => {
  return {
    LinearGradient: jest.fn().mockImplementation(({ children, ...props }) => {
      return <div {...props}>{children}</div>;
    }),
  };
});

describe("LinearGradientItem", () => {
  const styles = {
    dayContainer: { padding: 10 },
    activeContainer: { borderColor: "red", borderWidth: 1 },
    restDayContainer: { backgroundColor: "gray" },
  };

  const day = {
    name: "Monday",
    rest: true,
  };

  it("renders correctly with default styles", () => {
    const { getByText } = render(
      <LinearGradientItem styles={styles}>
        <Text>Test Child</Text>
      </LinearGradientItem>
    );

    expect(getByText("Test Child")).toBeTruthy();
  });

  it("applies activeContainer style when isActive is true", () => {
    const { getByTestId } = render(
      <LinearGradientItem styles={styles} isActive>
        <Text>Test Child</Text>
      </LinearGradientItem>
    );

    const linearGradientElement = getByTestId("linear-gradient-item");
    expect(linearGradientElement.props.style).toContainEqual(
      styles.activeContainer
    );
  });

  it("applies restDayContainer style when day is a rest day", () => {
    const { getByTestId } = render(
      <LinearGradientItem styles={styles} day={day}>
        <Text>Test Child</Text>
      </LinearGradientItem>
    );

    const linearGradientElement = getByTestId("linear-gradient-item");
    expect(linearGradientElement.props.style).toContainEqual(
      styles.restDayContainer
    );
  });

  it("renders children correctly within LinearGradientItem", () => {
    const { getByText } = render(
      <LinearGradientItem styles={styles}>
        <Text>Test Child</Text>
      </LinearGradientItem>
    );

    expect(getByText("Test Child")).toBeTruthy();
  });
});
