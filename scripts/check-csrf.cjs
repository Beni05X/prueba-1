// Anonymous HTTP probe of the app's parser/service. Node is NOT a mobile runtime.
// Does not accept credentials, persist cookies or print sensitive response bodies.
const { getApiUrl } = require('@/config/api');
const { FetchHttpClient } = require('@/services/api');
const { NextAuthSessionService } = require('@/modules/auth/services/next-auth-session-service');

let savedCsrf = null;
const storage = {
  isWeb: async () => false, // Exercise the readable native cookie path under Node.
  platform: async () => 'node (not Android/iOS)',
  read: async () => null,
  write: async () => { throw new Error('Anonymous probe must not store a session'); },
  clear: async () => {},
  readCsrf: async () => savedCsrf,
  writeCsrf: async (pair) => { savedCsrf = pair; },
};
const service = new NextAuthSessionService(new FetchHttpClient(getApiUrl), storage, getApiUrl);
service.verifyCsrfTransport().then((result) => {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}).catch((error) => {
  // Avoid printing backend bodies or arbitrary error messages.
  process.stderr.write(`${JSON.stringify({ probe: 'failed', code: error.code ?? error.name, status: error.status, endpoint: error.path, csrf: service.csrfDiagnostics() }, null, 2)}\n`);
  process.exitCode = 1;
}).finally(() => { savedCsrf = null; });
