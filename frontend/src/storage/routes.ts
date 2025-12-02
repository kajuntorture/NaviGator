import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Route {
  id: string;
  name: string;
  waypointIds: string[];
  createdAt: number;
}

const ROUTES_KEY = "marine_nav_routes_v1";

export const loadRoutes = async (): Promise<Route[]> => {
  const raw = await AsyncStorage.getItem(ROUTES_KEY);
  if (!raw) return [];
  try {
    const parsed: Route[] = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.error("Failed to parse routes from storage", e);
    return [];
  }
};

export const saveRoute = async (route: Route): Promise<void> => {
  const existing = await loadRoutes();
  existing.push(route);
  await AsyncStorage.setItem(ROUTES_KEY, JSON.stringify(existing));
};

export const deleteRoute = async (id: string): Promise<void> => {
  const existing = await loadRoutes();
  const filtered = existing.filter((r) => r.id !== id);
  await AsyncStorage.setItem(ROUTES_KEY, JSON.stringify(filtered));
};
