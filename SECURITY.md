# Security Policy

Confitty is a fully client-side static site. It does not collect, transmit, or
store any user data. The exported `kitty.conf` never leaves your browser.

## Supported versions

The deployed `main` branch is the only supported version. Older tagged
releases are not patched.

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
