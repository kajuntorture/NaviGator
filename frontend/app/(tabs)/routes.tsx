import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RoutesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Routes & Waypoints</Text>
      <View style={styles.placeholderBox}>
        <Text style={styles.placeholderText}>
          You will be able to create and manage waypoints and routes here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#02050a",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f5f7f2",
    marginBottom: 12,
  },
  placeholderBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#a7b89a",
    fontSize: 14,
    textAlign: "center",
  },
});
