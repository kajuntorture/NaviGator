import * as FileSystem from "expo-file-system";

const TILE_SERVER = "https://tile.openstreetmap.org"; // free base map tiles

// Simple definition of an offline region (bounding box + zoom levels)
export interface OfflineRegion {
  id: string;
  name: string;
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
  minZoom: number;
  maxZoom: number;
}

// Predefined Louisiana coastal region (rough bounds)
export const LOUISIANA_REGION: OfflineRegion = {
  id: "louisiana-base",
  name: "Louisiana coast",
  minLat: 28.5,
  maxLat: 31.5,
  minLon: -94.0,
  maxLon: -88.5,
  minZoom: 6,
  maxZoom: 10,
};

const TILE_CACHE_DIR = FileSystem.cacheDirectory + "tiles/osm/";

const ensureDirAsync = async (dir: string) => {
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
};

const tilePath = (z: number, x: number, y: number) =>
  `${TILE_CACHE_DIR}${z}/${x}/${y}.png`;

const tileUrl = (z: number, x: number, y: number) =>
  `${TILE_SERVER}/${z}/${x}/${y}.png`;

// Very naive conversion from lat/lon to tile X/Y for Web Mercator
const lon2tile = (lon: number, zoom: number) =>
  Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));

const lat2tile = (lat: number, zoom: number) =>
  Math.floor(
    ((1 -
      Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );

export interface DownloadProgress {
  downloaded: number;
  total: number;
}

export const downloadRegionTiles = async (
  region: OfflineRegion,
  onProgress?: (progress: DownloadProgress) => void
) => {
  await ensureDirAsync(TILE_CACHE_DIR);

  let total = 0;
  let downloaded = 0;

  // First pass: count tiles
  for (let z = region.minZoom; z <= region.maxZoom; z++) {
    const xMin = lon2tile(region.minLon, z);
    const xMax = lon2tile(region.maxLon, z);
    const yMin = lat2tile(region.maxLat, z);
    const yMax = lat2tile(region.minLat, z);

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        total++;
      }
    }
  }

  // Second pass: download
  for (let z = region.minZoom; z <= region.maxZoom; z++) {
    const xMin = lon2tile(region.minLon, z);
    const xMax = lon2tile(region.maxLon, z);
    const yMin = lat2tile(region.maxLat, z);
    const yMax = lat2tile(region.minLat, z);

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        const path = tilePath(z, x, y);
        const info = await FileSystem.getInfoAsync(path);
        if (!info.exists) {
          const dir = `${TILE_CACHE_DIR}${z}/${x}/`;
          await ensureDirAsync(dir);
          await FileSystem.downloadAsync(tileUrl(z, x, y), path);
        }
        downloaded++;
        onProgress?.({ downloaded, total });
      }
    }
  }
};

export const clearTileCache = async () => {
  const info = await FileSystem.getInfoAsync(TILE_CACHE_DIR);
  if (info.exists) {
    await FileSystem.deleteAsync(TILE_CACHE_DIR, { idempotent: true });
  }
};

export const getTileFromCache = async (
  z: number,
  x: number,
  y: number
): Promise<string | null> => {
  const path = tilePath(z, x, y);
  const info = await FileSystem.getInfoAsync(path);
  return info.exists ? path : null;
};
