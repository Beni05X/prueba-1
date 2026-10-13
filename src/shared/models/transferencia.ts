export type DatosBancarios = Readonly<{ titular: string; banco: string; cuenta: string | null; clabe: string | null; celular: string | null }>;
export type ConfigTransferencia = Readonly<{ banco: DatosBancarios; anticipoPorcentaje: number; fuente: 'api' | 'aprobada' }>;
