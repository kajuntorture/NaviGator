import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { loadTracks, TrackSummary, deleteTrack } from "../../src/storage/tracks";

export default function TracksScreen() {
  const [tracks, setTracks] = useState<TrackSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = async () => {
    setLoading(true);
    const data = await loadTracks();
    setTracks(data.sort((a, b) => b.startedAt - a.startedAt));
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = router.addListener("focus", () => {
      refresh();
    });
    refresh();
    return unsubscribe;
  }, []);

  const handleOpen = (id: string) => {
    router.push({ pathname: "/track/[id]", params: { id } });
  };

  const handleDelete = async (id: string) => {
    await deleteTrack(id);
    refresh();
  };

  const renderItem: ListRenderItem<TrackSummary> = ({ item }) => {
    const date = new Date(item.startedAt);
    const label = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    return (
      <TouchableOpacity
        style={styles.trackCard}
        onPress={() => handleOpen(item.id)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.trackTitle}>{item.name}</Text>
          <Text style={styles.trackSubtitle}>{label}</Text>
          <Text style={styles.trackMeta}>
            {(item.distanceMeters / 1852).toFixed(1)} NM •
            {" "}
            {item.avgSpeedKnots != null ? `${item.avgSpeedKnots.toFixed(1)} kn avg` : "--"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tracks</Text>
      {loading ? (
        <View style={styles.placeholderBox}>
          <ActivityIndicator color="#0f9d58" size="large" />
        </View>
      ) : tracks.length === 0 ? (
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            Saved tracks will appear here after you finish a recording.
          </Text>
        </View>
      ) : (
        <FlashList
          data={tracks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={72}
        />
      )}
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
