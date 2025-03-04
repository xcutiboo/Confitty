#!/usr/bin/env bash
# Configure xcutiboo/Confitty GitHub repo to professional defaults.
# Requires: gh CLI authenticated as repo owner (gh auth login).
set -euo pipefail

REPO="xcutiboo/Confitty"

echo "==> Repo metadata"
gh api -X PATCH "/repos/${REPO}" --silent \
  -f description='Visual config builder for the Kitty terminal. Live preview, 47 themes, smart diff export. Built with Angular 21 and TypeScript.' \
  -f homepage='https://confitty.app/' \
  -F has_issues=true \
  -F has_projects=false \
  -F has_wiki=false \
  -F has_discussions=true \
  -F allow_squash_merge=true \
  -F allow_merge_commit=false \
  -F allow_rebase_merge=true \
  -F allow_auto_merge=true \
  -F delete_branch_on_merge=true \
  -F allow_update_branch=true \
  -F use_squash_pr_title_as_default=true \
  -F squash_merge_commit_title='PR_TITLE' \
  -F squash_merge_commit_message='PR_BODY' \
  -F web_commit_signoff_required=false

echo "==> Topics"
gh api -X PUT "/repos/${REPO}/topics" --silent \
  -H "Accept: application/vnd.github.mercy-preview+json" \
  --input - <<'JSON'
{
  "names": [
    "kitty",
    "kitty-terminal",
    "kitty-conf",
    "kitty-config",
    "terminal",
    "terminal-emulator",
    "config-generator",
    "config-builder",
    "dotfiles",
    "angular",
    "angular21",
    "typescript",
    "tailwindcss",
    "bun",
    "cloudflare-pages",
    "developer-tools",
    "live-preview",
    "color-themes",
    "open-source",
    "web-app"
  ]
}
JSON

echo "==> Security (best-effort, may require admin scope)"
gh api -X PUT "/repos/${REPO}/vulnerability-alerts" --silent 2>/dev/null \
  && echo "  Dependabot alerts: on" \
  || echo "  Dependabot alerts: skip (needs admin token)"
gh api -X PUT "/repos/${REPO}/automated-security-fixes" --silent 2>/dev/null \
  && echo "  Dependabot security updates: on" \
  || echo "  Dependabot security updates: skip"
gh api -X PATCH "/repos/${REPO}" -F 'security_and_analysis[secret_scanning][status]=enabled' \
  -F 'security_and_analysis[secret_scanning_push_protection][status]=enabled' --silent 2>/dev/null \
  && echo "  Secret scanning + push protection: on" \
  || echo "  Secret scanning: skip (private repo only, or token lacks scope)"

echo "==> Default branch (confitty)"
gh api -X PATCH "/repos/${REPO}" --silent -f default_branch='confitty'

echo "==> Branch protection on confitty"
gh api -X PUT "/repos/${REPO}/branches/confitty/protection" --silent --input - <<'JSON' || echo "  branch protection: skip (private repo or no Pro plan)"
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Type check and production build"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": true,
  "allow_deletions": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "block_creations": false,
  "required_signatures": false
}
JSON

echo
echo "Done. Verify at https://github.com/${REPO}/settings"
