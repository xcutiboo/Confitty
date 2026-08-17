# Security Policy

Confitty is a fully client-side static site with no backend and no analytics.
Nothing you enter is transmitted anywhere; the exported `kitty.conf` is built
and downloaded entirely in the browser.

Two things are stored locally, in `localStorage`, and never leave the device:
the config you are editing, so a reload does not discard it, and your light or
dark theme preference. Clearing site data removes both, as does **Reset to
defaults** in the app.

The only third-party requests are the Ko-fi support widget, and Google Fonts —
the latter fetched solely when you select a font for the preview, not on page
load.

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
