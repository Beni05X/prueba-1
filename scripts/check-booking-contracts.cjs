// Anonymous read-only inspection: no reservations, enrollments, payments or sensitive values.
const { getApiUrl } = require('@/config/api');
const paths = ['/api/config-sitio', '/api/dias-bloqueados', '/api/horarios?fecha=2026-10-14&servicioId=1', '/api/productos', '/api/cursos'];
function imageKind(value) {
  if (Array.isArray(value)) return value.length ? imageKind(value[0]) : 'absent';
  if (typeof value !== 'string' || !value) return 'absent';
  return /^https?:\/\//.test(value) ? 'absolute-http' : value.startsWith('/') ? 'relative' : 'other';
}
(async () => {
  for (const path of paths) {
    try {
      const response = await fetch(getApiUrl() + path, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
      const body = await response.json().catch(() => null);
      const bankKeys = ['banco_titular', 'banco_banco', 'banco_cuenta', 'banco_clabe', 'banco_celular'];
      const rows = path === '/api/productos' ? body : path === '/api/cursos' ? body?.cursos : null;
      const imageShapes = Array.isArray(rows) ? rows.reduce((counts, row) => { const kind = imageKind(row.imagen ?? row.imagenes); counts[kind] = (counts[kind] ?? 0) + 1; return counts; }, {}) : undefined;
      process.stdout.write(JSON.stringify({ endpoint: path.split('?')[0], status: response.status, contentType: response.headers.get('content-type'),
        ...(path === '/api/config-sitio' ? { bankKeysPresent: bankKeys.filter((key) => !!body?.[key]), hasDepositPercentage: body?.anticipo_porcentaje != null } : {}),
        ...(path === '/api/dias-bloqueados' ? { validCalendarResponse: Array.isArray(body) && body.every((row) => typeof row.fecha === 'string') } : {}),
        ...(imageShapes ? { imageShapes } : {}) }) + '\n');
    } catch (error) { process.stderr.write(JSON.stringify({ endpoint: path.split('?')[0], networkError: error.cause?.code ?? error.name }) + '\n'); process.exitCode = 1; break; }
  }
})();
