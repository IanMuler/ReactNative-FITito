// components/__tests__/Menu.test.tsx
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Menu, { MenuItem } from "../Menu";
import { PortalProvider } from "@gorhom/portal";
import { Text } from "react-native";

describe("Menu", () => {
    const triggerText = "Show Menu";
    const menuItemText = "Option 1";
    const menuItemTestID = "menu-option-1";

    const renderMenu = () => {
        const onPressItem = jest.fn();
        return render(
            <PortalProvider>
                <Menu
                    trigger={
                        <Text testID="menu-trigger">{triggerText}</Text>
                    }
                >
                    <MenuItem text={menuItemText} onPress={onPressItem} testID={menuItemTestID} />
                </Menu>
            </PortalProvider>
        );
    };

    it("renders trigger correctly", () => {
        const { getByTestId } = renderMenu();
        const trigger = getByTestId("menu-trigger");
        expect(trigger).toBeTruthy();
        expect(trigger.props.children).toBe(triggerText);
    });

    it("opens the menu on trigger press", async () => {
        const { getByTestId, queryByTestId } = renderMenu();
        const trigger = getByTestId("menu-trigger");

        expect(queryByTestId(menuItemTestID)).toBeNull();

        fireEvent.press(trigger);

        await waitFor(() => {
            expect(getByTestId(menuItemTestID)).toBeTruthy();
        });
    });

    it("closes the menu on outside press", async () => {
        const { queryByTestId, getByTestId } = renderMenu();
        const trigger = getByTestId("menu-trigger");

        fireEvent.press(trigger);

        await waitFor(() => {
            expect(getByTestId(menuItemTestID)).toBeTruthy();
        });

        // Press outside the menu to close it
        fireEvent.press(getByTestId("outside-area"));

        await waitFor(() => {
            expect(queryByTestId(menuItemTestID)).toBeNull();
        });
    });

    it("calls onPress function when menu item is pressed", async () => {
        const onPressItem = jest.fn();
        const { getByTestId } = render(
            <PortalProvider>
                <Menu
                    trigger={<Text testID="menu-trigger">{triggerText}</Text>}
                >
                    <MenuItem text={menuItemText} onPress={onPressItem} testID={menuItemTestID} />
                </Menu>
            </PortalProvider>
        );

        const trigger = getByTestId("menu-trigger");
        fireEvent.press(trigger);

        await waitFor(() => {
            const menuItem = getByTestId(menuItemTestID);
            fireEvent.press(menuItem);
            expect(onPressItem).toHaveBeenCalled();
        });
    });
});
