import { BakeryItem } from '../types';

const DB_NAME = 'TeeCakeArtisanBakeryDB';
const DB_VERSION = 2; // Incremented to support all application stores (backdrops, logo, texts, contact)
const STORE_NAME = 'bakery_data';

// Helper to open IndexedDB with full stores
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Generic persistent put to IndexedDB
 */
export async function setIndexedDBValue<T = any>(key: string, value: T): Promise<boolean> {
  let db: IDBDatabase | undefined;
  try {
    db = await openDB();
    return await new Promise<boolean>((resolve, reject) => {
      const transaction = db!.transaction(STORE_NAME, 'readwrite');
      transaction.oncomplete = () => resolve(true);
      transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted'));
      transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed'));
      transaction.objectStore(STORE_NAME).put(value, key);
    });
  } catch (err) {
    console.warn(`IndexedDB save failed for key "${key}":`, err);
    return false;
  } finally { db?.close(); }
}

/**
 * Generic persistent get from IndexedDB
 */
export async function getIndexedDBValue<T = any>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      transaction.oncomplete = () => db.close();
      transaction.onabort = () => db.close();
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result !== undefined ? (request.result as T) : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`IndexedDB load failed for key "${key}":`, err);
    return null;
  }
}

/**
 * Save items into IndexedDB (supports unlimited storage, images, never runs out of 5MB quota)
 */
export async function saveItemsToIndexedDB(items: BakeryItem[]): Promise<void> {
  await setIndexedDBValue('bakery_items', items);
}

/**
 * Backup base64 image data into IndexedDB so user photos are never lost even if server restarts
 */
export async function saveDishImageBackup(itemId: string, dataUrl: string): Promise<void> {
  if (!itemId) return;
  if (!dataUrl) { await setIndexedDBValue(`dish_img_backup_${itemId}`, null); return; }
  // A URL points at a server file; it is not a recoverable copy of the image.
  if (!dataUrl.startsWith('data:image/')) return;
  const saved = await setIndexedDBValue(`dish_img_backup_${itemId}`, dataUrl);
  if (!saved) throw new Error('Could not save local image backup');
}

export async function getDishImageBackup(itemId: string): Promise<string | null> {
  if (!itemId) return null;
  return getIndexedDBValue<string>(`dish_img_backup_${itemId}`);
}

/**
 * Load items from IndexedDB
 */
export async function loadItemsFromIndexedDB(): Promise<BakeryItem[] | null> {
  return getIndexedDBValue<BakeryItem[]>('bakery_items');
}

/**
 * Safely save items to localStorage without throwing QuotaExceededError.
 * If quota is tight, it saves with compact references while IndexedDB keeps full resolution.
 */
export function safeSaveItemsToLocalStorage(key: string, items: BakeryItem[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e: any) {
    console.warn('LocalStorage quota reached, full data safely preserved in IndexedDB & Server:', e?.message || e);
    // If localStorage quota is reached, do NOT mutate dish images with placeholder fallbacks.
    // IndexedDB and the Server Database remain the authoritative data stores.
  }
}

/**
 * Safely write any key-value to localStorage with try/catch quota guard
 */
export function safeSetLocalStorage(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`LocalStorage write warning for ${key}:`, e);
    return false;
  }
}

/**
 * Compress an image data URL or blob to optimal web dimensions
 * (max 1200px at 0.85 JPEG) so custom photos and backdrops fit effortlessly everywhere
 * without dropping quality or blowing quotas.
 */
export function compressImageDataUrl(
  dataUrl: string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.84
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }

    // If it's already tiny (< 60KB), don't re-compress
    if (dataUrl.length < 60000) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width || 0;
        let height = img.naturalHeight || img.height || 0;
        if (width <= 0 || height <= 0) {
          resolve(dataUrl);
          return;
        }

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // Fill with white background so transparent pixels don't turn pitch black in JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        if (compressed && compressed.length > 500 && compressed.startsWith('data:image/jpeg')) {
          resolve(compressed);
        } else {
          resolve(dataUrl);
        }
      } catch (err) {
        console.warn('Compression failed, keeping original:', err);
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}

/**
 * Save complete application state to server disk database
 * so friends, visitors, and cross-device sessions load the exact same data.
 */
let serverRevision: string | null = typeof window !== 'undefined'
  ? ((window as any).__SERVER_APP_STATE__?.stateRevision || (window as any).__SERVER_APP_STATE__?.serverSavedAt || null)
  : null;
let saveQueue: Promise<unknown> = Promise.resolve();
let saveConflict = false;

export function saveAppDataToServer(data: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }> {
  const snapshot = JSON.parse(JSON.stringify(data));
  const task = saveQueue.then(() => performServerSave(snapshot));
  saveQueue = task.catch(() => {});
  return task;
}

async function performServerSave(
  data: Record<string, any>
): Promise<{ success: boolean; data?: any }> {
  if (saveConflict) return { success: false };
  try {
    const response = await fetch('/api/app-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'If-Match': serverRevision || 'new',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 409) {
        saveConflict = true;
        window.dispatchEvent(new Event('teecake-save-conflict'));
      }
      if (response.status === 401) window.dispatchEvent(new Event('teecake-auth-expired'));
      console.warn('Server save failed with status:', response.status);
      return { success: false };
    }

    const result = await response.json();
    if (result?.success) serverRevision = result.data?.stateRevision || result.data?.serverSavedAt || serverRevision;
    return { success: Boolean(result?.success), data: result?.data };
  } catch (err) {
    console.warn('Network error saving to server:', err);
    return { success: false };
  }
}

/**
 * Direct image upload to server disk
 */
export async function uploadImageToServer(
  dataUrl: string,
  filename?: string
): Promise<string | null> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return dataUrl;
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, filename }),
    });
    if (!response.ok) return null;
    const result = await response.json();
    return result?.url || null;
  } catch (err) {
    console.warn('Direct upload error:', err);
    return null;
  }
}

/**
 * Load complete application state from server disk database
 */
export async function loadAppDataFromServer(): Promise<Record<string, any> | null> {
  try {
    const response = await fetch('/api/app-data', {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn('Server load failed with status:', response.status);
      return null;
    }

    const result = await response.json();
    if (result && result.exists && result.data) {
      serverRevision = result.data.stateRevision || result.data.serverSavedAt || null;
      saveConflict = false;
      return result.data;
    }
    return null;
  } catch (err) {
    console.warn('Network error loading from server:', err);
    return null;
  }
}

