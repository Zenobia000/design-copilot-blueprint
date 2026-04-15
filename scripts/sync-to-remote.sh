#!/usr/bin/env bash
#
# Sync this project to the remote dev box via rsync.
#
# Usage:
#   ./scripts/sync-to-remote.sh              # incremental sync (default)
#   ./scripts/sync-to-remote.sh --dry-run    # preview only, transfers nothing
#   ./scripts/sync-to-remote.sh --no-delete  # don't remove remote-only files
#   REMOTE=user@host:/path ./scripts/sync-to-remote.sh   # override target
#
# Excludes secrets (.env), node_modules, build artifacts, caches.
# Run from the project root.

set -euo pipefail

REMOTE="${REMOTE:-os-alan.chu@10.137.80.39:/ssd1/alan/sunnie/}"

# Project-root sanity check
if [[ ! -f package.json ]] || [[ ! -d backend ]]; then
  echo "error: run from project root (need package.json + backend/)" >&2
  exit 2
fi

DELETE_FLAG="--delete"
DRY_RUN=""
for arg in "$@"; do
  case "$arg" in
    --dry-run)   DRY_RUN="--dry-run" ;;
    --no-delete) DELETE_FLAG="" ;;
    -h|--help)
      sed -n '3,12p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *)
      echo "error: unknown arg '$arg' (use --dry-run, --no-delete, --help)" >&2
      exit 2 ;;
  esac
done

EXCLUDES=(
  --exclude '.env'
  --exclude '.env.local'
  --exclude '.env.*.local'
  --exclude 'node_modules/'
  --exclude 'dist/'
  --exclude 'build/'
  --exclude '.vite/'
  --exclude '__pycache__/'
  --exclude '*.pyc'
  --exclude '.pytest_cache/'
  --exclude '.mypy_cache/'
  --exclude '.ruff_cache/'
  --exclude '.venv/'
  --exclude 'backend/.venv/'
  --exclude '.DS_Store'
  --exclude '.idea/'
  --exclude '.vscode/'
  --exclude 'coverage/'
  --exclude '*.log'
)

echo ">>> rsync to $REMOTE"
[[ -n "$DRY_RUN" ]] && echo ">>> DRY RUN — no files transferred"

rsync -avz --human-readable --stats \
  $DRY_RUN $DELETE_FLAG \
  "${EXCLUDES[@]}" \
  ./ "$REMOTE"

echo ">>> done"
