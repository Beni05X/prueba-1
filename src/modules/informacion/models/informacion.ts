export type InformacionAplicacion = Readonly<{ version: string; copyright: string; derechos: string }>;

export type DatosInformacion = Readonly<{ preguntas: readonly string[]; acerca: InformacionAplicacion }>;

export type SeccionLegal = 'privacidad' | 'terminos' | 'cancelaciones' | 'reembolsos' | 'cookies';
