#!/bin/bash

set -e

DB_FILE="defi.db"
SQL_FILE="insert_data.sql"

sqlite3 "$DB_FILE" <<EOF
CREATE TABLE IF NOT EXISTS protocol_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  protocol TEXT NOT NULL,
  chain TEXT NOT NULL,
  total_value_locked_usd REAL NOT NULL,
  daily_volume_usd REAL NOT NULL,
  active_users INTEGER NOT NULL,
  token TEXT NOT NULL
);
EOF

# checking
if [ -f "$SQL_FILE" ]; then
  sqlite3 "$DB_FILE" < "$SQL_FILE"
  echo "✔ Data inserted from $SQL_FILE"
else
  echo "⚠ $SQL_FILE not found. Skipping data insert."
fi

echo "✔ Database initialized."
