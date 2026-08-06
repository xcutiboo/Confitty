import { Injectable } from "@angular/core";
import { sanitizeConfig } from "../models/config-serialization";
import type { KittyConfigAST } from "../models/kitty-types";

const STORAGE_KEY = "confitty-config";
const PREFERENCES_KEY = "confitty-preferences";

/**
 * Bumped when a change to the stored shape cannot be absorbed by
 * `sanitizeConfig` — a renamed option, say, where silently keeping the old
 * value would be worse than starting clean.
 */
const SCHEMA_VERSION = 2;

interface StoredConfig {
	version: number;
	config: unknown;
}

/** Editor preferences, kept apart from the config so Reset does not clear them. */
export interface EditorPreferences {
	advancedMode: boolean;
	activeCategory: string;
}

/**
 * Keeps the working config in localStorage so a reload, a crashed tab, or a
 * closed laptop does not throw away a session's worth of tweaking.
 *
 * Every entry point tolerates storage being unavailable: Safari's private mode
 * throws on write, some browsers throw on read behind strict cookie settings,
 * and the quota can fill. None of that should break the editor, so failures
 * degrade to "this session just is not persisted".
 */
@Injectable({ providedIn: "root" })
export class ConfigPersistenceService {
	private available = true;

	load(): KittyConfigAST | null {
		const raw = this.read();
		if (!raw) return null;

		try {
			const parsed = JSON.parse(raw) as StoredConfig;
			if (!parsed || parsed.version !== SCHEMA_VERSION) {
				this.clear();
				return null;
			}
			return sanitizeConfig(parsed.config);
		} catch {
			// Corrupt entry: drop it rather than fail every future load.
			this.clear();
			return null;
		}
	}

	save(config: KittyConfigAST): void {
		if (!this.available) return;

		const payload: StoredConfig = { version: SCHEMA_VERSION, config };
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
		} catch {
			// Quota exceeded or storage denied. Stop retrying on every keystroke.
			this.available = false;
		}
	}

	clear(): void {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			this.available = false;
		}
	}

	loadPreferences(): Partial<EditorPreferences> {
		const raw = this.read(PREFERENCES_KEY);
		if (!raw) return {};

		try {
			const parsed: unknown = JSON.parse(raw);
			if (typeof parsed !== "object" || parsed === null) return {};
			const record = parsed as Record<string, unknown>;
			return {
				...(typeof record["advancedMode"] === "boolean" && {
					advancedMode: record["advancedMode"],
				}),
				...(typeof record["activeCategory"] === "string" && {
					activeCategory: record["activeCategory"],
				}),
			};
		} catch {
			return {};
		}
	}

	savePreferences(preferences: EditorPreferences): void {
		if (!this.available) return;
		try {
			localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
		} catch {
			this.available = false;
		}
	}

	private read(key: string = STORAGE_KEY): string | null {
		try {
			return localStorage.getItem(key);
		} catch {
			this.available = false;
			return null;
		}
	}
}
