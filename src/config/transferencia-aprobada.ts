import type { DatosBancarios } from '@/shared/models/transferencia';

// Fuente: SistemaBrenns/src/hooks/useSiteConfig.tsx. El usuario confirmó
// expresamente estos datos vigentes para citas y cursos el 2026-10-13.
export const bancoAprobado: DatosBancarios = Object.freeze({
  titular: 'Ruth Barrientos Angeles', banco: 'BBVA', cuenta: '154 792 8563',
  clabe: '012 290 01547928563 4', celular: '77 1748 2746',
});
// Política existente de la web de reservas; config-sitio puede actualizarla.
export const anticipoPorcentajeWeb = 50;
