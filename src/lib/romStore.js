
const DB_NAME = 'sopra_roms_v1';
const DB_VERSION = 1;
const STORE = 'roms';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'path' });
        store.createIndex('byOwner', 'owner', { unique: false });
        store.createIndex('byPrefix', 'prefix', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db, mode = 'readonly') {
  return db.transaction(STORE, mode).objectStore(STORE);
}

export async function putRom({ path, owner, file, meta }) {
  const db = await openDb();
  const store = tx(db, 'readwrite');
  const prefix = `u/${owner}/`;
  const record = {
    path,
    owner,
    prefix,
    meta: meta || { name: file.name, size: file.size, type: file.type, lastModified: file.lastModified },
    blob: file,
    createdAt: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const req = store.put(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export async function getRom(path) {
  const db = await openDb();
  const store = tx(db, 'readonly');
  return new Promise((resolve, reject) => {
    const req = store.get(path);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function listRomsByOwner(owner) {
  const db = await openDb();
  const store = tx(db, 'readonly');
  const idx = store.index('byOwner');
  return new Promise((resolve, reject) => {
    const req = idx.getAll(owner);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteRom(path) {
  const db = await openDb();
  const store = tx(db, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = store.delete(path);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}
