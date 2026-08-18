import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DB_PATH = './backend/store.db';
const BACKUP_DIR = './backups';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const BACKUP_PATH = join(BACKUP_DIR, `store-${timestamp}.db`);

if (!existsSync(BACKUP_DIR)) {
  mkdirSync(BACKUP_DIR, { recursive: true });
}

if (existsSync(DB_PATH)) {
  copyFileSync(DB_PATH, BACKUP_PATH);
  console.log(`Backup created: ${BACKUP_PATH}`);
} else {
  console.error('Database file not found');
  process.exit(1);
}
