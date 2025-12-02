import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { loadTrackById, Track } from "../../src/storage/tracks";

export default function TrackDetailWebScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const t = await loadTrackById(id as string);
      setTrack(t);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#0f9d58" size="large" />
      </SafeAreaView>
    );
  }

  if (!track) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Track not found.</Text>
      </SafeAreaView>
    );
  }

  const started = new Date(track.startedAt);
  const ended = new Date(track.endedAt);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{track.name}</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Distance</Text>
        <Text style={styles.value}>{(track.distanceMeters / 1852).toFixed(1)} NM</Text>
        <Text style={styles.label}>Start</Text>
        <Text style={styles.value}>{started.toLocaleString()}</Text>
        <Text style={styles.label}>End</Text>
        <Text style={styles.value}>{ended.toLocaleString()}</Text>
        <Text style={styles.label}>Avg speed</Text>
        <Text style={styles.value}>
          {track.avgSpeedKnots != null ? `${track.avgSpeedKnots.toFixed(1)} kn` : "--"}
        </Text>
        <Text style={styles.label}>Max speed</Text>
        <Text style={styles.value}>
          {track.maxSpeedKnots != null ? `${track.maxSpeedKnots.toFixed(1)} kn` : "--"}
        </Text>
      </View>
      <Text style={styles.note}>
        Map preview is available on the mobile app. Web view shows summary only.
      </Text>
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
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#10151f",
  },
  label: {
    fontSize: 12,
    color: "#9aa0a6",
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: "#e8eaed",
  },
  errorText: {
    fontSize: 16,
    color: "#ff6d6d",
    textAlign: "center",
    marginTop: 40,
  },
  note: {
    marginTop: 16,
    fontSize: 12,
    color: "#9aa0a6",
  },
});
