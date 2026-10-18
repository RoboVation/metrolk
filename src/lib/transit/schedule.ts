import { colomboDayStart } from "./geo.ts";
import { alongM } from "./network.ts";
import type { Direction } from "./types.ts";

function departureMinutes(direction: Direction): number[] {
  if (direction.departuresMin) return direction.departuresMin;
  const minutes: number[] = [];
  if (direction.headwayMin <= 0) return minutes;
  for (let minute = direction.firstMin; minute <= direction.lastMin; minute += direction.headwayMin) {
    minutes.push(minute);
  }
  return minutes;
}

function offsetMs(direction: Direction, index: number): number {
  const published = direction.offsetsMin?.[index];
  if (published != null) return published * 60_000;
  const speed = (direction.speedKmh * 1000) / 3600;
  if (speed <= 0) return 0;
  return (alongM(direction, 0, index) / speed) * 1000;
}

export function nextBoard(
  direction: Direction,
  stopId: string,
  readyAt: number,
): { boardAt: number; terminalDepart: number } | null {
  const index = direction.stopIds.indexOf(stopId);
  if (index < 0) return null;
  const offset = offsetMs(direction, index);
  const dayStart = colomboDayStart(readyAt);
  for (const minute of departureMinutes(direction)) {
    const terminalDepart = dayStart + minute * 60_000;
    const boardAt = terminalDepart + offset;
    if (boardAt + 500 >= readyAt) return { boardAt, terminalDepart };
  }
  return null;
}

export function activeTrips(
  direction: Direction,
  now: number,
): { terminalDepart: number; progressM: number }[] {
  const last = direction.stopIds.length - 1;
  const total = alongM(direction, 0, last);
  const runtimeMs = offsetMs(direction, last);
  if (runtimeMs <= 0) return [];
  const dayStart = colomboDayStart(now);
  const trips: { terminalDepart: number; progressM: number }[] = [];
  for (const minute of departureMinutes(direction)) {
    const terminalDepart = dayStart + minute * 60_000;
    const elapsed = now - terminalDepart;
    if (elapsed < 0 || elapsed > runtimeMs) continue;
    const fraction = elapsed / runtimeMs;
    trips.push({ terminalDepart, progressM: total * fraction });
  }
  return trips;
}
