import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { a as alongM, c as estimateFare, f as stopById, o as authMiddleware, t as DIRECTIONS, u as routeById } from "./network-D4kOm18P.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-CSPfQGsH.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function confirmSandbox(ticket, key, nowIso) {
	if (key !== ticket.idempotencyKey) return {
		ticket,
		outcome: "rejected"
	};
	if (ticket.status === "paid" || ticket.status === "redeemed") return {
		ticket,
		outcome: "replay"
	};
	if (ticket.status !== "pending_payment") return {
		ticket,
		outcome: "rejected"
	};
	return {
		outcome: "paid",
		ticket: {
			...ticket,
			status: "paid",
			paidAt: nowIso,
			providerRef: `sandbox:${ticket.id}`
		}
	};
}
function failSandbox(ticket) {
	if (ticket.status === "failed") return {
		ticket,
		outcome: "replay"
	};
	if (ticket.status !== "pending_payment") return {
		ticket,
		outcome: "rejected"
	};
	return {
		outcome: "failed",
		ticket: {
			...ticket,
			status: "failed"
		}
	};
}
function refundTicket(ticket, nowIso) {
	if (ticket.status === "refunded") return {
		ticket,
		outcome: "replay"
	};
	if (ticket.status !== "paid") return {
		ticket,
		outcome: "rejected"
	};
	return {
		outcome: "refunded",
		ticket: {
			...ticket,
			status: "refunded",
			refundedAt: nowIso
		}
	};
}
function validateTicket(ticket) {
	if (!ticket) return {
		valid: false,
		reason: "missing"
	};
	if (ticket.status === "paid") return {
		valid: true,
		reason: "paid"
	};
	if (ticket.status === "redeemed") return {
		valid: false,
		reason: "already_redeemed"
	};
	if (ticket.status === "pending_payment") return {
		valid: false,
		reason: "unpaid"
	};
	if (ticket.status === "refunded") return {
		valid: false,
		reason: "refunded"
	};
	return {
		valid: false,
		reason: "failed"
	};
}
/** Server and client must price a boarding the same way. Headway does not affect fare. */
function priceRide(routeId, boardId, alightId) {
	const route = routeById(routeId);
	if (!route) return null;
	const direction = DIRECTIONS.find((item) => {
		if (item.routeId !== routeId) return false;
		const from = item.stopIds.indexOf(boardId);
		const to = item.stopIds.indexOf(alightId);
		return from >= 0 && to > from;
	});
	if (!direction) return null;
	const from = direction.stopIds.indexOf(boardId);
	const to = direction.stopIds.indexOf(alightId);
	return estimateFare(alongM(direction, from, to) / 1e3, route.mode);
}
var hits = /* @__PURE__ */ new Map();
function limited(key, max, windowMs) {
	const now = Date.now();
	const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < windowMs);
	if (recent.length >= max) {
		hits.set(key, recent);
		return true;
	}
	recent.push(now);
	hits.set(key, recent);
	return false;
}
async function sqlClient() {
	const { getSql } = await import("./db-DxqDQJID.mjs").then((n) => n.t).then((n) => n.t);
	return getSql();
}
async function sha256(value) {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
	return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function clean(value, max) {
	if (typeof value !== "string") throw new Error("Invalid text");
	const text = value.replace(/[\u0000-\u001F]/g, "").trim();
	if (!text || text.length > max) throw new Error("Invalid text");
	return text;
}
function optionalClean(value, max) {
	if (typeof value !== "string") return "";
	return value.replace(/[\u0000-\u001F]/g, "").trim().slice(0, max);
}
function localText(value) {
	if (!value || typeof value !== "object") throw new Error("Invalid name");
	const record = value;
	const en = clean(record.en, 80);
	return {
		en,
		si: optionalClean(record.si, 80) || en,
		ta: optionalClean(record.ta, 80) || en
	};
}
function stamp(value) {
	if (!value) return null;
	if (value instanceof Date) return value.toISOString();
	const text = String(value);
	return text === "null" ? null : text;
}
function viewTicket(row) {
	let summary = {
		board: {
			en: "",
			si: "",
			ta: ""
		},
		alight: {
			en: "",
			si: "",
			ta: ""
		},
		routes: [],
		transfers: 0
	};
	try {
		summary = JSON.parse(row.summary_json);
	} catch {
		summary = summary;
	}
	return {
		id: row.id,
		status: row.status,
		amountLkr: Number(row.amount_lkr),
		fareModel: row.fare_model,
		provider: row.provider,
		summary,
		createdAt: stamp(row.created_at) ?? "",
		paidAt: stamp(row.paid_at),
		redeemedAt: stamp(row.redeemed_at),
		refundedAt: stamp(row.refunded_at)
	};
}
function recordOf(row) {
	return {
		id: row.id,
		status: row.status,
		amountLkr: Number(row.amount_lkr),
		idempotencyKey: row.idempotency_key,
		paidAt: stamp(row.paid_at),
		redeemedAt: stamp(row.redeemed_at),
		refundedAt: stamp(row.refunded_at),
		provider: "sandbox",
		providerRef: row.provider_ref
	};
}
async function audit(sql, actorId, action, detail) {
	await sql`insert into audit_log (id, actor_id, action, detail) values (${crypto.randomUUID()}, ${actorId}, ${action}, ${detail})`;
}
async function requireStaff(sql, userId) {
	return (await sql`select role from staff_roles where user_id = ${userId} limit 1`)[0]?.role === "operator";
}
var listAlerts_createServerFn_handler = createServerRpc({
	id: "e00c0f5ef46dc115af4a4941845b9845e071c98aec31ecff2c457f619a5221d4",
	name: "listAlerts",
	filename: "src/lib/api.ts"
}, (opts) => listAlerts.__executeServer(opts));
var listAlerts = createServerFn({ method: "GET" }).handler(listAlerts_createServerFn_handler, async () => {
	return (await (await sqlClient())`select id, severity, route_id, title_en, title_si, title_ta, body_en, body_si, body_ta
     from service_alerts where active = true order by created_at desc limit 20`).map((row) => ({
		id: row.id,
		severity: row.severity,
		routeId: row.route_id,
		title: {
			en: row.title_en,
			si: row.title_si,
			ta: row.title_ta
		},
		body: {
			en: row.body_en,
			si: row.body_si,
			ta: row.body_ta
		}
	}));
});
var listOverrides_createServerFn_handler = createServerRpc({
	id: "2dc8e37bcb5ac4cc99b7e27b14408ed0f7468d9caf613901420dc9d53a4c9614",
	name: "listOverrides",
	filename: "src/lib/api.ts"
}, (opts) => listOverrides.__executeServer(opts));
var listOverrides = createServerFn({ method: "GET" }).handler(listOverrides_createServerFn_handler, async () => {
	return (await (await sqlClient())`select route_id, headway_min, active, note from route_overrides`).map((row) => ({
		routeId: row.route_id,
		headwayMin: row.headway_min == null ? null : Number(row.headway_min),
		active: Boolean(row.active),
		note: row.note
	}));
});
var reportCount_createServerFn_handler = createServerRpc({
	id: "cfdbb799fc80869005f288db56bf4ea46e940f4c107857b8ff1da2369c4f9834",
	name: "reportCount",
	filename: "src/lib/api.ts"
}, (opts) => reportCount.__executeServer(opts));
var reportCount = createServerFn({ method: "GET" }).validator((input) => {
	const stopId = clean(input?.stopId, 40);
	if (!stopById(stopId)) throw new Error("Invalid stop");
	return { stopId };
}).handler(reportCount_createServerFn_handler, async ({ data }) => {
	const sql = await sqlClient();
	const cutoff = (/* @__PURE__ */ new Date(Date.now() - 216e5)).toISOString();
	const rows = await sql`select count(*)::int as n from arrival_reports
      where stop_id = ${data.stopId} and status = 'unverified' and created_at > ${cutoff}`;
	return { unverified: Number(rows[0]?.n ?? 0) };
});
var getShare_createServerFn_handler = createServerRpc({
	id: "43e05c687078689007568b002a95578b46851a8748833a56b475ede050d4410e",
	name: "getShare",
	filename: "src/lib/api.ts"
}, (opts) => getShare.__executeServer(opts));
var getShare = createServerFn({ method: "GET" }).validator((input) => ({ id: clean(input?.id, 80) })).handler(getShare_createServerFn_handler, async ({ data }) => {
	const row = (await (await sqlClient())`
      select journey_json, expires_at from trip_shares where id = ${data.id} limit 1`)[0];
	if (!row) return {
		ok: false,
		error: "missing"
	};
	const expires = stamp(row.expires_at);
	if (!expires || new Date(expires).getTime() < Date.now()) return {
		ok: false,
		error: "expired"
	};
	return {
		ok: true,
		journeyJson: row.journey_json,
		expiresAt: expires
	};
});
var myAccess_createServerFn_handler = createServerRpc({
	id: "0060eb073c32a9a853bb2187141e82fafd6e0720e3bf4aec84c0929342274b8c",
	name: "myAccess",
	filename: "src/lib/api.ts"
}, (opts) => myAccess.__executeServer(opts));
var myAccess = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(myAccess_createServerFn_handler, async ({ context }) => {
	const sql = await sqlClient();
	const role = await sql`select role from staff_roles where user_id = ${context.userId} limit 1`;
	const count = await sql`select count(*)::int as n from staff_roles`;
	return {
		role: role[0]?.role === "operator" ? "operator" : "passenger",
		operatorCount: Number(count[0]?.n ?? 0)
	};
});
var listTickets_createServerFn_handler = createServerRpc({
	id: "0eecd7b100619c350ac0360f2a295b721eb95db0861b002d18f56d509274b6eb",
	name: "listTickets",
	filename: "src/lib/api.ts"
}, (opts) => listTickets.__executeServer(opts));
var listTickets = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listTickets_createServerFn_handler, async ({ context }) => {
	return (await (await sqlClient())`select id, status, amount_lkr, fare_model, summary_json, idempotency_key, provider, provider_ref, paid_at, redeemed_at, refunded_at, created_at
      from tickets where user_id = ${context.userId} order by created_at desc limit 30`).map(viewTicket);
});
var getTicket_createServerFn_handler = createServerRpc({
	id: "0cf2c3255c44d4c505ebd403b06976e215cc1d4ddc1d2166b3530bf46fba3c82",
	name: "getTicket",
	filename: "src/lib/api.ts"
}, (opts) => getTicket.__executeServer(opts));
var getTicket = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => ({ id: clean(input?.id, 80) })).handler(getTicket_createServerFn_handler, async ({ context, data }) => {
	const row = (await (await sqlClient())`select id, status, amount_lkr, fare_model, summary_json, idempotency_key, provider, provider_ref, paid_at, redeemed_at, refunded_at, created_at
      from tickets where id = ${data.id} and user_id = ${context.userId} limit 1`)[0];
	if (!row) return {
		ok: false,
		error: "missing"
	};
	return {
		ok: true,
		ticket: viewTicket(row),
		validation: validateTicket(recordOf(row))
	};
});
var createTicket_createServerFn_handler = createServerRpc({
	id: "b3796644d766f66ff4b39e5856e0646ab4bbb814e7918d261cf49c4a82aafab9",
	name: "createTicket",
	filename: "src/lib/api.ts"
}, (opts) => createTicket.__executeServer(opts));
var createTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input;
	const idempotencyKey = clean(body.idempotencyKey, 80);
	if (!/^[A-Za-z0-9-]{8,80}$/.test(idempotencyKey)) throw new Error("Invalid key");
	const summaryRaw = body.summary;
	const summary = {
		board: localText(summaryRaw?.board),
		alight: localText(summaryRaw?.alight),
		routes: Array.isArray(summaryRaw?.routes) ? summaryRaw.routes.slice(0, 4).map((item) => {
			const route = item;
			const mode = route.mode === "rail" ? "rail" : "bus";
			return {
				id: clean(route.id, 40),
				code: clean(route.code, 20),
				mode,
				name: localText(route.name)
			};
		}) : [],
		transfers: Number.isFinite(Number(summaryRaw?.transfers)) ? Math.max(0, Math.min(3, Number(summaryRaw.transfers))) : 0
	};
	if (!Array.isArray(body.rides) || body.rides.length < 1 || body.rides.length > 4) throw new Error("Invalid rides");
	return {
		idempotencyKey,
		summary,
		rides: body.rides.map((item) => {
			const ride = item;
			return {
				routeId: clean(ride.routeId, 40),
				boardId: clean(ride.boardId, 40),
				alightId: clean(ride.alightId, 40)
			};
		})
	};
}).handler(createTicket_createServerFn_handler, async ({ context, data }) => {
	if (limited(`ticket:${context.userId}`, 8, 6e4)) return {
		ok: false,
		error: "rate"
	};
	let amount = 0;
	const models = /* @__PURE__ */ new Set();
	for (const ride of data.rides) {
		const fare = priceRide(ride.routeId, ride.boardId, ride.alightId);
		if (!fare) return {
			ok: false,
			error: "invalid_ride"
		};
		amount += fare.amountLkr;
		models.add(fare.modelId);
	}
	const fareModel = models.size === 1 ? [...models][0] ?? "mixed" : "mixed";
	const sql = await sqlClient();
	await sql`insert into tickets (id, user_id, status, summary_json, rides_json, amount_lkr, fare_model, idempotency_key)
      values (${crypto.randomUUID()}, ${context.userId}, 'pending_payment', ${JSON.stringify(data.summary)}, ${JSON.stringify(data.rides)}, ${amount}, ${fareModel}, ${data.idempotencyKey})
      on conflict (user_id, idempotency_key) do nothing`;
	const row = (await sql`select id, status, amount_lkr, fare_model, summary_json, idempotency_key, provider, provider_ref, paid_at, redeemed_at, refunded_at, created_at
      from tickets where user_id = ${context.userId} and idempotency_key = ${data.idempotencyKey} limit 1`)[0];
	if (!row) return {
		ok: false,
		error: "failed"
	};
	return {
		ok: true,
		ticket: viewTicket(row)
	};
});
async function loadOwn(sql, userId, id) {
	return (await sql`select id, status, amount_lkr, fare_model, summary_json, idempotency_key, provider, provider_ref, paid_at, redeemed_at, refunded_at, created_at
    from tickets where id = ${id} and user_id = ${userId} limit 1`)[0] ?? null;
}
var confirmTicket_createServerFn_handler = createServerRpc({
	id: "45740ae3bf12ee46c6939835fe5b640a3423809b45aae4a95589de7b41f8d514",
	name: "confirmTicket",
	filename: "src/lib/api.ts"
}, (opts) => confirmTicket.__executeServer(opts));
var confirmTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input;
	return {
		id: clean(body.id, 80),
		idempotencyKey: clean(body.idempotencyKey, 80)
	};
}).handler(confirmTicket_createServerFn_handler, async ({ context, data }) => {
	const sql = await sqlClient();
	const row = await loadOwn(sql, context.userId, data.id);
	if (!row) return {
		ok: false,
		error: "missing"
	};
	const next = confirmSandbox(recordOf(row), data.idempotencyKey, (/* @__PURE__ */ new Date()).toISOString());
	if (next.outcome === "rejected") return {
		ok: false,
		error: "rejected",
		ticket: viewTicket(row)
	};
	if (next.outcome === "paid") await sql`update tickets set status = 'paid', paid_at = ${next.ticket.paidAt}, provider_ref = ${next.ticket.providerRef}
        where id = ${row.id} and user_id = ${context.userId} and status = 'pending_payment'`;
	const fresh = await loadOwn(sql, context.userId, data.id);
	if (!fresh) return {
		ok: false,
		error: "missing"
	};
	return {
		ok: true,
		outcome: next.outcome,
		ticket: viewTicket(fresh)
	};
});
var failTicket_createServerFn_handler = createServerRpc({
	id: "ddee17b1610aaa39ba67842382b622a2d5009cb1e5b47f123b1272f7bd11548e",
	name: "failTicket",
	filename: "src/lib/api.ts"
}, (opts) => failTicket.__executeServer(opts));
var failTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ id: clean(input?.id, 80) })).handler(failTicket_createServerFn_handler, async ({ context, data }) => {
	const sql = await sqlClient();
	const row = await loadOwn(sql, context.userId, data.id);
	if (!row) return {
		ok: false,
		error: "missing"
	};
	const next = failSandbox(recordOf(row));
	if (next.outcome === "failed") await sql`update tickets set status = 'failed' where id = ${row.id} and user_id = ${context.userId} and status = 'pending_payment'`;
	const fresh = await loadOwn(sql, context.userId, data.id);
	return fresh ? {
		ok: true,
		outcome: next.outcome,
		ticket: viewTicket(fresh)
	} : {
		ok: false,
		error: "missing"
	};
});
var refundOwnTicket_createServerFn_handler = createServerRpc({
	id: "b0894a28e64a47765718868d9a2aa9067b0fa730ab8f2b28b4353a6435540b6a",
	name: "refundOwnTicket",
	filename: "src/lib/api.ts"
}, (opts) => refundOwnTicket.__executeServer(opts));
var refundOwnTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ id: clean(input?.id, 80) })).handler(refundOwnTicket_createServerFn_handler, async ({ context, data }) => {
	const sql = await sqlClient();
	const row = await loadOwn(sql, context.userId, data.id);
	if (!row) return {
		ok: false,
		error: "missing"
	};
	const next = refundTicket(recordOf(row), (/* @__PURE__ */ new Date()).toISOString());
	if (next.outcome === "refunded") await sql`update tickets set status = 'refunded', refunded_at = ${next.ticket.refundedAt}
        where id = ${row.id} and user_id = ${context.userId} and status = 'paid'`;
	const fresh = await loadOwn(sql, context.userId, data.id);
	return fresh ? {
		ok: true,
		outcome: next.outcome,
		ticket: viewTicket(fresh)
	} : {
		ok: false,
		error: "missing"
	};
});
var createShare_createServerFn_handler = createServerRpc({
	id: "56b45a61e8d8f39eb191dbf9a9dc94ffc015ebe740093955e85d1826ea3be090",
	name: "createShare",
	filename: "src/lib/api.ts"
}, (opts) => createShare.__executeServer(opts));
var createShare = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input;
	if (body.consent !== true) throw new Error("consent");
	return { journeyJson: clean(body.journeyJson, 4e4) };
}).handler(createShare_createServerFn_handler, async ({ context, data }) => {
	if (limited(`share:${context.userId}`, 10, 6e4)) return {
		ok: false,
		error: "rate"
	};
	const sql = await sqlClient();
	const id = crypto.randomUUID();
	const expires = new Date(Date.now() + 216e5).toISOString();
	await sql`insert into trip_shares (id, user_id, journey_json, expires_at) values (${id}, ${context.userId}, ${data.journeyJson}, ${expires})`;
	return {
		ok: true,
		id,
		expiresAt: expires
	};
});
var saveJourney_createServerFn_handler = createServerRpc({
	id: "178802da39cd6f50599b03e207bb3adddbe7e0a8755ad85eb843f2264d58e95a",
	name: "saveJourney",
	filename: "src/lib/api.ts"
}, (opts) => saveJourney.__executeServer(opts));
var saveJourney = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input;
	return {
		id: clean(body.id, 120),
		title: clean(body.title, 120),
		journeyJson: clean(body.journeyJson, 4e4)
	};
}).handler(saveJourney_createServerFn_handler, async ({ context, data }) => {
	await (await sqlClient())`insert into saved_journeys (id, user_id, title, journey_json) values (${data.id}, ${context.userId}, ${data.title}, ${data.journeyJson})
      on conflict (id) do nothing`;
	return { ok: true };
});
var listSavedJourneys_createServerFn_handler = createServerRpc({
	id: "0a98752fc6c3854d59e0976c7a7e9a75d2deefd2c5c269cb19fe771cbf423967",
	name: "listSavedJourneys",
	filename: "src/lib/api.ts"
}, (opts) => listSavedJourneys.__executeServer(opts));
var listSavedJourneys = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listSavedJourneys_createServerFn_handler, async ({ context }) => {
	return (await sqlClient())`
      select id, title, created_at from saved_journeys where user_id = ${context.userId} order by created_at desc limit 20`;
});
var sendFeedback_createServerFn_handler = createServerRpc({
	id: "11271ef04ffbaee37b801979b99c8c958770184785b70ae4889743daebae7900",
	name: "sendFeedback",
	filename: "src/lib/api.ts"
}, (opts) => sendFeedback.__executeServer(opts));
var sendFeedback = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input;
	const kind = clean(body.kind, 20);
	if (![
		"stop",
		"route",
		"vehicle",
		"other"
	].includes(kind)) throw new Error("Invalid kind");
	return {
		kind,
		message: clean(body.message, 1e3),
		refId: optionalClean(body.refId, 80) || null
	};
}).handler(sendFeedback_createServerFn_handler, async ({ context, data }) => {
	if (limited(`feedback:${context.userId}`, 6, 6e4)) return {
		ok: false,
		error: "rate"
	};
	await (await sqlClient())`insert into feedback (id, user_id, kind, message, ref_id) values (${crypto.randomUUID()}, ${context.userId}, ${data.kind}, ${data.message}, ${data.refId})`;
	return { ok: true };
});
var sendArrivalReport_createServerFn_handler = createServerRpc({
	id: "97bad96834876238c0b3e5d3b6ec0ce0e9662d748f8f43740e6596a77253d438",
	name: "sendArrivalReport",
	filename: "src/lib/api.ts"
}, (opts) => sendArrivalReport.__executeServer(opts));
var sendArrivalReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input;
	const stopId = clean(body.stopId, 40);
	const routeId = clean(body.routeId, 40);
	if (!stopById(stopId) || !routeById(routeId)) throw new Error("Invalid report");
	return {
		stopId,
		routeId,
		note: optionalClean(body.note, 200) || null
	};
}).handler(sendArrivalReport_createServerFn_handler, async ({ context, data }) => {
	if (limited(`report:${context.userId}`, 6, 6e4)) return {
		ok: false,
		error: "rate"
	};
	await (await sqlClient())`insert into arrival_reports (id, user_id, stop_id, route_id, note) values (${crypto.randomUUID()}, ${context.userId}, ${data.stopId}, ${data.routeId}, ${data.note})`;
	return { ok: true };
});
var deleteAccountData_createServerFn_handler = createServerRpc({
	id: "02589cce29faf3ed2998bf17086f3cf3c1967561ddf3cc886d668c403f6b9bf1",
	name: "deleteAccountData",
	filename: "src/lib/api.ts"
}, (opts) => deleteAccountData.__executeServer(opts));
var deleteAccountData = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(deleteAccountData_createServerFn_handler, async ({ context }) => {
	const sql = await sqlClient();
	const anon = `deleted:${(await sha256(context.userId)).slice(0, 16)}`;
	await sql`delete from saved_places where user_id = ${context.userId}`;
	await sql`delete from saved_journeys where user_id = ${context.userId}`;
	await sql`delete from feedback where user_id = ${context.userId}`;
	await sql`delete from arrival_reports where user_id = ${context.userId}`;
	await sql`delete from trip_shares where user_id = ${context.userId}`;
	await sql`update tickets set user_id = ${anon} where user_id = ${context.userId}`;
	await sql`delete from staff_roles where user_id = ${context.userId}`;
	await sql`delete from profiles where user_id = ${context.userId}`;
	await audit(sql, anon, "account_deleted", "app data unlinked");
	return { ok: true };
});
var claimOperator_createServerFn_handler = createServerRpc({
	id: "978501eab64c58a93be6624b89d99897c4d00081ae0cd758e78dbb3951cb609d",
	name: "claimOperator",
	filename: "src/lib/api.ts"
}, (opts) => claimOperator.__executeServer(opts));
var claimOperator = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(claimOperator_createServerFn_handler, async ({ context }) => {
	const sql = await sqlClient();
	if (!(await sql`
      insert into staff_roles (user_id, role)
      select ${context.userId}, 'operator'
      where not exists (select 1 from staff_roles)
      returning user_id`)[0]) return {
		ok: false,
		error: "already_claimed"
	};
	await audit(sql, context.userId, "claim_operator", "first operator");
	return { ok: true };
});
var createInvite_createServerFn_handler = createServerRpc({
	id: "350968466da8c989738892166afb6cabccabb155490fdd63879f75eee9ae3921",
	name: "createInvite",
	filename: "src/lib/api.ts"
}, (opts) => createInvite.__executeServer(opts));
var createInvite = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createInvite_createServerFn_handler, async ({ context }) => {
	const sql = await sqlClient();
	if (!await requireStaff(sql, context.userId)) return {
		ok: false,
		error: "forbidden"
	};
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	const code = [...crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(8))].map((byte) => alphabet[byte % 32]).join("");
	await sql`insert into operator_invites (code_hash, created_by) values (${await sha256(code)}, ${context.userId})`;
	await audit(sql, context.userId, "create_invite", "operator invite issued");
	return {
		ok: true,
		code
	};
});
var acceptInvite_createServerFn_handler = createServerRpc({
	id: "0aab10432852c35e156962e1f5695567e50542d59062d4ab9269817b00a5d304",
	name: "acceptInvite",
	filename: "src/lib/api.ts"
}, (opts) => acceptInvite.__executeServer(opts));
var acceptInvite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ code: clean(input?.code, 16).toUpperCase() })).handler(acceptInvite_createServerFn_handler, async ({ context, data }) => {
	const sql = await sqlClient();
	const hash = await sha256(data.code);
	if (!(await sql`select code_hash from operator_invites where code_hash = ${hash} and used_by is null limit 1`)[0]) return {
		ok: false,
		error: "bad_invite"
	};
	await sql`update operator_invites set used_by = ${context.userId}, used_at = now() where code_hash = ${hash} and used_by is null`;
	await sql`insert into staff_roles (user_id, role) values (${context.userId}, 'operator')
      on conflict (user_id) do update set role = 'operator'`;
	await audit(sql, context.userId, "accept_invite", "invite redeemed");
	return { ok: true };
});
var staffOverview_createServerFn_handler = createServerRpc({
	id: "fb52f7be3944c2ee4a0fe81f25f4b03584274d3e3c01d933cc1315727b6b28f5",
	name: "staffOverview",
	filename: "src/lib/api.ts"
}, (opts) => staffOverview.__executeServer(opts));
var staffOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(staffOverview_createServerFn_handler, async ({ context }) => {
	const sql = await sqlClient();
	if (!await requireStaff(sql, context.userId)) return {
		ok: false,
		error: "forbidden"
	};
	const tickets = await sql`
      select status, count(*)::int as n, coalesce(sum(amount_lkr), 0)::int as amount from tickets group by status`;
	const feedback = await sql`select count(*)::int as n from feedback`;
	const reports = await sql`select count(*)::int as n from arrival_reports where status = 'unverified'`;
	const alerts = await sql`select id, severity, route_id, active, title_en, body_en from service_alerts order by created_at desc limit 20`;
	const inbox = await sql`
      select id, kind, message, ref_id, created_at from feedback order by created_at desc limit 30`;
	const reportRows = await sql`
      select id, stop_id, route_id, note, status, created_at from arrival_reports order by created_at desc limit 30`;
	const auditRows = await sql`
      select id, action, detail, created_at from audit_log order by created_at desc limit 30`;
	const overrides = await sql`
      select route_id, headway_min, active, note from route_overrides`;
	return {
		ok: true,
		tickets: tickets.map((row) => ({
			status: row.status,
			n: Number(row.n),
			amount: Number(row.amount)
		})),
		feedbackCount: Number(feedback[0]?.n ?? 0),
		unverifiedReports: Number(reports[0]?.n ?? 0),
		alerts,
		inbox: inbox.map((row) => ({
			...row,
			createdAt: stamp(row.created_at)
		})),
		reports: reportRows.map((row) => ({
			...row,
			createdAt: stamp(row.created_at)
		})),
		audit: auditRows.map((row) => ({
			...row,
			createdAt: stamp(row.created_at)
		})),
		overrides
	};
});
var inspectTicket_createServerFn_handler = createServerRpc({
	id: "859c1422ac4aee6c8d51becf843215bb20b0191878cfc943c5c4081642f556a3",
	name: "inspectTicket",
	filename: "src/lib/api.ts"
}, (opts) => inspectTicket.__executeServer(opts));
var inspectTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = clean(input?.id, 80);
	return { id: clean(raw.startsWith("gaman:ticket:") ? raw.slice(13) : raw, 80) };
}).handler(inspectTicket_createServerFn_handler, async ({ context, data }) => {
	const sql = await sqlClient();
	if (!await requireStaff(sql, context.userId)) return {
		ok: false,
		error: "forbidden"
	};
	const row = (await sql`select id, status, amount_lkr, fare_model, summary_json, idempotency_key, provider, provider_ref, paid_at, redeemed_at, refunded_at, created_at
      from tickets where id = ${data.id} limit 1`)[0];
	if (!row) return {
		ok: false,
		error: "missing"
	};
	return {
		ok: true,
		ticket: viewTicket(row),
		validation: validateTicket(recordOf(row))
	};
});
var redeemStaffTicket_createServerFn_handler = createServerRpc({
	id: "6438a2d97008275ffd897f7f94f7944f8c48d95cb043db10467337fcd030bb16",
	name: "redeemStaffTicket",
	filename: "src/lib/api.ts"
}, (opts) => redeemStaffTicket.__executeServer(opts));
var redeemStaffTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ id: clean(input?.id, 80) })).handler(redeemStaffTicket_createServerFn_handler, async ({ context, data }) => {
	const sql = await sqlClient();
	if (!await requireStaff(sql, context.userId)) return {
		ok: false,
		error: "forbidden"
	};
	if ((await sql`update tickets set status = 'redeemed', redeemed_at = now()
      where id = ${data.id} and status = 'paid' returning id`)[0]) {
		await audit(sql, context.userId, "redeem_ticket", data.id);
		return {
			ok: true,
			outcome: "redeemed"
		};
	}
	const rows = await sql`select status from tickets where id = ${data.id} limit 1`;
	if (!rows[0]) return {
		ok: false,
		error: "missing"
	};
	if (rows[0].status === "redeemed") return {
		ok: false,
		error: "already_redeemed"
	};
	return {
		ok: false,
		error: "not_payable"
	};
});
var saveOverride_createServerFn_handler = createServerRpc({
	id: "da5ee129d0e90c3b656b4d4869f44e655960a9fb28de235311345f199585aee9",
	name: "saveOverride",
	filename: "src/lib/api.ts"
}, (opts) => saveOverride.__executeServer(opts));
var saveOverride = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input;
	const routeId = clean(body.routeId, 40);
	if (!routeById(routeId)) throw new Error("Invalid route");
	const headway = Number(body.headwayMin);
	return {
		routeId,
		headwayMin: Number.isFinite(headway) ? Math.max(2, Math.min(120, Math.round(headway))) : null,
		active: body.active !== false,
		note: optionalClean(body.note, 280) || null
	};
}).handler(saveOverride_createServerFn_handler, async ({ context, data }) => {
	const sql = await sqlClient();
	if (!await requireStaff(sql, context.userId)) return {
		ok: false,
		error: "forbidden"
	};
	await sql`insert into route_overrides (route_id, headway_min, active, note, updated_by)
      values (${data.routeId}, ${data.headwayMin}, ${data.active}, ${data.note}, ${context.userId})
      on conflict (route_id) do update set headway_min = excluded.headway_min, active = excluded.active, note = excluded.note, updated_by = excluded.updated_by, updated_at = now()`;
	await audit(sql, context.userId, "save_override", data.routeId);
	return { ok: true };
});
var postAlert_createServerFn_handler = createServerRpc({
	id: "c560bab6af757ee818403612183a9a1688890824bdd62bf3da786d0a977cdc9a",
	name: "postAlert",
	filename: "src/lib/api.ts"
}, (opts) => postAlert.__executeServer(opts));
var postAlert = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input;
	const titleEn = clean(body.titleEn, 120);
	const bodyEn = clean(body.bodyEn, 600);
	const routeId = optionalClean(body.routeId, 40);
	if (routeId && !routeById(routeId)) throw new Error("Invalid route");
	const severity = body.severity === "disruption" ? "disruption" : "info";
	return {
		titleEn,
		titleSi: optionalClean(body.titleSi, 120) || titleEn,
		titleTa: optionalClean(body.titleTa, 120) || titleEn,
		bodyEn,
		bodySi: optionalClean(body.bodySi, 600) || bodyEn,
		bodyTa: optionalClean(body.bodyTa, 600) || bodyEn,
		severity,
		routeId: routeId || null
	};
}).handler(postAlert_createServerFn_handler, async ({ context, data }) => {
	const sql = await sqlClient();
	if (!await requireStaff(sql, context.userId)) return {
		ok: false,
		error: "forbidden"
	};
	const id = crypto.randomUUID();
	await sql`insert into service_alerts (id, severity, route_id, active, title_en, title_si, title_ta, body_en, body_si, body_ta, created_by)
      values (${id}, ${data.severity}, ${data.routeId}, true, ${data.titleEn}, ${data.titleSi}, ${data.titleTa}, ${data.bodyEn}, ${data.bodySi}, ${data.bodyTa}, ${context.userId})`;
	await audit(sql, context.userId, "post_alert", id);
	return {
		ok: true,
		id
	};
});
var setAlertActive_createServerFn_handler = createServerRpc({
	id: "59dc9b5af437087a4a0801f4fa2ba965991161640fffa38980efb7d90625454e",
	name: "setAlertActive",
	filename: "src/lib/api.ts"
}, (opts) => setAlertActive.__executeServer(opts));
var setAlertActive = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input;
	return {
		id: clean(body.id, 80),
		active: body.active === true
	};
}).handler(setAlertActive_createServerFn_handler, async ({ context, data }) => {
	const sql = await sqlClient();
	if (!await requireStaff(sql, context.userId)) return {
		ok: false,
		error: "forbidden"
	};
	await sql`update service_alerts set active = ${data.active} where id = ${data.id}`;
	await audit(sql, context.userId, "set_alert", `${data.id}:${data.active ? "on" : "off"}`);
	return { ok: true };
});
var reviewReport_createServerFn_handler = createServerRpc({
	id: "5b5b7da64ded4c2baf5f525ecad9340cb30c5fa4fbb22035de81604e23ce287d",
	name: "reviewReport",
	filename: "src/lib/api.ts"
}, (opts) => reviewReport.__executeServer(opts));
var reviewReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input;
	const status = body.status === "verified" ? "verified" : "rejected";
	return {
		id: clean(body.id, 80),
		status
	};
}).handler(reviewReport_createServerFn_handler, async ({ context, data }) => {
	const sql = await sqlClient();
	if (!await requireStaff(sql, context.userId)) return {
		ok: false,
		error: "forbidden"
	};
	await sql`update arrival_reports set status = ${data.status} where id = ${data.id}`;
	await audit(sql, context.userId, "review_report", `${data.id}:${data.status}`);
	return { ok: true };
});
//#endregion
export { acceptInvite_createServerFn_handler, claimOperator_createServerFn_handler, confirmTicket_createServerFn_handler, createInvite_createServerFn_handler, createShare_createServerFn_handler, createTicket_createServerFn_handler, deleteAccountData_createServerFn_handler, failTicket_createServerFn_handler, getShare_createServerFn_handler, getTicket_createServerFn_handler, inspectTicket_createServerFn_handler, listAlerts_createServerFn_handler, listOverrides_createServerFn_handler, listSavedJourneys_createServerFn_handler, listTickets_createServerFn_handler, myAccess_createServerFn_handler, postAlert_createServerFn_handler, redeemStaffTicket_createServerFn_handler, refundOwnTicket_createServerFn_handler, reportCount_createServerFn_handler, reviewReport_createServerFn_handler, saveJourney_createServerFn_handler, saveOverride_createServerFn_handler, sendArrivalReport_createServerFn_handler, sendFeedback_createServerFn_handler, setAlertActive_createServerFn_handler, staffOverview_createServerFn_handler };
