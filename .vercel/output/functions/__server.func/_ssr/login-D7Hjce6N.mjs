import "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn } from "./client-CgU6ljwF.mjs";
import { t as GROK_PROVIDERS } from "./server-BusNtbMX.mjs";
import { t as useI18n } from "./i18n-B_ILhJzd.mjs";
import { r as useCurrentUserState, t as Button } from "./use-current-user-B2flxyZZ.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function resolveSignInGateState(input) {
	if (input.isPending) return "pending";
	return input.hasUser ? "signed_in" : "signed_out";
}
function SignInGate({ children, fallback }) {
	const { user, isPending } = useCurrentUserState();
	const state = resolveSignInGateState({
		isPending,
		hasUser: user !== null
	});
	if (state === "pending") return null;
	if (state === "signed_in") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: fallback ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInButtons, {}) });
}
function SignInButtons() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex w-full max-w-sm flex-col gap-2",
		children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => signIn(p.providerId, { callbackURL: "/" }),
			className: "w-full cursor-pointer rounded-md border border-neutral-300 px-4 py-2 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900",
			children: ["Continue with ", p.label]
		}, p.providerId))
	});
}
function Login() {
	const { t } = useI18n();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		id: "main",
		className: "grid min-h-dvh place-items-center bg-bg px-6 text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid w-full max-w-sm gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl tracking-tight",
					children: "Gaman"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-medium",
					children: t("signIn")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SignInGate, {
					fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2",
						children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: () => signIn(provider.providerId, { callbackURL: "/you" }),
							children: [
								t("continueWith"),
								" ",
								provider.label
							]
						}, provider.providerId))
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("alreadySignedIn") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							children: t("backHome")
						})
					})]
				})
			]
		})
	});
}
//#endregion
export { Login as component };
