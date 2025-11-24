import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TracksScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tracks</Text>
      <View style={styles.placeholderBox}>
        <Text style={styles.placeholderText}>
          Saved tracks will appear here after you finish a recording.
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
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 12,
  },
  placeholderBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#9aa0a6",
    fontSize: 14,
    textAlign: "center",
  },
});
