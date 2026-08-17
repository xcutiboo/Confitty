/**
 * AdSense identifiers, supplied by the deployment rather than committed.
 *
 * `scripts/apply-site-config.mjs` rewrites the two constants below from
 * CONFITTY_ADSENSE_CLIENT and CONFITTY_ADSENSE_SLOT before a production build.
 * They stay empty in the repository, so the open-source tree carries no ad
 * account details and a contributor's local build serves no ads at all.
 *
 * With either value empty, nothing renders and no third-party script is loaded.
 */

/** Publisher ID: the literal `ca-pub-` followed by sixteen digits. */
export const ADSENSE_CLIENT = "";

/** Ad unit ID for the single slot, a numeric string. */
export const ADSENSE_SLOT = "";

export function adsEnabled(): boolean {
	return ADSENSE_CLIENT.startsWith("ca-pub-") && ADSENSE_SLOT.length > 0;
}
