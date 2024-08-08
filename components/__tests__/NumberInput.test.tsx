// components/__tests__/NumberInput.test.tsx

import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import NumberInput from "../NumberInput";

describe("NumberInput", () => {
  it("renders correctly with default value", () => {
    const { toJSON } = render(
      <NumberInput value="10" onChangeText={jest.fn()} testID="number-input" />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("increments the value", () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <NumberInput value="10" onChangeText={onChangeText} testID="number-input" />
    );

    const incrementButton = getByTestId("increment-button");
    fireEvent.press(incrementButton);
    expect(onChangeText).toHaveBeenCalledWith("11");
  });

  it("decrements the value", () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <NumberInput value="10" onChangeText={onChangeText} testID="number-input" />
    );

    const decrementButton = getByTestId("decrement-button");
    fireEvent.press(decrementButton);
    expect(onChangeText).toHaveBeenCalledWith("9");
  });

  it("changes the value through text input", () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <NumberInput value="10" onChangeText={onChangeText} testID="number-input" />
    );

    const input = getByTestId("number-input");
    fireEvent.changeText(input, "15");
    expect(onChangeText).toHaveBeenCalledWith("15");
  });
});
