/** A successful transport can still contain data that violates its contract. */
export class AdapterError extends Error {
  readonly name = 'AdapterError';

  constructor(readonly path: string, readonly expected: string) {
    super(`Datos externos inválidos en ${path}: se esperaba ${expected}.`);
  }
}

export class ModelNotFoundError extends Error {
  readonly name = 'ModelNotFoundError';

  constructor(readonly entity: string, readonly id: string) {
    super(`No se encontró ${entity} con identificador ${id}.`);
  }
}
