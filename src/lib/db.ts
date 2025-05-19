import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'defi.db'), { verbose: console.log });

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS protocol_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    protocol TEXT NOT NULL,
    chain TEXT NOT NULL,
    total_value_locked_usd REAL NOT NULL,
    daily_volume_usd REAL NOT NULL,
    active_users INTEGER NOT NULL,
    token TEXT NOT NULL
  )
`);

export function getMetrics() {
  return db.prepare(`
    SELECT * FROM protocol_metrics 
    ORDER BY timestamp DESC
  `).all();
}

export function getTVLByProtocol() {
  return db.prepare(`
    SELECT protocol, SUM(total_value_locked_usd) as tvl
    FROM protocol_metrics
    GROUP BY protocol
  `).all();
}

export function getVolumeByChain() {
  return db.prepare(`
    SELECT chain, SUM(daily_volume_usd) as volume
    FROM protocol_metrics
    GROUP BY chain
  `).all();
}

export default db;
