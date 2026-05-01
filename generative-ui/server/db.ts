import { DatabaseSync } from "node:sqlite";

export function initDB(dbPath: string): DatabaseSync {
    console.log("Initializing DB");
    const db = new DatabaseSync(dbPath);
    const query = `
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL
    )
    `;
    db.exec(query);
    console.log("DB initialized");
    return db;
}