/* Testing:
 * - Renders correctly with default value
 * - Increments the value
 * - Decrements the value
 * - Changes the value through text input
 */

import React from "react";
import renderer, { act } from "react-test-renderer";
import { fireEvent, render } from "@testing-library/react-native";
import NumberInput from "../NumberInput";

describe("NumberInput", () => {
  it("renders correctly with default value", () => {
    const tree = renderer
      .create(<NumberInput value="10" onChangeText={jest.fn()} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("increments the value", () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <NumberInput value="10" onChangeText={onChangeText} />
    );

    const incrementButton = getByTestId("increment-button");
    fireEvent.press(incrementButton);
    expect(onChangeText).toHaveBeenCalledWith("11");
  });

  it("decrements the value", () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <NumberInput value="10" onChangeText={onChangeText} />
    );

    const decrementButton = getByTestId("decrement-button");
    fireEvent.press(decrementButton);
    expect(onChangeText).toHaveBeenCalledWith("9");
  });

  it("changes the value through text input", () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <NumberInput value="10" onChangeText={onChangeText} />
    );

    const input = getByTestId("number-input");
    fireEvent.changeText(input, "15");
    expect(onChangeText).toHaveBeenCalledWith("15");
  });
});
