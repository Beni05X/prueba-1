// La referencia estática permite que Expo incluya el valor público en el bundle.
export function getApiUrl(): string {
  const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const invalidConfiguration = () => new Error(
    'Define EXPO_PUBLIC_API_URL con la URL raíz HTTP(S) confirmada de la API, sin /api, credenciales, consulta ni fragmento.',
  );
  if (!configuredApiUrl || !/^https?:\/\//i.test(configuredApiUrl)) {
    throw invalidConfiguration();
  }
  let url: URL;
  try {
    url = new URL(configuredApiUrl);
  } catch {
    throw invalidConfiguration();
  }
  if (!url.hostname || url.username || url.password || url.search || url.hash ||
      /[\s\\?#]/.test(configuredApiUrl) || url.pathname.replace(/\/+$/, '') !== '') {
    throw invalidConfiguration();
  }
  return configuredApiUrl.replace(/\/+$/, '');
}
