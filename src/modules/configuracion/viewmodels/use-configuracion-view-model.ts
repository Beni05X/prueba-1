import { APARIENCIAS, accesosConfiguracion, type EstadoConfiguracion } from '@/modules/configuracion/viewmodels/configuracion-state';
import { useThemePreferences } from '@/theme/theme-preference-provider';

export function useConfiguracionViewModel(section = 'principal') {
  const preferences = useThemePreferences();
  const estado: EstadoConfiguracion = { datos: accesosConfiguracion, estadoCarga: 'listo', error: null, apariencia: preferences.appearance };
  async function seleccionarApariencia(value: string) {
    const option = APARIENCIAS.find((item) => item.label === value);
    if (option) await preferences.setAppearance(option.label);
  }
  return {
    section, estado, cargando: estado.estadoCarga === 'cargando', error: estado.error,
    preferencias: estado.datos.preferencias, seguridad: estado.datos.seguridad,
    apariencias: APARIENCIAS, appearance: estado.apariencia, setAppearance: seleccionarApariencia,
  };
}
