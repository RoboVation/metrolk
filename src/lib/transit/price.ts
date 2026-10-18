import { METRO_FARES } from "./metro-network.ts";
import type { FareEstimate } from "./fares.ts";
import { DIRECTIONS, routeById } from "./network.ts";

const LISTED: FareEstimate = {
  amountLkr: 0,
  currency: "LKR",
  confidence: "high",
  modelId: "metrobus-lk",
  sourceLabel: "Fare listed on metrobus.lk",
};

const UNLISTED: FareEstimate = {
  amountLkr: 0,
  currency: "LKR",
  confidence: "low",
  modelId: "metrobus-unlisted",
  sourceLabel: "No fare listed on metrobus.lk for this pair",
};

/** Server and client must price a boarding the same way. */
export function priceRide(routeId: string, boardId: string, alightId: string): FareEstimate | null {
  const route = routeById(routeId);
  if (!route) return null;
  const direction = DIRECTIONS.find((item) => {
    if (item.routeId !== routeId) return false;
    const from = item.stopIds.indexOf(boardId);
    const to = item.stopIds.indexOf(alightId);
    return from >= 0 && to > from;
  });
  if (!direction) return null;
  const amount = METRO_FARES[`${boardId}|${alightId}`];
  if (amount == null) return { ...UNLISTED };
  return { ...LISTED, amountLkr: amount };
}
