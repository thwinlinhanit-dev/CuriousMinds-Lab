import * as schema from "./schema";
import path from "path";
import fs from "fs";
import { createRequire } from "module";

// Resilient DB layer: tries better-sqlite3, falls back to JSON-file store
// so the app always runs (even if native module can't build on Windows).

const require = createRequire(import.meta.url);

let db: any;
let sqlite: any = null;
let useFallback = false;

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "curious-minds.db");
const FALLBACK_PATH = path.join(DATA_DIR, "fallback.json");

function loadFallback(): Record<string, any[]> {
  try {
    if (fs.existsSync(FALLBACK_PATH)) {
      return JSON.parse(fs.readFileSync(FALLBACK_PATH, "utf-8"));
    }
  } catch {}
  return {};
}
function saveFallback(data: Record<string, any[]>) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FALLBACK_PATH, JSON.stringify(data, null, 2));
  } catch {}
}

try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const Database = require("better-sqlite3");
  sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const { drizzle } = require("drizzle-orm/better-sqlite3");
  db = drizzle(sqlite, { schema });
} catch (e) {
  console.warn("[db] better-sqlite3 unavailable, using JSON fallback store:", (e as Error).message);
  useFallback = true;
  const store = loadFallback();

  db = new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === "_isFallback") return true;
        if (prop === "_store") return store;
        return undefined;
      },
    }
  );
}

export { db, sqlite, useFallback };
export type DB = typeof db;
