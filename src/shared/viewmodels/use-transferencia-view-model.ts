import { useCallback } from 'react';
import { HttpTransferenciaService } from '../services/transferencia-service';
import { useSessionResource } from './use-session-resource';
const service = new HttpTransferenciaService();
export function useTransferenciaViewModel() { return useSessionResource(useCallback((signal?: AbortSignal) => service.obtener({ signal }), [])); }
