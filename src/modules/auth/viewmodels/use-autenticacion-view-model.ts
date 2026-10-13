import { useRef, useState } from 'react';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import type { CamposAutenticacion, ErroresAutenticacion, RegistroConfirmado } from '../models/autenticacion';
import { camposIniciales, SECCIONES_AUTENTICACION, type EstadoAutenticacion } from './autenticacion-state';
import { useAuthSession } from './auth-session-provider';
import { SubmissionGate, validarAcceso, validarCorreo, validarRegistro, validarNuevaContrasena } from './auth-validation';
import { authError, authErrorMessage } from '../adapters/auth-error-adapter';
import { loginDestination } from '../models/auth-navigation';
import { authService } from '../services/auth-service';

export function useAutenticacionViewModel(seccion = 'login') {
  const auth = useAuthSession();
  const params = useLocalSearchParams<{ returnTo?: string | string[]; token?: string | string[] }>();
  const destino = loginDestination(params.returnTo);
  const token = typeof params.token === 'string' ? params.token : '';
  const section = SECCIONES_AUTENTICACION.find((item) => item === seccion) ?? 'login';
  const [estado, setEstado] = useState<EstadoAutenticacion>({ datos: camposIniciales, estadoCarga: 'listo', error: null });
  const [erroresCampos, setErroresCampos] = useState<ErroresAutenticacion>({});
  const [visibilidad, setVisibilidad] = useState({ password: false, confirmacionPassword: false, passwordActual: false });
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [registro, setRegistro] = useState<RegistroConfirmado | null>(null);
  const [correoVerificacion, setCorreoVerificacion] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [completado, setCompletado] = useState(false);
  const [operacionPendiente, setOperacionPendiente] = useState<string | null>(null);
  const gate = useRef(new SubmissionGate());
  const cargando = estado.estadoCarga === 'cargando';

  function cambiarCampo(campo: keyof CamposAutenticacion, valor: string) {
    setEstado((current) => ({ ...current, error: null, datos: { ...current.datos, [campo]: valor } }));
    setErroresCampos((current) => ({ ...current, [campo]: undefined }));
    if (campo === 'correo' && section === 'login') setCorreoVerificacion(null);
  }
  function limpiarSecretos() {
    setVisibilidad({ password: false, confirmacionPassword: false, passwordActual: false });
    setEstado((current) => ({ ...current, datos: { ...current.datos, password: '', confirmacionPassword: '', passwordActual: '' } }));
  }
  function validar(errors: ErroresAutenticacion): boolean {
    setErroresCampos(errors);
    return Object.keys(errors).length === 0;
  }
  async function ejecutar(operation: string, action: () => Promise<void>) {
    await gate.current.run(async () => {
      setEstado((current) => ({ ...current, estadoCarga: 'cargando', error: null }));
      setOperacionPendiente(operation);
      setMensaje(null);
      try {
        await action();
        setEstado((current) => ({ ...current, estadoCarga: 'listo', error: null }));
      } catch (failure) {
        const error = authError(failure, operation);
        if (operation === 'Acceso' && error.code === 'EMAIL_NOT_VERIFIED') setCorreoVerificacion(estado.datos.correo.trim());
        setEstado((current) => ({ ...current, estadoCarga: 'error', error: authErrorMessage(error) }));
      } finally { setOperacionPendiente(null); }
    });
  }
  async function iniciarSesion() {
    if (!validar(validarAcceso(estado.datos))) return;
    await ejecutar('Acceso', async () => {
      await auth.signIn(estado.datos.correo, estado.datos.password);
      limpiarSecretos();
      router.replace(destino as Href);
    });
  }
  async function crearCuenta() {
    if (!validar(validarRegistro(estado.datos))) return;
    if (!aceptaTerminos) { setEstado((current) => ({ ...current, error: 'Registro: acepta los Términos y el Aviso de privacidad para continuar.' })); return; }
    await ejecutar('Registro', async () => {
      const confirmado = await authService.registrar(estado.datos);
      setRegistro(confirmado);
      if (confirmado.requiresVerification) setCorreoVerificacion(estado.datos.correo.trim());
      limpiarSecretos();
    });
  }
  async function recuperarContrasena() {
    if (!validar(validarCorreo(estado.datos.correo))) return;
    await ejecutar('Recuperación', async () => {
      await authService.recuperarContrasena(estado.datos.correo);
      setMensaje('Recuperación: si existe una cuenta con ese correo, recibirás un enlace. Revisa también spam.');
    });
  }
  async function reenviarVerificacion() {
    const correo = correoVerificacion ?? estado.datos.correo;
    if (!validar(validarCorreo(correo))) return;
    await ejecutar('Reenvío de verificación', async () => {
      await authService.reenviarVerificacion(correo);
      setMensaje('Reenvío: si tu cuenta requiere verificación, recibirás un enlace por correo. Revisa también spam.');
    });
  }
  async function restablecerContrasena() {
    if (!validar(validarNuevaContrasena(estado.datos))) return;
    if (!token) { setEstado((current) => ({ ...current, error: 'Restablecimiento: abre el enlace recibido por correo para continuar.' })); return; }
    await ejecutar('Restablecimiento', async () => {
      await authService.restablecerContrasena(token, estado.datos.password);
      limpiarSecretos();
      setCompletado(true);
      setMensaje('Restablecimiento: el servidor confirmó la nueva contraseña. Ya puedes iniciar sesión.');
    });
  }
  async function verificarCorreo() {
    if (!token) { setEstado((current) => ({ ...current, error: 'Verificación: abre el enlace recibido por correo para continuar.' })); return; }
    await ejecutar('Verificación de correo', async () => {
      await authService.verificarCorreo(token);
      setCompletado(true);
      setMensaje('Verificación: el servidor confirmó tu correo. Ya puedes iniciar sesión.');
    });
  }
  async function cerrarSesion() {
    await ejecutar('Cierre de sesión', async () => { await auth.signOut(); limpiarSecretos(); router.replace('/'); });
  }
  async function cambiarContrasena() {
    if (auth.status !== 'authenticated') { setEstado((current) => ({ ...current, error: 'Cambio de contraseña: inicia sesión para continuar.' })); return; }
    const errors = validarNuevaContrasena(estado.datos);
    if (!estado.datos.passwordActual) errors.passwordActual = 'Ingresa tu contraseña actual.';
    if (!validar(errors)) return;
    await ejecutar('Cambio de contraseña', async () => {
      await auth.changePassword(estado.datos.passwordActual, estado.datos.password);
      limpiarSecretos();
      setMensaje('Cambio de contraseña: el servidor confirmó la actualización.');
    });
  }
  return {
    section, estado, campos: estado.datos, erroresCampos, cargando, operacionPendiente,
    error: estado.error ?? (section === 'login' ? auth.error : null), mensaje, completado, tieneToken: !!token,
    registro, correoVerificacion,
    aceptaTerminos, cambiarAceptaTerminos: () => setAceptaTerminos((value) => !value),
    visibilidad, alternarVisibilidad: (campo: keyof typeof visibilidad) => setVisibilidad((value) => ({ ...value, [campo]: !value[campo] })),
    loginHref: { pathname: '/autenticacion' as const, params: { returnTo: destino } },
    registroHref: { pathname: '/cuenta/[seccion]' as const, params: { seccion: 'crear-cuenta', returnTo: destino } },
    recuperarHref: { pathname: '/cuenta/[seccion]' as const, params: { seccion: 'recuperar-contrasena', returnTo: destino } },
    iniciarSesion, crearCuenta, recuperarContrasena, restablecerContrasena, verificarCorreo, reenviarVerificacion, cerrarSesion, cambiarContrasena,
    cambiarNombre: (valor: string) => cambiarCampo('nombre', valor),
    cambiarCorreo: (valor: string) => cambiarCampo('correo', valor),
    cambiarTelefono: (valor: string) => cambiarCampo('telefono', valor),
    cambiarPassword: (valor: string) => cambiarCampo('password', valor),
    cambiarConfirmacionPassword: (valor: string) => cambiarCampo('confirmacionPassword', valor),
    cambiarPasswordActual: (valor: string) => cambiarCampo('passwordActual', valor),
    cambiarConfirmacionEliminar: (valor: string) => cambiarCampo('confirmacionEliminar', valor),
  };
}
