import { record, list, identifier, text } from '@/shared/adapters/validation';
export function preguntasResponse(value: unknown) {
  return list(value, 'faq').map((value) => { const dto = record(value, 'faq'); return { id: identifier(dto.id, 'faq.id'), pregunta: text(dto.pregunta, 'faq.pregunta'), respuesta: text(dto.respuesta, 'faq.respuesta') }; });
}
export function contactoResponse(value: unknown): string | null {
  const dto = record(value, 'config-sitio');
  for (const [key, value] of Object.entries(dto)) text(value, 'config-sitio.' + key);
  const raw = dto.red_whatsapp;
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try { const url = new URL(raw); return url.protocol === 'https:' && ['api.whatsapp.com', 'wa.me', 'www.whatsapp.com'].includes(url.hostname) ? url.toString() : null; } catch { return null; }
}
