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
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { saveTrack, TrackPoint, Track } from "../../src/storage/tracks";

interface LiveLocationState {
  coordsText: string;
  speedKnots: number | null;
  heading: number | null;
  latitude: number;
  longitude: number;
}

export default function LiveScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const [locationState, setLocationState] = useState<LiveLocationState | null>(
    null
  );
  const [trackPoints, setTrackPoints] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  const [locationSubscription, setLocationSubscription] =
    useState<Location.LocationSubscription | null>(null);

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

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTracking = async () => {
    if (!hasPermission) {
      await requestPermissions();
      if (!hasPermission) return;
    }

    setTracking(true);
    setError(null);

    setTrackPoints([]);

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      (loc) => {
        const { latitude, longitude, speed, heading } = loc.coords;
        const knots = typeof speed === "number" && speed >= 0
          ? speed * 1.94384
          : null;

        setLocationState({
          coordsText: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          speedKnots: knots,
          heading: typeof heading === "number" && heading >= 0 ? heading : null,
          latitude,
          longitude,
        });

        setTrackPoints((prev) => [
          ...prev,
          { latitude, longitude },
        ]);
      }
    );

    setLocationSubscription(subscription);
  };

  const stopTracking = () => {
    setTracking(false);
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
  };

  const renderContent = () => {
    if (requesting || hasPermission === null) {
      return <ActivityIndicator color="#0f9d58" size="large" />;
    }

    if (!hasPermission) {
      return (
        <View style={styles.centeredBox}>
          <Text style={styles.errorText}>{error ?? "Location not available."}</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermissions}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const initialRegion: Region = {
      latitude: locationState?.latitude ?? 29.5, // Louisiana approx center
      longitude: locationState?.longitude ?? -91.5,
      latitudeDelta: 2.5,
      longitudeDelta: 2.5,
    };

    const coordinates = trackPoints.length
      ? trackPoints
      : locationState
      ? [{ latitude: locationState.latitude, longitude: locationState.longitude }]
      : [];

    return (
      <View style={styles.content}>
        <View style={styles.mapContainer}>
          <MapView
            style={StyleSheet.absoluteFill}
            initialRegion={initialRegion}
            showsUserLocation
            showsCompass
            showsMyLocationButton
            mapType="standard"
          >
            {coordinates.length > 0 && (
              <Marker
                coordinate={coordinates[0]}
                title="Current position"
              />
            )}
            {coordinates.length > 0 && (
              <Polyline
                coordinates={coordinates}
                strokeColor="#0f9d58"
                strokeWidth={3}
              />
            )}
          </MapView>
        </View>
        <View style={styles.instrumentPanel}>
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
          {Platform.OS === "android" && (
            <Text style={styles.helperText}>
              For best accuracy, keep GPS on and stay with a clear view of the
              sky.
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Navigation</Text>
        <Text style={styles.headerSubtitle}>Louisiana waters - GPS instruments</Text>
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
  },
  mapContainer: {
    flex: 2,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  instrumentPanel: {
    flex: 1,
    paddingTop: 12,
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
