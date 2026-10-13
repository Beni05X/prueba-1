export const PRODUCTS_PAGE_SIZE = 10;
export function paginate<T>(items: readonly T[], requestedPage: number) {
  const pages = Math.max(1, Math.ceil(items.length / PRODUCTS_PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number.isFinite(requestedPage) ? Math.trunc(requestedPage) : 1));
  return { page, pages, previousDisabled: page === 1, nextDisabled: page === pages, items: items.slice((page - 1) * PRODUCTS_PAGE_SIZE, page * PRODUCTS_PAGE_SIZE) };
}
