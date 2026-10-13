export type CamposAutenticacion = Readonly<{
  nombre: string; correo: string; telefono: string; password: string; confirmacionPassword: string; passwordActual: string; confirmacionEliminar: string;
}>;

export type ErroresAutenticacion = Partial<Record<keyof CamposAutenticacion, string>>;
export type RegistroConfirmado = Readonly<{ message: string; requiresVerification: boolean }>;
export type NextAuthSession = Readonly<{
  expires: string;
  user: Readonly<{ id: string; name?: string | null; email: string; role?: string; telefono?: string | null }>;
}>;
