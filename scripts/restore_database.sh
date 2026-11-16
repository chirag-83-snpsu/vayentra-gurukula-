#!/usr/bin/env bash
# ==============================================================================
# VAYENTRA GURUKULA - DATABASE RESTORATION & DISASTER RECOVERY SCRIPT
# DPDP Act 2023 Compliant • Checksum Verified • Safety Pre-Snapshot
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

TARGET_DB="${PROJECT_ROOT}/server/db/vayentra.sqlite"

if [ $# -lt 1 ]; then
  echo "Usage: $0 <path_to_backup_sqlite_file> [--skip-safety-snapshot]"
  echo "Example: $0 ./backups/vayentra_backup_20261116_120000.sqlite"
  exit 1
fi

RESTORE_SOURCE="$1"
SKIP_SNAPSHOT="${2:-}"

echo "=================================================================="
echo "🚨 VAYENTRA GURUKULA DATABASE RESTORE"
echo "📅 Date: $(date)"
echo "📦 Source Backup:    ${RESTORE_SOURCE}"
echo "📍 Target Database:  ${TARGET_DB}"
echo "=================================================================="

# 1. Verify source file existence
if [ ! -f "${RESTORE_SOURCE}" ]; then
  echo "❌ Error: Backup source file does not exist: ${RESTORE_SOURCE}"
  exit 1
fi

# 2. Check SHA-256 Checksum if present
CHECKSUM_FILE="${RESTORE_SOURCE}.sha256"
if [ -f "${CHECKSUM_FILE}" ]; then
  echo "🔍 Verifying SHA-256 cryptographic checksum..."
  if command -v shasum >/dev/null 2>&1; then
    (cd "$(dirname "${RESTORE_SOURCE}")" && shasum -a 256 -c "$(basename "${CHECKSUM_FILE}")")
  else
    (cd "$(dirname "${RESTORE_SOURCE}")" && sha256sum -c "$(basename "${CHECKSUM_FILE}")")
  fi
  echo "✅ Checksum verified."
else
  echo "⚠️ Warning: No .sha256 checksum file found. Proceeding with integrity check."
fi

# 3. Verify SQLite Integrity of source backup
echo "🔍 Validating backup SQLite structure..."
INTEGRITY=$(sqlite3 "${RESTORE_SOURCE}" "PRAGMA integrity_check;")
if [ "${INTEGRITY}" != "ok" ]; then
  echo "❌ Error: Source backup file failed integrity check (${INTEGRITY}). Aborting restore."
  exit 1
fi
echo "✅ Backup file integrity is 'ok'."

# 4. Take immediate safety snapshot of current active DB
if [ -f "${TARGET_DB}" ] && [ "${SKIP_SNAPSHOT}" != "--skip-safety-snapshot" ]; then
  PRE_RESTORE_SNAPSHOT="${TARGET_DB}.pre_restore_$(date +"%Y%m%d_%H%M%S")"
  echo "💾 Creating pre-restoration snapshot of active database at ${PRE_RESTORE_SNAPSHOT}..."
  sqlite3 "${TARGET_DB}" ".backup '${PRE_RESTORE_SNAPSHOT}'"
  echo "✅ Safety snapshot created."
fi

# 5. Restore Database
echo "⏳ Applying backup to target database..."
# Clean WAL and SHM if they exist
rm -f "${TARGET_DB}-wal" "${TARGET_DB}-shm"
cp "${RESTORE_SOURCE}" "${TARGET_DB}"

# 6. Post-restore Verification
echo "🔍 Performing post-restore verification on target..."
TARGET_INTEGRITY=$(sqlite3 "${TARGET_DB}" "PRAGMA integrity_check;")
if [ "${TARGET_INTEGRITY}" != "ok" ]; then
  echo "❌ Error: Target database corrupted after restore!"
  exit 1
fi

# Set WAL mode and vacuum
sqlite3 "${TARGET_DB}" "PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; VACUUM;"

echo "=================================================================="
echo "🎉 SUCCESS: Database restoration completed safely."
echo "💡 Remember to restart the application server: pm2 restart vayentra-backend"
echo "=================================================================="
