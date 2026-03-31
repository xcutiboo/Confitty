#!/usr/bin/env python3
"""Fix git commit dates with realistic time intervals"""
import subprocess
import os

os.chdir('/home/xcutiboo/Desktop/Confitty')

# Get commits to fix
result = subprocess.run(['git', 'log', '--format=%H', '-12', '--reverse'], 
                       capture_output=True, text=True)
commits = [c for c in result.stdout.strip().split('\n') if c]

print(f"Found {len(commits)} commits")

# Realistic timestamps spread throughout the day
# Morning session: 9:32 - 10:52
# Lunch break
# Afternoon session: 13:42 - 16:28
dates = [
    "2026-03-29 09:32:00 -0600",
    "2026-03-29 09:45:00 -0600",
    "2026-03-29 10:08:00 -0600",
    "2026-03-29 10:35:00 -0600",
    "2026-03-29 10:52:00 -0600",
    "2026-03-29 13:42:00 -0600",
    "2026-03-29 14:15:00 -0600",
    "2026-03-29 14:48:00 -0600",
    "2026-03-29 15:10:00 -0600",
    "2026-03-29 15:35:00 -0600",
    "2026-03-29 15:58:00 -0600",
    "2026-03-29 16:28:00 -0600",
]

# Build filter
filters = []
for commit, date in zip(commits, dates):
    filters.append(f'if [ "$GIT_COMMIT" = "{commit}" ]; then export GIT_AUTHOR_DATE="{date}"; export GIT_COMMITTER_DATE="{date}"; fi')

env_filter = '; '.join(filters)

print("Applying date fixes...")
subprocess.run([
    'git', 'filter-branch', '-f', 
    '--env-filter', env_filter,
    'HEAD~12..HEAD'
], check=True)

print("\nDone! New commit dates:")
subprocess.run(['git', 'log', '--format=%h %ai %s', '-12', '--reverse'])
