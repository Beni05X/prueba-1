const assert = require('node:assert/strict');
const { test } = require('node:test');
const { AdapterError, ModelNotFoundError } = require('@/shared/adapters/adapter-error');
const { HttpError } = require('@/services/api');
const { LoadState } = require('@/shared/viewmodels/load-state');

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

test('presentation state receives internal models returned by an adapter port', async () => {
  const models = [{ id: '7', nombre: 'Tinte', precio: '150.00' }];
  const state = new LoadState([]);
  const notifications = [];
  const unsubscribe = state.subscribe(() => notifications.push(state.getSnapshot().estadoCarga));
  await state.load(async () => models);
  assert.deepEqual(state.getSnapshot(), { datos: models, estadoCarga: 'listo', error: null });
  assert.equal(state.getSnapshot().datos, models);
  assert.deepEqual(notifications, ['cargando', 'listo']);
  unsubscribe();
});

test('presentation state keeps HTTP and transformation failures distinguishable', async () => {
  const previous = [{ id: '7', nombre: 'Tinte', precio: '150.00' }];
  for (const [failure, type] of [
    [new HttpError(403, { message: 'Forbidden' }, '/api/productos'), 'http'],
    [new AdapterError('productos[0].id', 'un entero positivo'), 'adaptacion'],
    [new ModelNotFoundError('producto', '8'), 'no-encontrado'],
    [new TypeError('Network request failed'), 'otro'],
  ]) {
    const state = new LoadState(previous);
    await state.load(async () => { throw failure; });
    assert.deepEqual(state.getSnapshot(), { datos: previous, estadoCarga: 'error', error: failure.message });
    assert.equal(state.getErrorType(), type);
    await state.load(async () => []);
    assert.deepEqual(state.getSnapshot(), { datos: [], estadoCarga: 'listo', error: null });
    assert.equal(state.getErrorType(), null);
  }
});

test('presentation state ignores an older response that arrives after a newer request', async () => {
  const oldRequest = deferred();
  const newRequest = deferred();
  const state = new LoadState([]);
  const olderLoad = state.load(() => oldRequest.promise);
  const newerLoad = state.load(() => newRequest.promise);
  newRequest.resolve([{ id: '2' }]);
  await newerLoad;
  oldRequest.resolve([{ id: '1' }]);
  await olderLoad;
  assert.deepEqual(state.getSnapshot().datos, [{ id: '2' }]);
  assert.equal(state.getSnapshot().estadoCarga, 'listo');
});

test('presentation state cancellation ignores both a late response and a late abort error', async () => {
  for (const fail of [false, true]) {
    const pending = deferred();
    const state = new LoadState([{ id: 'initial' }]);
    let changes = 0;
    state.subscribe(() => { changes += 1; });
    const loading = state.load(() => pending.promise);
    state.cancel();
    if (fail) pending.reject(new DOMException('The request was aborted', 'AbortError'));
    else pending.resolve([{ id: 'late' }]);
    await loading;
    assert.deepEqual(state.getSnapshot().datos, [{ id: 'initial' }]);
    assert.equal(state.getSnapshot().error, null);
    assert.equal(changes, 1);
  }
});
