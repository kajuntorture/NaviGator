import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Polyline, Marker, Region } from "react-native-maps";
import { loadTrackById, Track } from "../../src/storage/tracks";

export default function TrackDetailScreen() {
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

  if (!track || track.points.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Track not found.</Text>
      </SafeAreaView>
    );
  }

  const first = track.points[0];
  const last = track.points[track.points.length - 1];

  const region: Region = {
    latitude: first.latitude,
    longitude: first.longitude,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  };

  const durationSeconds = Math.max(
    1,
    Math.round((track.endedAt - track.startedAt) / 1000)
  );

  const formatTime = (ms: number) => {
    const totalSeconds = Math.round(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(" ");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{track.name}</Text>
      <View style={styles.mapContainer}>
        <MapView style={StyleSheet.absoluteFill} initialRegion={region}>
          <Polyline
            coordinates={track.points.map((p) => ({
              latitude: p.latitude,
              longitude: p.longitude,
            }))}
            strokeColor="#0f9d58"
            strokeWidth={3}
          />
          <Marker coordinate={{ latitude: first.latitude, longitude: first.longitude }} title="Start" />
          <Marker coordinate={{ latitude: last.latitude, longitude: last.longitude }} title="End" />
        </MapView>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>
            {(track.distanceMeters / 1852).toFixed(1)} NM
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>{formatTime(track.endedAt - track.startedAt)}</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg speed</Text>
          <Text style={styles.statValue}>
            {track.avgSpeedKnots != null ? `${track.avgSpeedKnots.toFixed(1)} kn` : "--"}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Max speed</Text>
          <Text style={styles.statValue}>
            {track.maxSpeedKnots != null ? `${track.maxSpeedKnots.toFixed(1)} kn` : "--"}
          </Text>
        </View>
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
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 12,
  },
  mapContainer: {
    height: 260,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#10151f",
  },
  statLabel: {
    fontSize: 12,
    color: "#9aa0a6",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e8eaed",
  },
  errorText: {
    fontSize: 16,
    color: "#ff6d6d",
    textAlign: "center",
    marginTop: 40,
  },
});
