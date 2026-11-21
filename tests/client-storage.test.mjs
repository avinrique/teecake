import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setIndexedDBValue, saveDishImageBackup, getDishImageBackup } from '../src/utils/persistentStorage.ts';

// Model request success followed by transaction commit/abort: browsers can
// acknowledge a put before its transaction ultimately fails.
function database({ abort = false } = {}) {
  const values = new Map();
  const db = {
    close() {},
    transaction() {
      const tx = { error: new Error('Transaction aborted'), objectStore: () => ({
        put(value, key) {
          const request = {};
          queueMicrotask(() => {
            request.onsuccess?.();
            queueMicrotask(() => {
              if (abort) tx.onabort?.();
              else { values.set(key, value); tx.oncomplete?.(); }
            });
          });
          return request;
        },
        get(key) {
          const request = {};
          queueMicrotask(() => { request.result = values.get(key); request.onsuccess?.(); tx.oncomplete?.(); });
          return request;
        },
      }) };
      return tx;
    },
  };
  globalThis.window = { indexedDB: { open() { const request = {}; queueMicrotask(() => { request.result = db; request.onsuccess(); }); return request; } } };
}

test('saving a server URL cannot overwrite the actual image backup', async () => {
  database();
  await saveDishImageBackup('cake', 'data:image/png;base64,YQ==');
  await saveDishImageBackup('cake', '/uploads/cake.png');
  assert.equal(await getDishImageBackup('cake'), 'data:image/png;base64,YQ==');
});
test('IndexedDB save reports aborted transactions instead of claiming success', async (context) => {
  context.mock.method(console, 'warn', () => {});
  database({ abort: true });
  assert.equal(await setIndexedDBValue('cake', 'photo'), false);
});
