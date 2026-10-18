import { bearingDeg, haversineM } from "./geo.ts";
import { DIRECTIONS, LANDMARKS, ROUTES, STOPS } from "./metro-network.ts";
import type { Direction } from "./types.ts";

export { DIRECTIONS, LANDMARKS, ROUTES, STOPS };
export const PATH_FACTOR = 1.15;

const STOP_BY_ID = new Map(STOPS.map((stop) => [stop.id, stop]));
const ROUTE_BY_ID = new Map(ROUTES.map((route) => [route.id, route]));
const DIRECTION_BY_ID = new Map(DIRECTIONS.map((direction) => [direction.id, direction]));

export function stopById(id: string) {
  return STOP_BY_ID.get(id);
}

export function routeById(id: string) {
  return ROUTE_BY_ID.get(id);
}

export function directionById(id: string) {
  return DIRECTION_BY_ID.get(id);
}

const prefixCache = new Map<string, number[]>();

export function prefixMeters(direction: Direction): number[] {
  const cached = prefixCache.get(direction.id);
  if (cached) return cached;
  const prefix = [0];
  for (let i = 1; i < direction.stopIds.length; i += 1) {
    const a = stopById(direction.stopIds[i - 1] ?? "");
    const b = stopById(direction.stopIds[i] ?? "");
    const segment = a && b ? haversineM(a, b) * PATH_FACTOR : 0;
    prefix.push((prefix[i - 1] ?? 0) + segment);
  }
  prefixCache.set(direction.id, prefix);
  return prefix;
}

export function alongM(direction: Direction, from: number, to: number): number {
  const prefix = prefixMeters(direction);
  return (prefix[to] ?? 0) - (prefix[from] ?? 0);
}

export function pointAlong(direction: Direction, distM: number): {
  lat: number;
  lng: number;
  bearing: number;
  nextStopId: string;
} {
  const prefix = prefixMeters(direction);
  const total = prefix[prefix.length - 1] ?? 0;
  const distance = Math.max(0, Math.min(total, distM));
  let index = 1;
  while (index < prefix.length - 1 && (prefix[index] ?? 0) < distance) index += 1;
  const a = stopById(direction.stopIds[index - 1] ?? "");
  const b = stopById(direction.stopIds[index] ?? "");
  const fallback = direction.stopIds[0] ?? "";
  if (!a || !b) {
    return { lat: 0, lng: 0, bearing: 0, nextStopId: fallback };
  }
  const span = (prefix[index] ?? 0) - (prefix[index - 1] ?? 0) || 1;
  const t = Math.min(1, Math.max(0, (distance - (prefix[index - 1] ?? 0)) / span));
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
    bearing: bearingDeg(a, b),
    nextStopId: b.id,
  };
}

export function routeLines(): { routeId: string; color: string; coordinates: [number, number][] }[] {
  return ROUTES.flatMap((route) => {
    const direction = directionById(route.directionIds[0] ?? "");
    if (!direction) return [];
    const coordinates = direction.stopIds.flatMap((id) => {
      const stop = stopById(id);
      return stop ? [[stop.lng, stop.lat] as [number, number]] : [];
    });
    return [{ routeId: route.id, color: direction.color, coordinates }];
  });
}
