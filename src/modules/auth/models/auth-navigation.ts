const protectedPaths = ['/agenda', '/carrito', '/perfil', '/cuenta/compras', '/cuenta/cursos', '/cuenta/favoritos', '/cuenta/editar-perfil', '/cuenta/cambiar-contrasena', '/cuenta/sesiones', '/cuenta/cerrar-sesion', '/cuenta/eliminar-cuenta', '/cuenta/notificaciones'];
export function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
// Solo destinos internos existentes; evita redirecciones externas o ciclos de acceso.
export function loginDestination(value: string | string[] | undefined): string {
  if (typeof value !== 'string' || /[\\\s#]/.test(value)) return '/perfil';
  try {
    const url = new URL(value, 'https://app.invalid');
    const existing = protectedPaths.includes(url.pathname) || ['/servicios', '/cursos'].includes(url.pathname) || /^\/productos\/[1-9]\d*$/.test(url.pathname);
    return value.startsWith('/') && url.origin === 'https://app.invalid' && existing ? `${url.pathname}${url.search}` : '/perfil';
  } catch { return '/perfil'; }
}
