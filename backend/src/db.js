import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const here = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(here, '..', process.env.DATABASE_PATH || './data/beacon.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const native = new DatabaseSync(dbPath);
native.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
// A tiny compatibility layer keeps statements terse and transactions atomic.
export const db = {
  exec: sql => native.exec(sql),
  prepare: sql => native.prepare(sql),
  transaction: fn => (...args) => {
    native.exec('BEGIN IMMEDIATE');
    try { const result=fn(...args); native.exec('COMMIT'); return result; }
    catch(error) { native.exec('ROLLBACK'); throw error; }
  }
};
export function migrate() {
  const directory=path.resolve(here,'../migrations');
  for(const file of fs.readdirSync(directory).filter(x=>x.endsWith('.sql')).sort())db.exec(fs.readFileSync(path.join(directory,file),'utf8'));
}
