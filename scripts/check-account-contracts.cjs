// Read-only anonymous probe. No account credentials, cookies or user data are logged.
const { getApiUrl } = require('@/config/api');
const paths = ['/api/auth/session', '/api/usuario/perfil', '/api/carrito', '/api/citas', '/api/mis-cursos', '/api/favoritos', '/api/favoritos-servicios', '/api/favoritos-cursos', '/api/pedidos', '/api/usuario/recordatorios'];
(async () => {
  for (const path of paths) {
    try {
      const response = await fetch(getApiUrl() + path, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
      const body = await response.json().catch(() => null);
      process.stdout.write(JSON.stringify({ endpoint: path, status: response.status, contentType: response.headers.get('content-type'), ...(path === '/api/auth/session' ? { hasUser: !!body?.user } : {}) }) + '\n');
    } catch (error) { process.stderr.write(JSON.stringify({ endpoint: path, networkError: error.cause?.code ?? error.name }) + '\n'); process.exitCode = 1; break; }
  }
})();
