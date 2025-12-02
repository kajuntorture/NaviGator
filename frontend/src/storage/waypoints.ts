import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Waypoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: number; // ms since epoch
}

const WAYPOINTS_KEY = "marine_nav_waypoints_v1";

export const loadWaypoints = async (): Promise<Waypoint[]> => {
  const raw = await AsyncStorage.getItem(WAYPOINTS_KEY);
  if (!raw) return [];
  try {
    const parsed: Waypoint[] = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.error("Failed to parse waypoints from storage", e);
    return [];
  }
};

export const saveWaypoint = async (wp: Waypoint): Promise<void> => {
  const existing = await loadWaypoints();
  existing.push(wp);
  await AsyncStorage.setItem(WAYPOINTS_KEY, JSON.stringify(existing));
};

export const deleteWaypoint = async (id: string): Promise<void> => {
  const existing = await loadWaypoints();
  const filtered = existing.filter((w) => w.id !== id);
  await AsyncStorage.setItem(WAYPOINTS_KEY, JSON.stringify(filtered));
};
