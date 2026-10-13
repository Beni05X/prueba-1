/** JSON values returned by Prisma fields whose schema does not constrain their shape. */
export type JsonValue = null | boolean | number | string | readonly JsonValue[] | { readonly [key: string]: JsonValue };
