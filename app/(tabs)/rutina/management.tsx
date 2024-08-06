// app/(tabs)/rutina/management.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import StorageService, { StorageKey } from "@/services/storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import Collapsible from "react-native-collapsible";

const StorageManagementScreen = () => {
  const [items, setItems] = useState<any>([]);
  const [activeSections, setActiveSections] = useState<any>([]);
  const router = useRouter();

  const loadItems = async () => {
    const allItems = await StorageService.getAllItems();
    setItems(allItems);
  };

  const removeItem = async (key: StorageKey) => {
    await StorageService.remove(key);
    loadItems(); // Reload items after removal
  };

  useFocusEffect(
    React.useCallback(() => {
      loadItems();
    }, [])
  );

  const toggleSection = (key: string) => {
    setActiveSections((prevState: any) =>
      prevState.includes(key)
        ? prevState.filter((section: string) => section !== key)
        : [...prevState, key]
    );
  };

  const formatValue = (value: any) => {
    let stringValue = JSON.stringify(value, null, 2);
    const imagePattern = /"image":\s*"([^"]*)"/g;
    stringValue = stringValue.replace(imagePattern, (match, p1) => {
      const truncatedImage =
        p1.substring(0, 10) + (p1.length > 10 ? "..." : "");
      return `"image": "${truncatedImage}"`;
    });
    return stringValue;
  };

  const renderItem = ({ item }: { item: any }) => {
    const isActive = activeSections.includes(item.key);
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => toggleSection(item.key)}>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: 10,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Text style={styles.itemKey}>{item.key}</Text>
              <TouchableOpacity onPress={() => removeItem(item.key)}>
                <Ionicons name="trash" size={24} color="red" />
              </TouchableOpacity>
            </View>
            <Ionicons
              name={isActive ? "chevron-up" : "chevron-down"}
              size={24}
              color="white"
            />
          </View>
        </TouchableOpacity>
        <Collapsible collapsed={!isActive}>
          <Text style={styles.itemValue}>{formatValue(item.value)}</Text>
        </Collapsible>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage Management</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
      />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121623",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    marginTop: 25,
    marginLeft: 60,
  },
  itemContainer: {
    backgroundColor: "#1F2940",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemKey: {
    color: "white",
    fontWeight: "bold",
    fontSize: 25,
  },
  itemValue: {
    color: "white",
    marginLeft: 10,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#2979FF",
    padding: 10,
    borderRadius: 20,
  },
});

export default StorageManagementScreen;
