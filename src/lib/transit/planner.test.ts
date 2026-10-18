import assert from "node:assert/strict";
import test from "node:test";
import { estimateFare } from "./fares.ts";
import { DIRECTIONS, ROUTES, STOPS, stopById } from "./network.ts";
import { planJourneys } from "./planner.ts";
import { priceRide } from "./price.ts";

const morning = Date.parse("2026-07-06T08:30:00+05:30");
const late = Date.parse("2026-07-06T23:50:00+05:30");

function place(id: string) {
  const stop = stopById(id);
  assert.ok(stop, id);
  return { lat: stop.lat, lng: stop.lng, stopId: stop.id };
}

test("metro graph only references known stops and routes", () => {
  const stopIds = new Set(STOPS.map((stop) => stop.id));
  const directionIds = new Set(DIRECTIONS.map((direction) => direction.id));
  for (const direction of DIRECTIONS) {
    assert.ok(stopIds.has(direction.stopIds[0] ?? ""));
    for (const id of direction.stopIds) assert.ok(stopIds.has(id), id);
    assert.ok(direction.stopIds.length >= 2);
    assert.equal(direction.offsetsMin?.length, direction.stopIds.length);
    assert.ok((direction.departuresMin?.length ?? 0) > 0);
  }
  for (const route of ROUTES) {
    for (const id of route.directionIds) assert.ok(directionIds.has(id), id);
  }
});

test("Makumbura to Fort uses CM02 and the published LKR 250 fare", () => {
  const journeys = planJourneys({
    origin: place("makumbura"),
    destination: place("colombo-fort"),
    departAt: morning,
    sort: "fastest",
  });
  assert.ok(journeys.length > 0);
  const ride = journeys
    .flatMap((journey) => journey.legs)
    .find((leg) => leg.kind === "ride" && leg.routeId === "cm02" && leg.alight.id === "colombo-fort");
  assert.ok(ride && ride.kind === "ride");
  assert.equal(ride.fare.amountLkr, 250);
  assert.equal(ride.fare.confidence, "high");
  assert.equal(ride.fare.modelId, "metrobus-lk");
  assert.equal(priceRide("cm02", "makumbura", "colombo-fort")?.amountLkr, 250);
  for (const journey of journeys) {
    assert.equal(journey.freshness, "published-timetable");
    for (const leg of journey.legs) {
      if (leg.kind !== "ride") continue;
      assert.equal(leg.dataSource, "metrobus");
      assert.ok(leg.departAt >= morning - 1000);
      assert.equal(priceRide(leg.routeId, leg.board.id, leg.alight.id)?.amountLkr, leg.fare.amountLkr);
    }
  }
});

test("Kadawatha to Pettah needs a transfer between CM01 and CM02", () => {
  const journeys = planJourneys({
    origin: place("kadawatha"),
    destination: place("pettah"),
    departAt: morning,
    sort: "transfers",
  });
  const rides = journeys.filter((journey) => journey.legs.some((leg) => leg.kind === "ride"));
  assert.ok(rides.length > 0);
  assert.ok(rides.every((journey) => journey.transfers >= 1));
});

test("fare sort is non-decreasing", () => {
  const journeys = planJourneys({
    origin: place("makumbura"),
    destination: place("town-hall"),
    departAt: morning,
    sort: "fare",
  });
  assert.ok(journeys.length > 0);
  for (let i = 1; i < journeys.length; i += 1) {
    assert.ok((journeys[i]?.fare.amountLkr ?? 0) >= (journeys[i - 1]?.fare.amountLkr ?? 0));
  }
  assert.ok(estimateFare(10, "bus").amountLkr > estimateFare(1, "bus").amountLkr);
});

test("after the last published departure there is no ride", () => {
  const journeys = planJourneys({
    origin: place("makumbura"),
    destination: place("colombo-fort"),
    departAt: late,
    sort: "fastest",
  });
  assert.ok(journeys.every((journey) => journey.legs.every((leg) => leg.kind !== "ride")));
});

test("an inactive corridor is not offered", () => {
  const journeys = planJourneys({
    origin: place("makumbura"),
    destination: place("colombo-fort"),
    departAt: morning,
    sort: "fastest",
    inactiveRouteIds: ["cm02"],
  });
  assert.ok(
    journeys.every((journey) =>
      journey.legs.every((leg) => leg.kind !== "ride" || leg.routeId !== "cm02"),
    ),
  );
});
