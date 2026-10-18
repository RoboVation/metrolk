import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, b as Link, p as useRouterState, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { a as alongM, c as estimateFare, d as routeLines, f as stopById, i as STOPS, l as pointAlong, m as walkMeters, n as LANDMARKS, o as authMiddleware, p as sumFares, r as NO_FARE, s as colomboDayStart, t as DIRECTIONS, u as routeById } from "./network-D4kOm18P.mjs";
import { n as usePrefs, t as useI18n } from "./i18n-B_ILhJzd.mjs";
import { n as cn, r as useCurrentUserState, t as Button } from "./use-current-user-B2flxyZZ.mjs";
import { a as Sun, c as LocateFixed, d as ArrowLeftRight, i as Ticket, l as Compass, o as Moon, r as TrainFront, s as Map$1, t as UserRound, u as Bus } from "../_libs/lucide-react.mjs";
import { n as Route$3, r as useResolvedTheme } from "./router-CZ342osF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-4EKVICFK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var options = [
	{
		id: "en",
		label: "EN"
	},
	{
		id: "si",
		label: "සිං"
	},
	{
		id: "ta",
		label: "த"
	}
];
function LanguageSwitch() {
	const { t, lang } = useI18n();
	const setLang = usePrefs((state) => state.setLang);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "radiogroup",
		"aria-label": t("language"),
		className: "flex rounded-md border border-border p-0.5",
		children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			role: "radio",
			"aria-checked": lang === option.id,
			onClick: () => setLang(option.id),
			className: cn("h-9 min-w-10 rounded-sm px-2 text-sm", lang === option.id ? "bg-primary text-primary-fg" : "text-muted"),
			children: option.label
		}, option.id))
	});
}
var items = [
	{
		to: "/",
		label: "map",
		icon: Map$1,
		match: (path) => path === "/" || path === "/ride"
	},
	{
		to: "/tickets",
		label: "tickets",
		icon: Ticket,
		match: (path) => path.startsWith("/tickets")
	},
	{
		to: "/discover",
		label: "discover",
		icon: Compass,
		match: (path) => path.startsWith("/discover")
	},
	{
		to: "/you",
		label: "you",
		icon: UserRound,
		match: (path) => path.startsWith("/you")
	}
];
function AppNav({ className }) {
	const { t } = useI18n();
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: cn("border-t border-border bg-bg", className),
		"aria-label": t("map"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mx-auto grid max-w-lg grid-cols-4",
			children: items.map((item) => {
				const active = item.match(pathname);
				const Icon = item.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					"aria-current": active ? "page" : void 0,
					className: cn("flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs", active ? "font-medium text-fg" : "text-muted"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "size-5",
						"aria-hidden": "true"
					}), t(item.label)]
				}) }, item.to);
			})
		})
	});
}
var maplibre_gl_worker_default = "/assets/maplibre-gl-worker-DxGNRm0a.mjs";
var STYLE = {
	light: "https://tiles.openfreemap.org/styles/positron",
	dark: "https://tiles.openfreemap.org/styles/dark"
};
function collection(points, kind) {
	return {
		type: "FeatureCollection",
		features: points.map((point) => ({
			type: "Feature",
			properties: {
				id: point.id,
				title: point.title,
				subtitle: point.subtitle,
				detail: point.detail ?? "",
				kind
			},
			geometry: {
				type: "Point",
				coordinates: [point.lng, point.lat]
			}
		}))
	};
}
function popupNode(title, subtitle, detail) {
	const root = document.createElement("div");
	root.className = "grid max-w-56 gap-1";
	const heading = document.createElement("p");
	heading.className = "text-sm font-medium";
	heading.textContent = title;
	const sub = document.createElement("p");
	sub.className = "text-xs text-muted";
	sub.textContent = subtitle;
	root.append(heading, sub);
	if (detail) {
		const extra = document.createElement("p");
		extra.className = "text-xs";
		extra.textContent = detail;
		root.append(extra);
	}
	return root;
}
function TransitMap({ theme, lines, stops, vehicles, user, fitKey, fitCoordinates, onSelectStop, onMove, failedLabel }) {
	const holder = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const selectRef = (0, import_react.useRef)(onSelectStop);
	const moveRef = (0, import_react.useRef)(onMove);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [failed, setFailed] = (0, import_react.useState)(false);
	selectRef.current = onSelectStop;
	moveRef.current = onMove;
	(0, import_react.useEffect)(() => {
		let dead = false;
		let map = null;
		setReady(false);
		setFailed(false);
		(async () => {
			try {
				const ml = await import("../_libs/maplibre-gl.mjs").then((n) => n.t);
				if (dead || !holder.current) return;
				ml.setWorkerUrl(maplibre_gl_worker_default);
				map = new ml.Map({
					container: holder.current,
					style: STYLE[theme],
					center: [79.8612, 6.9271],
					zoom: 11.4,
					attributionControl: {},
					dragRotate: false,
					pitchWithRotate: false
				});
				map.addControl(new ml.AttributionControl({ compact: true }), "bottom-left");
				mapRef.current = map;
				map.on("load", () => {
					if (dead || !map) return;
					map.addSource("lines", {
						type: "geojson",
						data: {
							type: "FeatureCollection",
							features: []
						}
					});
					map.addLayer({
						id: "lines",
						type: "line",
						source: "lines",
						paint: {
							"line-color": ["get", "color"],
							"line-width": ["get", "width"],
							"line-opacity": .9
						}
					});
					map.addSource("stops", {
						type: "geojson",
						data: {
							type: "FeatureCollection",
							features: []
						}
					});
					map.addLayer({
						id: "stops",
						type: "circle",
						source: "stops",
						paint: {
							"circle-radius": 5,
							"circle-color": "#fffcf8",
							"circle-stroke-color": "#1c1917",
							"circle-stroke-width": 2
						}
					});
					map.addSource("vehicles", {
						type: "geojson",
						data: {
							type: "FeatureCollection",
							features: []
						}
					});
					map.addLayer({
						id: "vehicles",
						type: "circle",
						source: "vehicles",
						paint: {
							"circle-radius": 7,
							"circle-color": "#1e3a5f",
							"circle-stroke-color": "#f7f4ee",
							"circle-stroke-width": 2
						}
					});
					map.addSource("user", {
						type: "geojson",
						data: {
							type: "FeatureCollection",
							features: []
						}
					});
					map.addLayer({
						id: "user",
						type: "circle",
						source: "user",
						paint: {
							"circle-radius": 7,
							"circle-color": "#1f6b45",
							"circle-stroke-color": "#f7f4ee",
							"circle-stroke-width": 2
						}
					});
					map.on("click", "stops", (event) => {
						const id = event.features?.[0]?.properties?.id;
						if (id) selectRef.current?.(String(id));
					});
					map.on("click", "vehicles", (event) => {
						const feature = event.features?.[0];
						const props = feature?.properties;
						if (!map || !props) return;
						const coordinates = feature.geometry.coordinates;
						new ml.Popup({
							closeButton: true,
							maxWidth: "240px"
						}).setLngLat(coordinates).setDOMContent(popupNode(String(props.title ?? ""), String(props.subtitle ?? ""), String(props.detail ?? ""))).addTo(map);
					});
					map.on("mouseenter", "stops", () => {
						if (map) map.getCanvas().style.cursor = "pointer";
					});
					map.on("mouseleave", "stops", () => {
						if (map) map.getCanvas().style.cursor = "";
					});
					map.on("moveend", () => {
						if (!map) return;
						const center = map.getCenter();
						moveRef.current?.({
							lng: center.lng,
							lat: center.lat
						});
					});
					setReady(true);
				});
			} catch {
				if (!dead) setFailed(true);
			}
		})();
		return () => {
			dead = true;
			map?.remove();
			mapRef.current = null;
		};
	}, [theme]);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!map || !ready) return;
		map.getSource("lines")?.setData({
			type: "FeatureCollection",
			features: lines.map((line) => ({
				type: "Feature",
				properties: {
					id: line.id,
					color: line.color,
					width: line.width
				},
				geometry: {
					type: "LineString",
					coordinates: line.coordinates
				}
			}))
		});
		map.getSource("stops")?.setData(collection(stops, "stop"));
		map.getSource("vehicles")?.setData(collection(vehicles, "vehicle"));
		map.getSource("user")?.setData(user ? collection([{
			id: "user",
			lng: user.lng,
			lat: user.lat,
			title: "",
			subtitle: ""
		}], "user") : {
			type: "FeatureCollection",
			features: []
		});
	}, [
		ready,
		lines,
		stops,
		vehicles,
		user
	]);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!map || !ready || !fitKey || !fitCoordinates || fitCoordinates.length < 2) return;
		const lngs = fitCoordinates.map((item) => item[0]);
		const lats = fitCoordinates.map((item) => item[1]);
		map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], {
			padding: 48,
			maxZoom: 14,
			duration: 400
		});
	}, [
		ready,
		fitKey,
		fitCoordinates
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-full w-full bg-surface-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: holder,
			className: "h-full w-full"
		}), failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "absolute inset-x-4 top-4 rounded-md border border-border bg-surface p-3 text-sm",
			children: failedLabel
		}) : null]
	});
}
function MapShell({ panel, lines, stops, vehicles, user, fitKey, fitCoordinates, onSelectStop, onMove, onLocate, locating }) {
	const { t } = useI18n();
	const theme = useResolvedTheme();
	const setTheme = usePrefs((state) => state.setTheme);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col bg-bg text-fg md:flex-row",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative h-map shrink-0 md:order-2 md:h-auto md:min-h-0 md:flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransitMap, {
					theme,
					lines,
					stops,
					vehicles,
					user,
					fitKey,
					fitCoordinates,
					onSelectStop,
					onMove,
					failedLabel: t("mapFailed")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute top-3 left-3 z-10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "pointer-events-auto inline-flex rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted",
						children: t("sampleBadge")
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute right-3 bottom-3 z-10 flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "icon",
						"aria-label": theme === "dark" ? t("lightMap") : t("darkMap"),
						onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
						children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-5" })
					}), onLocate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "icon",
						"aria-label": t("locate"),
						onClick: onLocate,
						disabled: locating,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { className: "size-5" })
					}) : null]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "flex min-h-0 flex-1 flex-col border-border bg-bg md:order-1 md:h-dvh md:w-panel md:flex-none md:border-r",
			children: [panel, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppNav, {})]
		})]
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-fg outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring", className),
		...props
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
var listAlerts = createServerFn({ method: "GET" }).handler(createSsrRpc("e00c0f5ef46dc115af4a4941845b9845e071c98aec31ecff2c457f619a5221d4"));
var listOverrides = createServerFn({ method: "GET" }).handler(createSsrRpc("2dc8e37bcb5ac4cc99b7e27b14408ed0f7468d9caf613901420dc9d53a4c9614"));
var reportCount = createServerFn({ method: "GET" }).validator((input) => {
	const stopId = clean(input?.stopId, 40);
	if (!stopById(stopId)) throw new Error("Invalid stop");
	return { stopId };
}).handler(createSsrRpc("cfdbb799fc80869005f288db56bf4ea46e940f4c107857b8ff1da2369c4f9834"));
createServerFn({ method: "GET" }).validator((input) => ({ id: clean(input?.id, 80) })).handler(createSsrRpc("43e05c687078689007568b002a95578b46851a8748833a56b475ede050d4410e"));
createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("0060eb073c32a9a853bb2187141e82fafd6e0720e3bf4aec84c0929342274b8c"));
createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("0eecd7b100619c350ac0360f2a295b721eb95db0861b002d18f56d509274b6eb"));
createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => ({ id: clean(input?.id, 80) })).handler(createSsrRpc("0cf2c3255c44d4c505ebd403b06976e215cc1d4ddc1d2166b3530bf46fba3c82"));
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
}).handler(createSsrRpc("b3796644d766f66ff4b39e5856e0646ab4bbb814e7918d261cf49c4a82aafab9"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input;
	return {
		id: clean(body.id, 80),
		idempotencyKey: clean(body.idempotencyKey, 80)
	};
}).handler(createSsrRpc("45740ae3bf12ee46c6939835fe5b640a3423809b45aae4a95589de7b41f8d514"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ id: clean(input?.id, 80) })).handler(createSsrRpc("ddee17b1610aaa39ba67842382b622a2d5009cb1e5b47f123b1272f7bd11548e"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ id: clean(input?.id, 80) })).handler(createSsrRpc("b0894a28e64a47765718868d9a2aa9067b0fa730ab8f2b28b4353a6435540b6a"));
var createShare = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input;
	if (body.consent !== true) throw new Error("consent");
	return { journeyJson: clean(body.journeyJson, 4e4) };
}).handler(createSsrRpc("56b45a61e8d8f39eb191dbf9a9dc94ffc015ebe740093955e85d1826ea3be090"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input;
	return {
		id: clean(body.id, 120),
		title: clean(body.title, 120),
		journeyJson: clean(body.journeyJson, 4e4)
	};
}).handler(createSsrRpc("178802da39cd6f50599b03e207bb3adddbe7e0a8755ad85eb843f2264d58e95a"));
createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("0a98752fc6c3854d59e0976c7a7e9a75d2deefd2c5c269cb19fe771cbf423967"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
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
}).handler(createSsrRpc("11271ef04ffbaee37b801979b99c8c958770184785b70ae4889743daebae7900"));
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
}).handler(createSsrRpc("97bad96834876238c0b3e5d3b6ec0ce0e9662d748f8f43740e6596a77253d438"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("02589cce29faf3ed2998bf17086f3cf3c1967561ddf3cc886d668c403f6b9bf1"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("978501eab64c58a93be6624b89d99897c4d00081ae0cd758e78dbb3951cb609d"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("350968466da8c989738892166afb6cabccabb155490fdd63879f75eee9ae3921"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ code: clean(input?.code, 16).toUpperCase() })).handler(createSsrRpc("0aab10432852c35e156962e1f5695567e50542d59062d4ab9269817b00a5d304"));
createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("fb52f7be3944c2ee4a0fe81f25f4b03584274d3e3c01d933cc1315727b6b28f5"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = clean(input?.id, 80);
	return { id: clean(raw.startsWith("gaman:ticket:") ? raw.slice(13) : raw, 80) };
}).handler(createSsrRpc("859c1422ac4aee6c8d51becf843215bb20b0191878cfc943c5c4081642f556a3"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ id: clean(input?.id, 80) })).handler(createSsrRpc("6438a2d97008275ffd897f7f94f7944f8c48d95cb043db10467337fcd030bb16"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
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
}).handler(createSsrRpc("da5ee129d0e90c3b656b4d4869f44e655960a9fb28de235311345f199585aee9"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
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
}).handler(createSsrRpc("c560bab6af757ee818403612183a9a1688890824bdd62bf3da786d0a977cdc9a"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input;
	return {
		id: clean(body.id, 80),
		active: body.active === true
	};
}).handler(createSsrRpc("59dc9b5af437087a4a0801f4fa2ba965991161640fffa38980efb7d90625454e"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input;
	const status = body.status === "verified" ? "verified" : "rejected";
	return {
		id: clean(body.id, 80),
		status
	};
}).handler(createSsrRpc("5b5b7da64ded4c2baf5f525ecad9340cb30c5fa4fbb22035de81604e23ce287d"));
function localeFor(lang) {
	if (lang === "si") return "si-LK";
	if (lang === "ta") return "ta-LK";
	return "en-LK";
}
function formatClock(epoch, lang) {
	return new Intl.DateTimeFormat(localeFor(lang), {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
		timeZone: "Asia/Colombo"
	}).format(new Date(epoch));
}
function formatLkr(amount, lang) {
	return new Intl.NumberFormat(localeFor(lang), {
		style: "currency",
		currency: "LKR",
		maximumFractionDigits: 0
	}).format(amount);
}
function formatDistance(meters) {
	if (meters < 950) return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
	return `${(meters / 1e3).toFixed(1)} km`;
}
function nextBoard(direction, stopId, readyAt) {
	const index = direction.stopIds.indexOf(stopId);
	if (index < 0) return null;
	const speed = direction.speedKmh * 1e3 / 3600;
	const offsetMs = speed <= 0 ? 0 : alongM(direction, 0, index) / speed * 1e3;
	const dayStart = colomboDayStart(readyAt);
	for (let minute = direction.firstMin; minute <= direction.lastMin; minute += direction.headwayMin) {
		const terminalDepart = dayStart + minute * 6e4;
		const boardAt = terminalDepart + offsetMs;
		if (boardAt + 500 >= readyAt) return {
			boardAt,
			terminalDepart
		};
	}
	return null;
}
function activeTrips(direction, now) {
	const last = direction.stopIds.length - 1;
	const total = alongM(direction, 0, last);
	const speed = direction.speedKmh * 1e3 / 3600;
	if (speed <= 0 || total <= 0) return [];
	const runtimeMs = total / speed * 1e3;
	const dayStart = colomboDayStart(now);
	const trips = [];
	for (let minute = direction.firstMin; minute <= direction.lastMin; minute += direction.headwayMin) {
		const terminalDepart = dayStart + minute * 6e4;
		const elapsed = now - terminalDepart;
		if (elapsed < 0 || elapsed > runtimeMs) continue;
		trips.push({
			terminalDepart,
			progressM: elapsed / 1e3 * speed
		});
	}
	return trips;
}
var MIN_CONNECTION_MS = 6e4;
var WALK_OMIT_M = 50;
function activeDirections(input) {
	return DIRECTIONS.filter((direction) => !input.inactiveRouteIds?.includes(direction.routeId)).map((direction) => {
		const headway = input.headwayByRoute?.[direction.routeId];
		if (headway == null || !Number.isFinite(headway)) return direction;
		return {
			...direction,
			headwayMin: Math.min(120, Math.max(2, Math.round(headway)))
		};
	});
}
function nearestStops(lat, lng, limit, maxM) {
	return STOPS.map((stop) => ({
		stop,
		distance: walkMeters({
			lat,
			lng
		}, stop)
	})).filter((item) => item.distance <= maxM).sort((a, b) => a.distance - b.distance).slice(0, limit).map((item) => item.stop);
}
function candidates(point) {
	if (point.stopId) {
		const preferred = stopById(point.stopId);
		if (!preferred) return nearestStops(point.lat, point.lng, 3, 1600);
		return [preferred, ...nearestStops(preferred.lat, preferred.lng, 4, 800).filter((stop) => stop.id !== preferred.id)].slice(0, 3);
	}
	return nearestStops(point.lat, point.lng, 3, 1600);
}
function named(stop) {
	return {
		lat: stop.lat,
		lng: stop.lng,
		name: stop.name,
		stopId: stop.id
	};
}
function makeWalk(from, to, readyAt, purpose) {
	const distanceM = walkMeters(from, to);
	if (distanceM < WALK_OMIT_M) return null;
	const durationMin = distanceM / 78;
	return {
		kind: "walk",
		from,
		to,
		distanceM,
		durationMin,
		departAt: readyAt,
		arriveAt: readyAt + durationMin * 6e4,
		purpose
	};
}
function rideLeg(direction, board, alight, readyAt) {
	const from = direction.stopIds.indexOf(board.id);
	const to = direction.stopIds.indexOf(alight.id);
	if (from < 0 || to <= from) return null;
	const boarded = nextBoard(direction, board.id, readyAt);
	const route = routeById(direction.routeId);
	if (!boarded || !route) return null;
	const distanceM = alongM(direction, from, to);
	const rideMin = distanceM / (direction.speedKmh * 1e3) * 60;
	const departAt = boarded.boardAt;
	const geometry = direction.stopIds.slice(from, to + 1).flatMap((id) => {
		const stop = stopById(id);
		return stop ? [[stop.lng, stop.lat]] : [];
	});
	const intermediate = direction.stopIds.slice(from + 1, to).flatMap((id) => {
		const stop = stopById(id);
		return stop ? [stop] : [];
	});
	return {
		kind: "ride",
		mode: route.mode,
		routeId: route.id,
		routeCode: route.code,
		routeName: route.name,
		directionId: direction.id,
		headsign: direction.headsign,
		operator: route.operator,
		board,
		alight,
		intermediate,
		distanceM,
		waitMin: Math.max(0, (departAt - readyAt) / 6e4),
		rideMin,
		departAt,
		arriveAt: departAt + rideMin * 6e4,
		fare: estimateFare(distanceM / 1e3, route.mode),
		geometry,
		dataSource: "sample",
		freshness: "sample-headway"
	};
}
function finalize(legs, leaveAt) {
	if (legs.length === 0) return null;
	const arriveAt = legs[legs.length - 1]?.arriveAt ?? leaveAt;
	const rides = legs.filter((leg) => leg.kind === "ride");
	const signature = legs.map((leg) => leg.kind === "walk" ? `w:${leg.purpose}:${leg.to.stopId ?? ""}` : `r:${leg.routeId}:${leg.board.id}:${leg.alight.id}`).join(">");
	return {
		id: signature,
		signature,
		legs,
		departAt: leaveAt,
		arriveAt,
		durationMin: Math.max(0, (arriveAt - leaveAt) / 6e4),
		walkM: legs.reduce((sum, leg) => sum + (leg.kind === "walk" ? leg.distanceM : 0), 0),
		transfers: Math.max(0, rides.length - 1),
		fare: rides.length > 0 ? sumFares(rides.map((ride) => ride.fare)) : NO_FARE,
		reliability: "unknown",
		freshness: "sample-dataset"
	};
}
function sortJourneys(list, sort) {
	return [...list].sort((a, b) => {
		const primary = sort === "fare" ? a.fare.amountLkr - b.fare.amountLkr : sort === "transfers" ? a.transfers - b.transfers : sort === "walk" ? a.walkM - b.walkM : a.durationMin - b.durationMin;
		if (primary !== 0) return primary;
		if (a.durationMin !== b.durationMin) return a.durationMin - b.durationMin;
		return a.fare.amountLkr - b.fare.amountLkr;
	});
}
function planJourneys(input) {
	const directions = activeDirections(input);
	const boards = candidates(input.origin);
	const alights = candidates(input.destination);
	const found = [];
	const originPt = {
		lat: input.origin.lat,
		lng: input.origin.lng
	};
	const destPt = {
		lat: input.destination.lat,
		lng: input.destination.lng
	};
	const directWalk = makeWalk(originPt, destPt, input.departAt, "access");
	if (directWalk && directWalk.distanceM < 2200) {
		const journey = finalize([directWalk], input.departAt);
		if (journey) found.push(journey);
	}
	for (const board of boards) for (const alight of alights) {
		if (board.id === alight.id) continue;
		const access = makeWalk(originPt, named(board), input.departAt, "access");
		const ready = access?.arriveAt ?? input.departAt;
		for (const direction of directions) {
			const ride = rideLeg(direction, board, alight, ready);
			if (!ride) continue;
			const egress = makeWalk(named(alight), destPt, ride.arriveAt, "egress");
			const legs = [];
			if (access) legs.push(access);
			legs.push(ride);
			if (egress) legs.push(egress);
			const journey = finalize(legs, input.departAt);
			if (journey && journey.durationMin <= 180) found.push(journey);
		}
	}
	for (const board of boards) for (const alight of alights) {
		const access = makeWalk(originPt, named(board), input.departAt, "access");
		const ready = access?.arriveAt ?? input.departAt;
		for (const first of directions) {
			const start = first.stopIds.indexOf(board.id);
			if (start < 0) continue;
			for (let index = start + 1; index < first.stopIds.length; index += 1) {
				const hub = stopById(first.stopIds[index] ?? "");
				if (!hub || hub.id === alight.id) continue;
				const ride1 = rideLeg(first, board, hub, ready);
				if (!ride1) continue;
				const hubs = [hub, ...nearestStops(hub.lat, hub.lng, 3, 450).filter((stop) => stop.id !== hub.id)];
				for (const transferStop of hubs) {
					if (transferStop.id === alight.id) continue;
					const transferWalk = transferStop.id === hub.id ? null : makeWalk(named(hub), named(transferStop), ride1.arriveAt, "transfer");
					const ready2 = (transferWalk?.arriveAt ?? ride1.arriveAt) + MIN_CONNECTION_MS;
					for (const second of directions) {
						if (second.routeId === first.routeId) continue;
						const ride2 = rideLeg(second, transferStop, alight, ready2);
						if (!ride2) continue;
						const egress = makeWalk(named(alight), destPt, ride2.arriveAt, "egress");
						const legs = [];
						if (access) legs.push(access);
						legs.push(ride1);
						if (transferWalk) legs.push(transferWalk);
						legs.push(ride2);
						if (egress) legs.push(egress);
						const journey = finalize(legs, input.departAt);
						if (journey && journey.durationMin <= 180) found.push(journey);
					}
				}
			}
		}
	}
	const best = /* @__PURE__ */ new Map();
	for (const journey of found) {
		const previous = best.get(journey.signature);
		if (!previous || journey.arriveAt < previous.arriveAt) best.set(journey.signature, journey);
	}
	const deduped = [...best.values()];
	const picked = /* @__PURE__ */ new Map();
	const take = (sorted, count) => {
		let kept = 0;
		for (const journey of sorted) {
			if (picked.has(journey.signature)) continue;
			picked.set(journey.signature, journey);
			kept += 1;
			if (kept >= count) break;
		}
	};
	take(sortJourneys(deduped, "fastest"), 4);
	take(sortJourneys(deduped, "fare"), 3);
	take(sortJourneys(deduped, "transfers"), 3);
	take(sortJourneys(deduped, "walk"), 2);
	return sortJourneys([...picked.values()], input.sort).slice(0, 5);
}
function fromStop(id) {
	const stop = stopById(id);
	if (!stop) return null;
	return {
		key: `stop:${stop.id}`,
		name: stop.name,
		lat: stop.lat,
		lng: stop.lng,
		stopId: stop.id,
		kind: "stop"
	};
}
function allPlaces() {
	const stops = STOPS.flatMap((stop) => {
		const place = fromStop(stop.id);
		return place ? [place] : [];
	});
	return [...LANDMARKS.flatMap((landmark) => {
		const nearest = stopById(landmark.nearestStopId);
		if (!nearest) return [];
		return [{
			key: `landmark:${landmark.id}`,
			name: landmark.name,
			lat: landmark.lat,
			lng: landmark.lng,
			stopId: nearest.id,
			kind: "landmark"
		}];
	}), ...stops];
}
function resolvePlace(key) {
	return allPlaces().find((place) => place.key === key) ?? null;
}
function searchPlaces(query, limit = 8) {
	const q = query.trim().toLowerCase();
	const places = allPlaces();
	if (!q) return places.filter((place) => place.kind === "landmark").slice(0, limit);
	return places.map((place) => {
		const names = [
			place.name.en,
			place.name.si,
			place.name.ta
		].map((name) => name.toLowerCase());
		return {
			place,
			score: names.some((name) => name.startsWith(q)) ? 0 : names.some((name) => name.includes(q)) ? 1 : 9
		};
	}).filter((item) => item.score < 9).sort((a, b) => a.score - b.score || a.place.name.en.localeCompare(b.place.name.en)).slice(0, limit).map((item) => item.place);
}
var FALLBACK_ALERT = {
	id: "seed-demo-alert",
	severity: "info",
	routeId: null,
	title: {
		en: "Sample network only",
		si: "නියැදි ජාලය පමණි",
		ta: "மாதிரி வலையமைப்பு மட்டும்"
	},
	body: {
		en: "This notice is seeded demonstration copy. It is not a live operator disruption. Routes, times, and vehicle positions in Gaman are sample data.",
		si: "මෙය නියැදි දැනුම්දීමකි. සජීවී මෙහෙයුම් බාධාවක් නොවේ. ගමන් මාර්ග, වේලාවන් සහ වාහන ස්ථාන නියැදි දත්තයි.",
		ta: "இது ஒரு மாதிரி அறிவிப்பு. நேரடி இயக்குநர் இடையூறு அல்ல. வழிகள், நேரங்கள், வண்டி நிலைகள் மாதிரி தரவு."
	}
};
function withHeadway(headwayByRoute) {
	return DIRECTIONS.map((direction) => {
		const headway = headwayByRoute[direction.routeId];
		if (headway == null || !Number.isFinite(headway)) return direction;
		return {
			...direction,
			headwayMin: Math.min(120, Math.max(2, Math.round(headway)))
		};
	});
}
function sampleVehicles(now, inactive = [], headwayByRoute = {}) {
	const vehicles = [];
	for (const direction of withHeadway(headwayByRoute)) {
		if (inactive.includes(direction.routeId)) continue;
		const route = routeById(direction.routeId);
		if (!route) continue;
		const speed = direction.speedKmh * 1e3 / 3600;
		for (const trip of activeTrips(direction, now)) {
			const position = pointAlong(direction, trip.progressM);
			const next = stopById(position.nextStopId);
			if (!next) continue;
			const index = direction.stopIds.indexOf(next.id);
			const following = direction.stopIds.slice(index, index + 3).flatMap((id) => {
				const stop = stopById(id);
				return stop ? [stop.name] : [];
			});
			const nextOffset = alongM(direction, 0, Math.max(0, index));
			const remainM = Math.max(0, nextOffset - trip.progressM);
			vehicles.push({
				id: `${direction.id}:${trip.terminalDepart}`,
				routeId: direction.routeId,
				directionId: direction.id,
				routeCode: route.code,
				headsign: direction.headsign,
				lat: position.lat,
				lng: position.lng,
				bearing: position.bearing,
				nextStopName: next.name,
				following,
				etaNextMin: speed > 0 ? Math.max(0, Math.round(remainM / speed / 60)) : 0,
				dataSource: "demonstration",
				status: "sample-moving"
			});
		}
	}
	return vehicles;
}
function arrivalsAt(stopId, now, inactive = [], headwayByRoute = {}) {
	const arrivals = [];
	for (const direction of withHeadway(headwayByRoute)) {
		if (inactive.includes(direction.routeId)) continue;
		if (!direction.stopIds.includes(stopId)) continue;
		const route = routeById(direction.routeId);
		const boarded = nextBoard(direction, stopId, now);
		if (!route || !boarded) continue;
		const index = direction.stopIds.indexOf(stopId);
		const nextStops = direction.stopIds.slice(index + 1, index + 4).flatMap((id) => {
			const stop = stopById(id);
			return stop ? [stop.name] : [];
		});
		arrivals.push({
			directionId: direction.id,
			routeId: direction.routeId,
			routeCode: route.code,
			mode: route.mode,
			headsign: direction.headsign,
			etaMin: Math.max(0, Math.round((boarded.boardAt - now) / 6e4)),
			boardAt: boarded.boardAt,
			nextStops,
			dataSource: "demonstration",
			status: "sample"
		});
	}
	arrivals.sort((a, b) => a.etaMin - b.etaMin);
	return arrivals;
}
var HERE = {
	en: "Your location",
	si: "ඔබේ ස්ථානය",
	ta: "உங்கள் இடம்"
};
var SORTS = [
	"fastest",
	"fare",
	"transfers",
	"walk"
];
function MapExperience({ fromKey, toKey }) {
	const { t, n, lang } = useI18n();
	const navigate = useNavigate();
	const theme = useResolvedTheme();
	const { user, isPending } = useCurrentUserState();
	const remember = usePrefs((state) => state.remember);
	const recentKeys = usePrefs((state) => state.recentKeys);
	const homeKey = usePrefs((state) => state.homeKey);
	const workKey = usePrefs((state) => state.workKey);
	const favoriteKeys = usePrefs((state) => state.favoriteKeys);
	const setHome = usePrefs((state) => state.setHome);
	const setWork = usePrefs((state) => state.setWork);
	const toggleFavorite = usePrefs((state) => state.toggleFavorite);
	const saveLocalJourney = usePrefs((state) => state.saveJourney);
	const bannerDismissed = usePrefs((state) => state.bannerDismissed);
	const dismissBanner = usePrefs((state) => state.dismissBanner);
	const [query, setQuery] = (0, import_react.useState)("");
	const [field, setField] = (0, import_react.useState)("to");
	const [sort, setSort] = (0, import_react.useState)("fastest");
	const [offset, setOffset] = (0, import_react.useState)(0);
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [focusStop, setFocusStop] = (0, import_react.useState)(null);
	const [center, setCenter] = (0, import_react.useState)({
		lat: 6.9271,
		lng: 79.8612
	});
	const [clock, setClock] = (0, import_react.useState)(() => Date.now());
	const [departAt, setDepartAt] = (0, import_react.useState)(() => Date.now());
	const [loc, setLoc] = (0, import_react.useState)(null);
	const [locStatus, setLocStatus] = (0, import_react.useState)("idle");
	const [alerts, setAlerts] = (0, import_react.useState)([FALLBACK_ALERT]);
	const [overrides, setOverrides] = (0, import_react.useState)([]);
	const [overrideError, setOverrideError] = (0, import_react.useState)(false);
	const [consent, setConsent] = (0, import_react.useState)(false);
	const [notice, setNotice] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [reports, setReports] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setClock(Date.now()), 4e3);
		return () => window.clearInterval(id);
	}, []);
	(0, import_react.useEffect)(() => {
		setDepartAt(Date.now() + offset * 6e4);
	}, [
		offset,
		fromKey,
		toKey
	]);
	(0, import_react.useEffect)(() => {
		let dead = false;
		listAlerts().then((rows) => {
			if (!dead && rows.length) setAlerts(rows);
		}).catch(() => {
			if (!dead) setAlerts([FALLBACK_ALERT]);
		});
		listOverrides().then((rows) => {
			if (!dead) setOverrides(rows);
		}).catch(() => {
			if (!dead) setOverrideError(true);
		});
		return () => {
			dead = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!focusStop) return;
		let dead = false;
		reportCount({ data: { stopId: focusStop } }).then((row) => {
			if (!dead) setReports(row.unverified);
		}).catch(() => {
			if (!dead) setReports(0);
		});
		return () => {
			dead = true;
		};
	}, [focusStop]);
	const inactive = overrides.filter((item) => !item.active).map((item) => item.routeId);
	const headwayByRoute = Object.fromEntries(overrides.flatMap((item) => item.headwayMin ? [[item.routeId, item.headwayMin]] : []));
	const toPlace = toKey === "here" && loc ? {
		key: "here",
		name: HERE,
		lat: loc.lat,
		lng: loc.lng,
		kind: "stop",
		stopId: void 0
	} : toKey ? resolvePlace(toKey) : null;
	const fromPlace = fromKey === "here" && loc ? {
		key: "here",
		name: HERE,
		lat: loc.lat,
		lng: loc.lng,
		kind: "stop",
		stopId: void 0
	} : fromKey ? resolvePlace(fromKey) : null;
	const journeys = (0, import_react.useMemo)(() => {
		if (!toPlace || !fromPlace) return [];
		return planJourneys({
			origin: {
				lat: fromPlace.lat,
				lng: fromPlace.lng,
				stopId: fromPlace.stopId
			},
			destination: {
				lat: toPlace.lat,
				lng: toPlace.lng,
				stopId: toPlace.stopId
			},
			departAt,
			sort,
			inactiveRouteIds: inactive,
			headwayByRoute
		});
	}, [
		toPlace,
		fromPlace,
		departAt,
		sort,
		inactive.join("|"),
		JSON.stringify(headwayByRoute)
	]);
	const selected = journeys.find((journey) => journey.id === selectedId) ?? journeys[0] ?? null;
	const results = query.trim() ? searchPlaces(query, 8) : [];
	const nearby = (0, import_react.useMemo)(() => STOPS.map((stop) => ({
		stop,
		distance: walkMeters(center, stop)
	})).sort((a, b) => a.distance - b.distance).slice(0, 6), [center]);
	function go(next) {
		navigate({
			to: "/",
			search: {
				to: next.to ?? toKey,
				from: next.from ?? fromKey
			}
		});
	}
	function choose(key) {
		remember(key);
		setQuery("");
		setFocusStop(null);
		if (!toKey || field === "to") {
			go({
				to: key,
				from: fromKey
			});
			setField("from");
			return;
		}
		go({
			to: toKey,
			from: key
		});
	}
	function locate() {
		if (!navigator.geolocation) {
			setLocStatus("unsupported");
			return;
		}
		setLocStatus("locating");
		navigator.geolocation.getCurrentPosition((position) => {
			setLoc({
				lat: position.coords.latitude,
				lng: position.coords.longitude
			});
			setLocStatus("idle");
			setCenter({
				lat: position.coords.latitude,
				lng: position.coords.longitude
			});
			if (toKey) go({
				to: toKey,
				from: "here"
			});
		}, () => setLocStatus("denied"), {
			enableHighAccuracy: true,
			timeout: 8e3,
			maximumAge: 2e4
		});
	}
	async function buy(journey) {
		const rides = journey.legs.flatMap((leg) => leg.kind === "ride" ? [{
			routeId: leg.routeId,
			boardId: leg.board.id,
			alightId: leg.alight.id
		}] : []);
		const first = rides[0];
		const last = rides[rides.length - 1];
		if (!first || !last) return;
		const board = stopById(first.boardId);
		const alight = stopById(last.alightId);
		if (!board || !alight) return;
		setBusy(true);
		setNotice(null);
		try {
			const result = await createTicket({ data: {
				idempotencyKey: crypto.randomUUID(),
				summary: {
					board: board.name,
					alight: alight.name,
					transfers: journey.transfers,
					routes: rides.flatMap((ride) => {
						const route = routeById(ride.routeId);
						return route ? [{
							id: route.id,
							code: route.code,
							mode: route.mode,
							name: route.name
						}] : [];
					})
				},
				rides
			} });
			if (!result.ok || !("ticket" in result)) {
				setNotice(t("error"));
				return;
			}
			navigate({
				to: "/tickets/$id",
				params: { id: result.ticket.id }
			});
		} catch {
			setNotice(t("error"));
		} finally {
			setBusy(false);
		}
	}
	async function share(journey) {
		if (!consent) {
			setNotice(t("consentRequired"));
			return;
		}
		setBusy(true);
		try {
			const result = await createShare({ data: {
				consent: true,
				journeyJson: JSON.stringify(journey)
			} });
			if (!result.ok) {
				setNotice(t("error"));
				return;
			}
			const url = `${window.location.origin}/share/${result.id}`;
			await navigator.clipboard.writeText(url);
			setNotice(t("shareReady"));
		} catch {
			setNotice(t("error"));
		} finally {
			setBusy(false);
		}
	}
	const lineColor = theme === "dark" ? "#f4f1ea" : "#1c1917";
	const lines = (0, import_react.useMemo)(() => {
		const base = routeLines().filter((line) => !inactive.includes(line.routeId)).map((line) => ({
			id: line.routeId,
			color: line.color,
			width: selected ? 2 : 4,
			coordinates: line.coordinates
		}));
		if (!selected) return base;
		const overlay = selected.legs.map((leg, index) => leg.kind === "ride" ? {
			id: `ride-${index}`,
			color: lineColor,
			width: 6,
			coordinates: leg.geometry
		} : {
			id: `walk-${index}`,
			color: "#6f685e",
			width: 2,
			coordinates: [[leg.from.lng, leg.from.lat], [leg.to.lng, leg.to.lat]]
		});
		return [...base, ...overlay];
	}, [
		inactive.join("|"),
		selected,
		lineColor
	]);
	const fit = selected ? selected.legs.flatMap((leg) => leg.kind === "ride" ? leg.geometry : [[leg.from.lng, leg.from.lat], [leg.to.lng, leg.to.lat]]) : null;
	const vehicles = sampleVehicles(clock, inactive, headwayByRoute).map((vehicle) => ({
		id: vehicle.id,
		lng: vehicle.lng,
		lat: vehicle.lat,
		title: n(vehicle.headsign),
		subtitle: `${vehicle.routeCode} · ${t("sampleMovement")}`,
		detail: `${t("nextStop")}: ${n(vehicle.nextStopName)} · ${vehicle.etaNextMin} ${t("min")}. ${t("notLive")}. ${t("delayUnknown")}`
	}));
	const focus = focusStop ? stopById(focusStop) : null;
	const focusArrivals = focus ? arrivalsAt(focus.id, clock, inactive, headwayByRoute) : [];
	const panel = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex items-center justify-between gap-3 px-4 pt-4 pb-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "font-display text-2xl tracking-tight",
			children: "Gaman"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageSwitch, {})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: "main",
		className: "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfflineNote, {}),
			!bannerDismissed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "rounded-xl border border-border bg-surface px-3 py-3 text-sm",
				children: [t("sampleBanner"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-2 block font-medium underline",
					onClick: dismissBanner,
					children: t("dismiss")
				})]
			}) : null,
			overrideError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t("operatorUpdates")
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "grid gap-1 text-sm font-medium",
				children: [toKey ? field === "from" ? t("origin") : t("destination") : t("whereTo"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (event) => setQuery(event.target.value),
					placeholder: t("searchPlaceholder"),
					"aria-label": t("searchPlaceholder")
				})]
			}),
			query.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "grid gap-1",
				children: [results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted",
					children: t("noResults")
				}) : null, results.map((place) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex min-h-11 w-full items-center justify-between rounded-md px-2 text-left hover:bg-surface-2",
					onClick: () => choose(place.key),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: n(place.name) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: place.kind === "landmark" ? t("places") : place.key.includes("rail") ? t("train") : t("bus")
					})]
				}) }, place.key))]
			}) : null,
			toPlace ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 rounded-xl border border-border bg-surface p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: t("destination")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: n(toPlace.name)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-sm underline",
							onClick: () => {
								setField("to");
								setQuery("");
							},
							children: t("change")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: t("origin")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: fromPlace ? n(fromPlace.name) : t("emptyOrigin")
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-sm underline",
							onClick: () => setField("from"),
							children: t("change")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: locate,
								disabled: locStatus === "locating",
								children: locStatus === "locating" ? t("locating") : t("useLocation")
							}),
							homeKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => go({ from: homeKey }),
								children: t("home")
							}) : null,
							workKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => go({ from: workKey }),
								children: t("work")
							}) : null,
							fromPlace && toPlace ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "secondary",
								"aria-label": t("swap"),
								onClick: () => go({
									from: toPlace.key,
									to: fromPlace.key
								}),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftRight, { className: "size-4" })
							}) : null
						]
					}),
					locStatus === "denied" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: t("locationDenied")
					}) : null,
					locStatus === "unsupported" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: t("locationUnsupported")
					}) : null
				]
			}) : null,
			!toPlace && !query.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: locate,
						children: t("useLocation")
					})
				}),
				alerts.slice(0, 2).map((alert) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-xl border border-border px-3 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: alert.id === "seed-demo-alert" ? t("noticeSeed") : t("noticeStaff")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-medium",
							children: n(alert.title)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: n(alert.body)
						})
					]
				}, alert.id)),
				focus ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-left text-sm underline",
							onClick: () => setFocusStop(null),
							children: t("back")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl",
							children: n(focus.name)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: t("accessNote")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: [
								t("unverifiedReports"),
								": ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: reports
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-medium",
							children: t("arrivals")
						}),
						focusArrivals.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: t("noVehicle")
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "grid gap-2",
							children: focusArrivals.slice(0, 4).map((arrival) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md border border-border px-3 py-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm font-medium",
										children: [
											arrival.routeCode,
											" · ",
											n(arrival.headsign)
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm tabular-nums",
										children: [
											arrival.etaMin,
											" ",
											t("min"),
											" · ",
											formatClock(arrival.boardAt, lang)
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [
											t("sampleMovement"),
											" · ",
											t("notLive"),
											" · ",
											t("delayUnknown")
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [
											t("nextStops"),
											": ",
											arrival.nextStops.map((name) => n(name)).join(", ") || "—"
										]
									})
								]
							}, arrival.directionId))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => choose(`stop:${focus.id}`),
								children: t("planFromHere")
							}), user && focusArrivals[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => {
									const routeId = focusArrivals[0]?.routeId;
									if (!routeId) return;
									sendArrivalReport({ data: {
										stopId: focus.id,
										routeId
									} }).then(() => setNotice(t("reportSent"))).catch(() => setNotice(t("error")));
								},
								children: t("reportArrival")
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: isPending ? t("loading") : t("reportNeedSignIn")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: t("arrivalNote")
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-medium",
							children: t("nearby")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: loc ? t("useLocation") : t("aroundMap")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "grid gap-1",
							children: nearby.map(({ stop, distance }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "flex min-h-11 w-full items-center justify-between rounded-md px-2 text-left hover:bg-surface-2",
								onClick: () => setFocusStop(stop.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: n(stop.name) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted tabular-nums",
									children: formatDistance(distance)
								})]
							}) }, stop.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "pt-2 text-sm font-medium",
							children: t("reachBy")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "grid gap-2",
							children: LANDMARKS.slice(0, 3).map((landmark) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "w-full rounded-xl border border-border px-3 py-3 text-left",
								onClick: () => choose(`landmark:${landmark.id}`),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: n(landmark.name)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 block text-sm text-muted",
									children: n(landmark.blurb)
								})]
							}) }, landmark.id))
						})
					]
				})
			] }) : null,
			toPlace && !fromPlace && !query.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t("setOrigin")
			}) : null,
			fromPlace && toPlace ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3",
				"aria-live": "polite",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2 overflow-x-auto",
						children: SORTS.map((mode) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSort(mode),
							className: cn("h-10 shrink-0 rounded-full px-3 text-sm", sort === mode ? "bg-primary text-primary-fg" : "border border-border bg-surface"),
							children: t(mode === "fare" ? "lowestFare" : mode === "transfers" ? "fewestTransfers" : mode === "walk" ? "leastWalking" : "fastest")
						}, mode))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2",
						children: [
							0,
							30,
							60
						].map((minutes) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setOffset(minutes),
							className: cn("h-10 rounded-md px-3 text-sm", offset === minutes ? "bg-primary text-primary-fg" : "border border-border"),
							children: minutes === 0 ? t("leaveNow") : minutes === 30 ? t("in30") : t("in60")
						}, minutes))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: t("results")
					}),
					journeys.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "rounded-xl border border-border px-3 py-4 text-sm",
						children: [
							t("noJourneys"),
							" ",
							t("coverageNote")
						]
					}) : null,
					journeys.map((journey) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: cn("grid gap-2 rounded-xl border p-3", selected?.id === journey.id ? "border-fg bg-surface" : "border-border"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "grid gap-1 text-left",
								onClick: () => setSelectedId(journey.id),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-baseline justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-display text-2xl tabular-nums",
											children: [
												Math.max(1, Math.round(journey.durationMin)),
												" ",
												t("min")
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm tabular-nums",
											children: journey.fare.modelId === "no-fare" ? t("walk") : formatLkr(journey.fare.amountLkr, lang)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: journey.fare.modelId === "no-fare" ? t("walk") : `${t("fareSample")} · ${t("lowConfidence")} · ${t("perBoarding")}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm",
										children: [
											formatClock(journey.departAt, lang),
											" – ",
											formatClock(journey.arriveAt, lang)
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-muted",
										children: [
											t("walk"),
											" ",
											formatDistance(journey.walkM),
											" · ",
											journey.transfers,
											" ",
											t("transfers")
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "grid gap-2 text-sm",
								children: journey.legs.map((leg, index) => leg.kind === "walk" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									t("walk"),
									" · ",
									Math.max(1, Math.round(leg.durationMin)),
									" ",
									t("min")
								] }, `${journey.id}-w-${index}`) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "grid gap-0.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-2 font-medium",
											children: [
												leg.mode === "rail" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrainFront, {
													className: "size-4",
													"aria-hidden": "true"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bus, {
													className: "size-4",
													"aria-hidden": "true"
												}),
												leg.routeCode,
												" · ",
												n(leg.routeName)
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											t("board"),
											" ",
											n(leg.board.name),
											" · ",
											t("alight"),
											" ",
											n(leg.alight.name)
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted",
											children: [
												n(leg.headsign),
												" · ",
												t("wait"),
												" ",
												Math.round(leg.waitMin),
												" ",
												t("min"),
												" · ",
												t("notLive")
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted",
											children: n(routeById(leg.routeId)?.disclaimer ?? {
												en: "",
												si: "",
												ta: ""
											})
										})
									]
								}, `${journey.id}-r-${index}`))
							}),
							alerts.filter((alert) => alert.severity === "disruption" && journey.legs.some((leg) => leg.kind === "ride" && leg.routeId === alert.routeId)).map((alert) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-warn",
								children: n(alert.title)
							}, alert.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									t("reliability"),
									": ",
									t("unknown"),
									" · ",
									t("freshness"),
									": ",
									t("sampleDataset")
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: t("geometryNote")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									t("officialFares"),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										className: "underline",
										href: "https://www.ntc.gov.lk/Bus_info/bus_fare.php",
										target: "_blank",
										rel: "noreferrer",
										children: "NTC"
									}),
									" · ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										className: "underline",
										href: "https://www.sltb.lk/notice/busFees",
										target: "_blank",
										rel: "noreferrer",
										children: "SLTB"
									})
								]
							}),
							selected?.id === journey.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										onClick: () => {
											sessionStorage.setItem("gaman-ride", JSON.stringify(journey));
											navigate({ to: "/ride" });
										},
										children: t("startGuidance")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										onClick: () => {
											const title = `${n(fromPlace.name)} – ${n(toPlace.name)}`;
											saveLocalJourney({
												id: crypto.randomUUID(),
												title,
												json: JSON.stringify(journey),
												savedAt: Date.now()
											});
											setNotice(t("saved"));
										},
										children: t("saveJourney")
									}),
									journey.legs.some((leg) => leg.kind === "ride") ? isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 rounded-md bg-surface-2" }) : user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										disabled: busy,
										onClick: () => void buy(journey),
										children: busy ? t("working") : t("buyTicket")
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/login",
										className: "inline-flex h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-medium",
										children: t("signInToPay")
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-start gap-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											className: "mt-1 size-4",
											checked: consent,
											onChange: (event) => setConsent(event.target.checked)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("shareConsent") })]
									}),
									user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										disabled: busy,
										onClick: () => void share(journey),
										children: t("share")
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => {
													setHome(toPlace.key);
													setNotice(t("homeSet"));
												},
												children: t("home")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => {
													setWork(toPlace.key);
													setNotice(t("workSet"));
												},
												children: t("work")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => {
													toggleFavorite(toPlace.key);
													setNotice(t("favoriteSet"));
												},
												children: t("favorites")
											})
										]
									})
								]
							}) : null
						]
					}, journey.id))
				]
			}) : null,
			!toPlace && recentKeys.length > 0 && !query.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: t("recent")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: recentKeys.map((key) => {
				const place = resolvePlace(key);
				if (!place) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 text-sm underline",
					onClick: () => choose(key),
					children: n(place.name)
				}) }, key);
			}) })] }) : null,
			favoriteKeys.length > 0 && !query.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					t("favorites"),
					": ",
					favoriteKeys.length
				]
			}) : null,
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "text-sm",
				children: notice
			}) : null
		]
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapShell, {
		panel,
		lines,
		stops: STOPS.map((stop) => ({
			id: stop.id,
			lng: stop.lng,
			lat: stop.lat,
			title: n(stop.name),
			subtitle: stop.kind === "rail" ? t("train") : t("bus")
		})),
		vehicles,
		user: loc ? {
			lng: loc.lng,
			lat: loc.lat
		} : null,
		fitKey: selected?.id ?? null,
		fitCoordinates: fit,
		onSelectStop: (id) => {
			setFocusStop(id);
			if (!toKey) setQuery("");
		},
		onMove: setCenter,
		onLocate: locate,
		locating: locStatus === "locating"
	});
}
function OfflineNote() {
	const { t } = useI18n();
	const [online, setOnline] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const sync = () => setOnline(navigator.onLine);
		sync();
		window.addEventListener("online", sync);
		window.addEventListener("offline", sync);
		return () => {
			window.removeEventListener("online", sync);
			window.removeEventListener("offline", sync);
		};
	}, []);
	if (online) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		role: "status",
		className: "rounded-md border border-border bg-surface-2 px-3 py-2 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "font-medium",
			children: [t("offline"), ". "]
		}), t("offlineBody")]
	});
}
function Home() {
	const search = Route$3.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapExperience, {
		fromKey: search.from,
		toKey: search.to
	});
}
//#endregion
export { Home as component };
