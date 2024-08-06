// components/MenuPopup.tsx
import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

type MenuPopupProps = {
    visible: boolean;
    onClose: () => void;
    options: { label: string; onPress: () => void }[];
    renderTowards?: 'top' | 'bottom';
};

const MenuPopup = ({ visible, onClose, options, renderTowards }: MenuPopupProps) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 0.9,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    if (!visible) {
        return null;
    }

    return (
        <TouchableOpacity style={styles.overlay} onPress={onClose}>
            <Animated.View style={[styles.menu, { opacity, transform: [{ scale }], top: renderTowards === 'top' ? 0 : undefined, bottom: renderTowards === 'bottom' ? 0 : undefined }]}>
                {options.map((option, index) => (
                    <TouchableOpacity key={index} style={styles.option} onPress={() => { option.onPress(); onClose(); }} testID={`menu-option-${option.label}`}>
                        <Text style={styles.optionText}>{option.label}</Text>
                    </TouchableOpacity>
                ))}
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        zIndex: 1000, // Ensure overlay is above other components
    },
    menu: {
        position: 'absolute',
        right: 35,
        top: 0,
        width: 200,
        backgroundColor: '#1F2940',
        borderRadius: 10,
        padding: 10,
        zIndex: 1001, // Ensure menu is above other components
    },
    option: {
        padding: 10,
    },
    optionText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});

export default MenuPopup;