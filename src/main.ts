import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";

/**
 * index.html paints a spinner that Angular replaces on bootstrap. If bootstrap
 * throws, nothing replaces it and the page spins forever, so swap it for
 * something that says what happened and offers a way out.
 */
function showBootstrapFailure(error: unknown): void {
	console.error("Confitty failed to start", error);

	const root = document.querySelector("app-root");
	if (!root) return;

	const panel = document.createElement("div");
	panel.setAttribute("role", "alert");
	panel.style.cssText =
		"min-height:100vh;display:flex;flex-direction:column;align-items:center;" +
		"justify-content:center;gap:12px;padding:24px;text-align:center;" +
		"font:16px/1.6 system-ui,sans-serif;color:#e0e0e0";

	const heading = document.createElement("h1");
	heading.textContent = "Confitty could not start";
	heading.style.cssText = "font-size:1.25rem;font-weight:600;margin:0";

	const detail = document.createElement("p");
	detail.textContent =
		"Reloading usually fixes this. If it keeps happening, your browser may be too old, or an extension may be blocking the page.";
	detail.style.cssText = "margin:0;max-width:44ch;color:#909090";

	const retry = document.createElement("button");
	retry.type = "button";
	retry.textContent = "Reload";
	retry.style.cssText =
		"margin-top:4px;padding:8px 20px;border:0;border-radius:8px;cursor:pointer;" +
		"background:#ffb5c6;color:#1c1917;font:inherit;font-weight:600";
	retry.addEventListener("click", () => location.reload());

	panel.append(heading, detail, retry);
	root.replaceChildren(panel);
}

try {
	await bootstrapApplication(AppComponent, { providers: [] });
} catch (error) {
	showBootstrapFailure(error);
}
