import Database from 'better-sqlite3';
import path from 'path';

export interface BooliSnapshot {
  id?: number;
  date: string;
  forSale: number;
  soonToBeSold: number;
  hemnetForSale?: number;
  hemnetComing?: number;
  createdAt?: string;
}

class BooliDatabase {
  private db: Database.Database;

  constructor(dbPath: string = './data/booli.db') {
    const dir = path.dirname(dbPath);
    const fs = require('fs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        forSale INTEGER NOT NULL,
        soonToBeSold INTEGER NOT NULL,
        hemnetForSale INTEGER,
        hemnetComing INTEGER,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_date ON snapshots(date);
    `);
  }

  insertSnapshot(snapshot: BooliSnapshot): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO snapshots (date, forSale, soonToBeSold, hemnetForSale, hemnetComing)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(
      snapshot.date,
      snapshot.forSale,
      snapshot.soonToBeSold,
      snapshot.hemnetForSale || null,
      snapshot.hemnetComing || null
    );
  }

  getSnapshotsSince(startDate: string): BooliSnapshot[] {
    const stmt = this.db.prepare(`
      SELECT id, date, forSale, soonToBeSold, hemnetForSale, hemnetComing, createdAt
      FROM snapshots
      WHERE date >= ?
      ORDER BY date ASC
    `);
    return stmt.all(startDate) as BooliSnapshot[];
  }

  getAllSnapshots(): BooliSnapshot[] {
    const stmt = this.db.prepare(`
      SELECT id, date, forSale, soonToBeSold, hemnetForSale, hemnetComing, createdAt
      FROM snapshots
      ORDER BY date DESC
    `);
    return stmt.all() as BooliSnapshot[];
  }

  getLatestSnapshot(): BooliSnapshot | undefined {
    const stmt = this.db.prepare(`
      SELECT id, date, forSale, soonToBeSold, hemnetForSale, hemnetComing, createdAt
      FROM snapshots
      ORDER BY date DESC
      LIMIT 1
    `);
    return stmt.get() as BooliSnapshot | undefined;
  }

  close(): void {
    this.db.close();
  }
}

export default BooliDatabase;
