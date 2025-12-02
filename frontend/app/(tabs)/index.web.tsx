import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";

type LiveLocationState = {
  coordsText: string;
  speedKnots: number | null;
  heading: number | null;
};

export default function LiveWebScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const [locationState, setLocationState] = useState<LiveLocationState | null>(
    null
  );

  const requestPermissions = async () => {
    setRequesting(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermission(false);
        setError("Location permission is required for live tracking.");
        return;
      }

      setHasPermission(true);
    } catch (e) {
      console.error(e);
      setError("Failed to request location permissions.");
      setHasPermission(false);
    } finally {
      setRequesting(false);
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  const startTracking = async () => {
    if (!hasPermission) {
      await requestPermissions();
      if (!hasPermission) return;
    }

    setTracking(true);
    setError(null);

    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 20,
      },
      (loc) => {
        const { latitude, longitude, speed, heading } = loc.coords;
        const knots =
          typeof speed === "number" && speed >= 0 ? speed * 1.94384 : null;

        setLocationState({
          coordsText: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          speedKnots: knots,
          heading:
            typeof heading === "number" && heading >= 0 ? heading : null,
        });
      }
    );
  };

  const stopTracking = () => {
    setTracking(false);
  };

  const renderContent = () => {
    if (requesting || hasPermission === null) {
      return <ActivityIndicator color="#0f9d58" size="large" />;
    }

    if (!hasPermission) {
      return (
        <View style={styles.centeredBox}>
          <Text style={styles.errorText}>
            {error ?? "Location not available in this browser."}
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermissions}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Speed</Text>
            <Text style={styles.statValue}>
              {locationState?.speedKnots != null
                ? `${locationState.speedKnots.toFixed(1)} kn`
                : "--"}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Heading</Text>
            <Text style={styles.statValue}>
              {locationState?.heading != null
                ? `${Math.round(locationState.heading)}°`
                : "--"}
            </Text>
          </View>
        </View>
        <View style={styles.coordsBox}>
          <Text style={styles.coordsLabel}>Position (lat, lon)</Text>
          <Text style={styles.coordsValue}>
            {locationState?.coordsText ?? "Waiting for GPS fix..."}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.button, tracking ? styles.buttonStop : styles.buttonStart]}
          onPress={tracking ? stopTracking : startTracking}
        >
          <Text style={styles.buttonText}>
            {tracking ? "Stop Tracking" : "Start Tracking"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.helperText}>
          Full chart and navigation experience is available in the mobile app
          (Expo Go / native build). Web view shows instruments only.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Navigation (Web)</Text>
        <Text style={styles.headerSubtitle}>
          Use mobile app on the water for full map-based navigation.
        </Text>
      </View>
      {error && hasPermission && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#02050a",
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#ffffff",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#9aa0a6",
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
  },
  centeredBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginRight: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#10151f",
  },
  statLabel: {
    fontSize: 12,
    color: "#9aa0a6",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#e8eaed",
  },
  coordsBox: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#10151f",
  },
  coordsLabel: {
    fontSize: 12,
    color: "#9aa0a6",
    marginBottom: 4,
  },
  coordsValue: {
    fontSize: 16,
    color: "#e8eaed",
  },
  button: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonStart: {
    backgroundColor: "#0f9d58",
  },
  buttonStop: {
    backgroundColor: "#d93025",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#ff6d6d",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  errorBanner: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#3c4043",
    marginBottom: 8,
  },
  errorBannerText: {
    color: "#ffbcbc",
    fontSize: 12,
  },
  helperText: {
    marginTop: 12,
    fontSize: 12,
    color: "#9aa0a6",
    textAlign: "center",
  },
});
