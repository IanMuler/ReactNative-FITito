import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MenuPopup from '@/components/MenuPopup';

describe('MenuPopup', () => {
    const options = [
        { label: 'Option 1', onPress: jest.fn() },
        { label: 'Option 2', onPress: jest.fn() },
    ];
    const onClose = jest.fn();

    // To avoid the following error:
    // Error: Unable to find node on an unmounted component.
    beforeAll(() => {
        jest.useFakeTimers();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not render when visible is false', () => {
        const { queryByTestId } = render(
            <MenuPopup visible={false} onClose={onClose} options={options} />
        );

        options.forEach(option => {
            expect(queryByTestId(`menu-option-${option.label}`)).toBeNull();
        });
    });

    it('should render and display options when visible is true', async () => {
        const { getByTestId } = render(
            <MenuPopup visible={true} onClose={onClose} options={options} />
        );

        await waitFor(() => {
            options.forEach(option => {
                expect(getByTestId(`menu-option-${option.label}`)).toBeTruthy();
            });
        });
    });

    it('should call onClose and option onPress when an option is pressed', async () => {
        const { getByTestId } = render(
            <MenuPopup visible={true} onClose={onClose} options={options} />
        );

        fireEvent.press(getByTestId('menu-option-Option 1'));

        await waitFor(() => {
            expect(options[0].onPress).toHaveBeenCalled();
            expect(onClose).toHaveBeenCalled();
        });
    });

    it('should call onClose when overlay is pressed', async () => {
        const { getByTestId } = render(
            <MenuPopup visible={true} onClose={onClose} options={options} />
        );

        fireEvent.press(getByTestId('overlay'));

        await waitFor(() => {
            expect(onClose).toHaveBeenCalled();
        });
    });
});
