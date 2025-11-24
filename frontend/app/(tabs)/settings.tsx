import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LOUISIANA_REGION, downloadRegionTiles, clearTileCache, DownloadProgress } from "../../src/maps/offlineTiles";

export default function SettingsScreen() {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleDownload = async () => {
    if (downloading) return;
    setStatusMessage(null);
    setDownloading(true);
    setProgress(null);
    try {
      await downloadRegionTiles(LOUISIANA_REGION, (p) => {
        setProgress(p);
      });
      setStatusMessage("Louisiana base map downloaded for offline use.");
    } catch (e) {
      console.error(e);
      setStatusMessage("Failed to download tiles. Please try again when online.");
    } finally {
      setDownloading(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearTileCache();
      setStatusMessage("Offline tile cache cleared.");
      setProgress(null);
    } catch (e) {
      console.error(e);
      setStatusMessage("Failed to clear cache.");
    }
  };

  const progressText =
    progress && progress.total > 0
      ? `${Math.round((progress.downloaded / progress.total) * 100)}% ("
        + `${progress.downloaded}/${progress.total} tiles)`
      : null;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings & Charts</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offline charts</Text>
        <Text style={styles.sectionText}>
          Download free base maps for Louisiana so you can keep navigating even
          when you lose signal.
        </Text>
        <TouchableOpacity
          style={[styles.button, downloading && styles.buttonDisabled]}
          onPress={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <ActivityIndicator color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Downloading tiles…</Text>
            </>
          ) : (
            <Text style={styles.buttonText}>Download Louisiana base map</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleClear}>
          <Text style={styles.buttonText}>Clear offline cache</Text>
        </TouchableOpacity>
        {progressText && (
          <Text style={styles.statusText}>Progress: {progressText}</Text>
        )}
        {statusMessage && <Text style={styles.statusText}>{statusMessage}</Text>}
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
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    backgroundColor: "#3c4043",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  statusText: {
    marginTop: 4,
    fontSize: 12,
    color: "#9aa0a6",
  },
});
