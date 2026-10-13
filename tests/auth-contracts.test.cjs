const assert = require('node:assert/strict');
const { test } = require('node:test');
const { HttpAuthService } = require('@/modules/auth/services/auth-service');
const { registroRequest, registroResponse } = require('@/modules/auth/adapters/auth-adapter');
const { camposIniciales } = require('@/modules/auth/viewmodels/autenticacion-state');
const { validarRegistro, validarAcceso, SubmissionGate } = require('@/modules/auth/viewmodels/auth-validation');
const { loginDestination } = require('@/modules/auth/models/auth-navigation');
const { FetchHttpClient } = require('@/services/api');
// Fixtures locales: no se envían formularios al backend real.
const fields = { ...camposIniciales, nombre: " Ana O'Neil ", correo: ' ana@example.invalid ', telefono: '+52 555 123 4567', password: 'Prueba#2026', confirmacionPassword: 'Prueba#2026' };

test('registration maps only confirmed fields and accepts legitimate apostrophes/hash characters', () => {
  assert.deepEqual(registroRequest(fields), { name: "Ana O'Neil", email: 'ana@example.invalid', telefono: '+52 555 123 4567', password: 'Prueba#2026' });
  assert.deepEqual(validarRegistro(fields), {});
  assert.ok(!('role' in registroRequest(fields)));
  assert.ok(!('confirmacionPassword' in registroRequest(fields)));
});
test('forms validate email/password and registration phone, minimum password and confirmation', () => {
  assert.deepEqual(Object.keys(validarRegistro(camposIniciales)).sort(), ['confirmacionPassword', 'correo', 'nombre', 'password', 'telefono']);
  assert.ok(validarRegistro({ ...fields, confirmacionPassword: 'otra' }).confirmacionPassword);
  assert.ok(validarAcceso({ ...fields, correo: 'incorrecto' }).correo);
  assert.deepEqual(validarAcceso({ ...fields, password: 'a' }), {});
});
test('an enabled contract accepts only server-confirmed 201 creation', async () => {
  let body;
  const http = new FetchHttpClient(() => 'https://example.invalid', async (_url, options) => {
    body = JSON.parse(options.body);
    return new Response('{"message":"Revisa tu correo","requiresVerification":true}', { status: 201 });
  });
  const result = await new HttpAuthService(http).registrar(fields);
  assert.deepEqual(body, registroRequest(fields));
  assert.equal(result.requiresVerification, true);
  for (const [payload, status] of [[{}, 201], [{ message: 'ok', requiresVerification: true }, 200], [{ message: 'ok' }, 201]]) assert.throws(() => registroResponse(payload, status));
});
test('registration preserves invalid, duplicate, rate-limit and server errors', async () => {
  for (const status of [400, 409, 429, 500]) {
    const http = new FetchHttpClient(() => 'https://example.invalid', async () => new Response(JSON.stringify({ error: `Servidor ${status}` }), { status }));
    await assert.rejects(new HttpAuthService(http).registrar(fields), (error) => error.message === `Servidor ${status}`);
  }
});
test('resend uses the confirmed endpoint/body and requires ok true', async () => {
  let request;
  const http = new FetchHttpClient(() => 'https://example.invalid', async (url, options) => {
    request = { url, body: JSON.parse(options.body) };
    return new Response('{"ok":true}');
  });
  await new HttpAuthService(http).reenviarVerificacion(fields.correo);
  assert.equal(request.url, 'https://example.invalid/api/auth/reenviar-verificacion');
  assert.deepEqual(request.body, { correo: 'ana@example.invalid' });
  const invalid = new FetchHttpClient(() => 'https://example.invalid', async () => new Response('{}'));
  await assert.rejects(new HttpAuthService(invalid).reenviarVerificacion(fields.correo));
});
test('submission gate prevents simultaneous requests and releases after errors', async () => {
  const gate = new SubmissionGate();
  let release;
  let calls = 0;
  const pending = gate.run(async () => { calls++; await new Promise((resolve) => { release = resolve; }); });
  await gate.run(async () => { calls++; });
  assert.equal(calls, 1);
  release();
  await pending;
  await assert.rejects(gate.run(async () => { throw new Error('rejected'); }));
  await gate.run(async () => { calls++; });
  assert.equal(calls, 2);
});
test('login returns only to existing internal protected routes, preserving the query', () => {
  assert.equal(loginDestination('/agenda?filtro=proximas'), '/agenda?filtro=proximas');
  assert.equal(loginDestination('/cuenta/compras'), '/cuenta/compras');
  for (const path of ['https://evil.invalid', '//evil.invalid', '/autenticacion', '/agenda/../autenticacion', '/agenda/%2e%2e', '/agenda\\evil', '/agenda/desconocida', ['/agenda']]) assert.equal(loginDestination(path), '/perfil');
});

