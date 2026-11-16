#!/usr/bin/env bash
# ==============================================================================
# VAYENTRA GURUKULA - SQLITE ZERO-DOWNTIME ONLINE BACKUP SCRIPT
# DPDP Act 2023 Compliant • WAL Safe • SHA-256 Checksummed • 30-Day Retention
# ==============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

DB_FILE="${PROJECT_ROOT}/server/db/vayentra.sqlite"
BACKUP_DIR="${BACKUP_DIR:-${PROJECT_ROOT}/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/vayentra_backup_${TIMESTAMP}.sqlite"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"

mkdir -p "${BACKUP_DIR}"

echo "=================================================================="
echo "🛡️  VAYENTRA GURUKULA DATABASE BACKUP"
echo "📅 Date: $(date)"
echo "📍 Source Database: ${DB_FILE}"
echo "📦 Target Backup:   ${BACKUP_FILE}"
echo "=================================================================="

# Check source database existence
if [ ! -f "${DB_FILE}" ]; then
  echo "❌ Error: Source database not found at ${DB_FILE}"
  exit 1
fi

# Perform hot online backup using SQLite's native backup API (WAL safe)
echo "⏳ Performing zero-downtime hot backup..."
sqlite3 "${DB_FILE}" ".backup '${BACKUP_FILE}'"

# Verify backup integrity
echo "🔍 Verifying backup integrity check..."
INTEGRITY=$(sqlite3 "${BACKUP_FILE}" "PRAGMA integrity_check;")
if [ "${INTEGRITY}" != "ok" ]; then
  echo "❌ Backup integrity check failed: ${INTEGRITY}"
  rm -f "${BACKUP_FILE}"
  exit 1
fi

FK_CHECK=$(sqlite3 "${BACKUP_FILE}" "PRAGMA foreign_key_check;")
if [ -n "${FK_CHECK}" ]; then
  echo "⚠️ Warning: Foreign key violations detected in backup: ${FK_CHECK}"
fi

# Generate SHA-256 Checksum for DPDP audit compliance
echo "🔒 Computing SHA-256 checksum..."
if command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "${BACKUP_FILE}" > "${CHECKSUM_FILE}"
else
  sha256sum "${BACKUP_FILE}" > "${CHECKSUM_FILE}"
fi

FILE_SIZE=$(ls -lh "${BACKUP_FILE}" | awk '{print $5}')
echo "✅ Backup successfully created and verified (${FILE_SIZE})."
echo "📜 Checksum: $(cat "${CHECKSUM_FILE}")"

# Rotate old backups (Keep last 30 days)
echo "🧹 Pruning backups older than 30 days..."
find "${BACKUP_DIR}" -type f -name "vayentra_backup_*.sqlite*" -mtime +30 -exec rm -f {} +

echo "🎉 Backup workflow complete."
