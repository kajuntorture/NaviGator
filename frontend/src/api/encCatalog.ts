import Constants from "expo-constants";

export interface EncCell {
  name: string;
  lname: string;
  cscale: number;
  states: string[];
  bbox: number[]; // [minLat, minLon, maxLat, maxLon]
  zip_url: string;
  status: string;
}

const backendUrl =
  // EXPO_BACKEND_URL is configured in .env and available via expo-constants
  (Constants.expoConfig?.extra as any)?.EXPO_BACKEND_URL || "";

export const fetchEncCatalog = async (): Promise<EncCell[]> => {
  if (!backendUrl) return [];
  const res = await fetch(`${backendUrl}/api/enc/catalog`);
  if (!res.ok) {
    throw new Error("Failed to load ENC catalog");
  }
  return res.json();
};