test('recovery/reset/verification requests use exact contracts and require confirmed ok', async () => {
  const requests = [];
  const http = new FetchHttpClient(() => 'https://example.invalid', async (url, options) => {
    requests.push({ url, options });
    return new Response('{"ok":true}');
  });
  const service = new HttpAuthService(http);
  await service.recuperarContrasena(' ana@example.invalid ');
  await service.restablecerContrasena('local-test-token', 'Prueba#2026');
  await service.verificarCorreo('local-test-token/+');
  assert.equal(requests[0].url, 'https://example.invalid/api/auth/recuperar-contrasena');
  assert.deepEqual(JSON.parse(requests[0].options.body), { correo: 'ana@example.invalid' });
  assert.equal(requests[1].url, 'https://example.invalid/api/auth/reset-contrasena');
  assert.deepEqual(JSON.parse(requests[1].options.body), { token: 'local-test-token', password: 'Prueba#2026' });
  assert.equal(requests[2].url, 'https://example.invalid/api/auth/verificar-email?token=local-test-token%2F%2B');
  assert.equal(requests[2].options.method, 'GET');
  assert.equal(requests[2].options.body, undefined);
  const invalid = new HttpAuthService(new FetchHttpClient(() => 'https://example.invalid', async () => new Response('{}')));
  await assert.rejects(invalid.recuperarContrasena(fields.correo));
  await assert.rejects(invalid.restablecerContrasena('local-token', fields.password));
  await assert.rejects(invalid.verificarCorreo('local-token'));
});

test('registration RASP rejection is reported without disabling recovery or altering the password', async () => {
  const { authErrorMessage } = require('@/modules/auth/adapters/auth-error-adapter');
  const requests = [];
  const http = new FetchHttpClient(() => 'https://example.invalid', async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    return url.endsWith('/register') ? new Response('{"error":"Actividad maliciosa detectada y bloqueada por RASP"}', { status: 403 }) : new Response('{"ok":true}');
  });
  const service = new HttpAuthService(http);
  await assert.rejects(service.registrar(fields), (error) => {
    assert.equal(error.operation, 'Registro');
    assert.equal(error.status, 403);
    assert.equal(error.path, '/api/auth/register');
    assert.ok(authErrorMessage(error).includes('HTTP 403'));
    return error.message.includes('RASP');
  });
  assert.equal(requests[0].body.password, fields.password);
  await service.recuperarContrasena(fields.correo);
  await service.reenviarVerificacion(fields.correo);
  assert.equal(requests.length, 3);
});

test('each public auth failure identifies its operation and hides verification tokens', async () => {
  const { authErrorMessage } = require('@/modules/auth/adapters/auth-error-adapter');
  const token = 'test-secret-token-not-to-display';
  const service = new HttpAuthService(new FetchHttpClient(() => 'https://example.invalid', async () => new Response('{"error":"El enlace expiró","code":"TOKEN_EXPIRED"}', { status: 400 })));
  await assert.rejects(service.verificarCorreo(token), (error) => {
    assert.equal(error.path, '/api/auth/verificar-email');
    assert.equal(error.code, 'TOKEN_EXPIRED');
    assert.equal(error.operation, 'Verificación de correo');
    assert.ok(!authErrorMessage(error).includes(token));
    return true;
  });
  for (const [status, operation] of [[429, 'Recuperación'], [500, 'Reenvío de verificación']]) {
    const failing = new HttpAuthService(new FetchHttpClient(() => 'https://example.invalid', async () => new Response('{"error":"Respuesta del servidor"}', { status })));
    await assert.rejects(operation === 'Recuperación' ? failing.recuperarContrasena(fields.correo) : failing.reenviarVerificacion(fields.correo), (error) => error.status === status && error.operation === operation);
  }
});

test('recovery validates email independently of passwords and reset requires matching passwords', () => {
  const { validarCorreo, validarNuevaContrasena } = require('@/modules/auth/viewmodels/auth-validation');
  assert.deepEqual(validarCorreo(fields.correo), {});
  assert.ok(validarCorreo('incorrecto').correo);
  assert.deepEqual(validarNuevaContrasena(fields), {});
  assert.ok(validarNuevaContrasena({ ...fields, confirmacionPassword: 'otra' }).confirmacionPassword);
});

