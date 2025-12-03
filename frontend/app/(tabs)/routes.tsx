import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { loadWaypoints, Waypoint, deleteWaypoint } from "../../src/storage/waypoints";
import { EncCell, fetchEncCatalog } from "../../src/api/encCatalog";

export default function RoutesScreen() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [encCells, setEncCells] = useState<EncCell[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const [wpData, encData] = await Promise.all([
      loadWaypoints(),
      fetchEncCatalog().catch(() => []),
    ]);
    setWaypoints(wpData.sort((a, b) => b.createdAt - a.createdAt));
    setEncCells(encData);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteWaypoint(id);
    refresh();
  };

  const renderItem: ListRenderItem<Waypoint> = ({ item }) => (
    <View style={styles.wpCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.wpName}>{item.name}</Text>
        <Text style={styles.wpCoords}>
          {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
        </Text>
        <Text style={styles.wpTime}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      <TouchableOpacity style={styles.wpDelete} onPress={() => handleDelete(item.id)}>
        <Text style={styles.wpDeleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Routes & Waypoints</Text>
      {loading ? (
        <View style={styles.placeholderBox}>
          <ActivityIndicator color="#0f9d58" size="large" />
        </View>
      ) : waypoints.length === 0 ? (
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            Long-press on the chart on the Live tab to create waypoints.
          </Text>
        </View>
      ) : (
        <FlashList
          data={waypoints}
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
