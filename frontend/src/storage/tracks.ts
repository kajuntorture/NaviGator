import AsyncStorage from "@react-native-async-storage/async-storage";

export interface TrackPoint {
  latitude: number;
  longitude: number;
  timestamp: number; // ms since epoch
  speedKnots: number | null;
  heading: number | null;
}

export interface TrackSummary {
  id: string;
  name: string;
  startedAt: number;
  endedAt: number;
  distanceMeters: number;
  avgSpeedKnots: number | null;
  maxSpeedKnots: number | null;
}

export interface Track extends TrackSummary {
  points: TrackPoint[];
}

const TRACKS_KEY = "marine_nav_tracks_v1";

export const loadTracks = async (): Promise<TrackSummary[]> => {
  const raw = await AsyncStorage.getItem(TRACKS_KEY);
  if (!raw) return [];
  try {
    const parsed: Track[] = JSON.parse(raw);
    return parsed.map(({ points, ...summary }) => summary);
  } catch (e) {
    console.error("Failed to parse tracks from storage", e);
    return [];
  }
};

export const loadTrackById = async (id: string): Promise<Track | null> => {
  const raw = await AsyncStorage.getItem(TRACKS_KEY);
  if (!raw) return null;
  try {
    const parsed: Track[] = JSON.parse(raw);
    return parsed.find((t) => t.id === id) ?? null;
  } catch (e) {
    console.error("Failed to parse tracks from storage", e);
    return null;
  }
};

export const saveTrack = async (track: Track): Promise<void> => {
  const raw = await AsyncStorage.getItem(TRACKS_KEY);
  let tracks: Track[] = [];
  if (raw) {
    try {
      tracks = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse existing tracks, resetting", e);
      tracks = [];
    }
  }
  tracks.push(track);
  await AsyncStorage.setItem(TRACKS_KEY, JSON.stringify(tracks));
};

export const deleteTrack = async (id: string): Promise<void> => {
  const raw = await AsyncStorage.getItem(TRACKS_KEY);
  if (!raw) return;
  try {
    const parsed: Track[] = JSON.parse(raw);
    const filtered = parsed.filter((t) => t.id !== id);
    await AsyncStorage.setItem(TRACKS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to delete track", e);
  }
};
