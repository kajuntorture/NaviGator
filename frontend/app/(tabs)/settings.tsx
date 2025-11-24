import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings & Charts</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offline charts</Text>
        <Text style={styles.sectionText}>
          Download free base maps for Louisiana so you can keep navigating even
          when you lose signal.
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Download Louisiana base map</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tracking</Text>
        <Text style={styles.sectionText}>
          Background tracking will be added so you can keep recording tracks
          with the screen off.
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
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e8eaed",
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    color: "#9aa0a6",
    marginBottom: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "#0f9d58",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
