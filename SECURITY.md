# Security Policy

Confitty is a fully client-side static site with no backend and no analytics.
Nothing you enter is transmitted anywhere; the exported `kitty.conf` is built
and downloaded entirely in the browser.

Two things are stored locally, in `localStorage`, and never leave the device:
the config you are editing, so a reload does not discard it, and your light or
dark theme preference. Clearing site data removes both, as does **Reset to
defaults** in the app.

## Third-party requests

The deployed site makes three, and none of them see your configuration:

- **Google AdSense**, one ad unit below the settings, which pays for the domain
  and hosting. Like any ad network it sets cookies and reads the usual request
  metadata. EEA and UK visitors get Google's consent message before personalised
  ads are served, per the certified-CMP requirement in force since January 2024.
  The ad is requested only once you scroll near it, so a visit that never
  reaches it never contacts the ad server.
- **Cloudflare Web Analytics**, which counts page views without cookies and
  without building a profile of you. There is no Google Analytics here.
- **Ko-fi**, the support widget.
- **Google Fonts**, fetched only when you pick a font for the preview, never on
  page load.

Ads are configured through build-time environment variables and are absent from
this repository, so a local build or a fork serves none of the above except the
Ko-fi widget. Blocking any of it leaves the editor fully functional.

## Supported versions

Only the currently deployed site, built from the `confitty` branch, is
supported. Older tagged releases are not patched.

## Reporting a vulnerability

If you find a vulnerability, please **do not** open a public issue.

- Email: open a private security advisory via the GitHub UI
  (`Security` → `Report a vulnerability` on this repo).
- Expected response time: within 7 days.

Please include:

- A clear description of the issue
- Steps to reproduce, or a minimal proof of concept
- Browser and OS, if relevant
- Your assessment of impact

## Scope

In scope:

- XSS or injection paths in the editor, parser, or generator
- Misuse of `localStorage` or other browser storage
- Insecure handling of imported `kitty.conf` files
- Issues with the Content Security Policy or response headers

Out of scope:

- Anything that requires the user to install a malicious browser extension
- Social engineering or phishing of project contributors
- Findings against third-party services Confitty links to
