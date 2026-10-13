const { HttpProductosService } = require('@/modules/productos/services/productos-service');
const { HttpServiciosService } = require('@/modules/servicios/services/servicios-service');
const { HttpCursosService } = require('@/modules/cursos/services/cursos-service');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { AdapterError, ModelNotFoundError } = require('@/shared/adapters/adapter-error');
const { FetchHttpClient, HttpError } = require('@/services/api');
const { adaptCursoDto, adaptCursosRespuesta } = require('@/modules/cursos/adapters/cursos-adapter');
const { adaptServicioDto, adaptServiciosRespuesta, adaptServicioDetalle } = require('@/modules/servicios/adapters/servicios-adapter');
const { adaptProductoDto, adaptProductosRespuesta } = require('@/modules/productos/adapters/productos-adapter');
const { ComposedCatalogoService } = require('@/modules/catalogo/services/catalogo-service');
const { CatalogoViewModel } = require('@/modules/catalogo/viewmodels/catalogo-view-model');
const { CursosViewModel } = require('@/modules/cursos/viewmodels/cursos-view-model');
const { ServiciosViewModel } = require('@/modules/servicios/viewmodels/servicios-view-model');
const { filterProductos, opcionesFiltroProductos } = require('@/modules/productos/viewmodels/product-filters');

// Representative fixtures follow the source-verified public contracts documented
// in docs/endpoints-api.md. They are not claimed to be production responses.
const cursoDto = {
  id: 7,
  titulo: 'Curso de especialización',
  descripcion: null,
  precio_total: '1200.00',
  duracion_horas: 20,
  nivel: null,
  fecha_inicio: '2026-09-30T00:00:00.000Z',
  fecha_fin: null,
};
const cursoModel = {
  imagen: null, cupoMaximo: null, inscritos: null,
  id: '7',
  nombre: 'Curso de especialización',
  descripcion: null,
  precio: '1200.00',
  duracionHoras: 20,
  nivel: null,
  fechaInicio: '2026-09-30',
  fechaFin: null,
};
const servicioDto = {
  id: 5,
  nombre: 'Corte',
  imagen: null,
  duracion: '1 hora',
  precio_min: 200,
  disponible: true,
  categoria: 'Cabello',
};
const servicioDetalleDto = {
  id: 5,
  nombre: 'Corte',
  imagen: null,
  duracion: '1 hora',
  precio: 200,
};
const servicioModel = { id: '5', nombre: 'Corte', precio: '200', duracionTexto: '1 hora', imagen: null, categoria: 'Cabello', disponible: true };
const servicioDetalleModel = { id: '5', nombre: 'Corte', precio: '200', duracionTexto: '1 hora', imagen: null };
const productoDto = {
  id: 9,
  nombre: 'Tratamiento',
  descripcion: null,
  marca: { nombre: 'Marca de ejemplo' },
  categoria: { nombre: 'Cabello' },
  imagen: null,
  variantes: [{
    id: 11,
    tono: null,
    presentacion: '500 ml',
    precio_venta: 150,
    stock: 3,
    imagen: null,
  }],
  precio_min: 150,
  en_stock: true,
};
const productoModel = { id: '9', nombre: 'Tratamiento', descripcion: null, precio: '150', marca: 'Marca de ejemplo', categoria: 'Cabello', imagen: null, variantes: [{ id: '11', tono: null, presentacion: '500 ml', precio: 150, stock: 3, imagen: null }], enStock: true };

function fixtureClient(responses, requests = []) {
  return new FetchHttpClient(() => 'https://api.example.test', async (url, options) => {
    const path = new URL(url).pathname;
    requests.push({ path, options });
    assert.ok(Object.hasOwn(responses, path), `Unexpected endpoint: ${path}`);
    const value = responses[path];
    return value instanceof Response ? value : new Response(JSON.stringify(value), { status: 200 });
  });
}

test('courses adapt the verified title, exact Decimal amount and nullable calendar fields', () => {
  assert.deepEqual(adaptCursoDto(cursoDto), { ...cursoModel, imagen: null, cupoMaximo: null, inscritos: null });
  assert.deepEqual(adaptCursosRespuesta({ cursos: [cursoDto] }), [{ ...cursoModel, imagen: null, cupoMaximo: null, inscritos: null }]);
  const optional = adaptCursoDto({ ...cursoDto, descripcion: null, duracion_horas: null, nivel: null, fecha_inicio: null, fecha_fin: null });
  assert.equal(optional.duracionHoras, null);
  assert.equal(optional.fechaInicio, null);
  assert.equal(optional.fechaFin, null);
  assert.equal(Object.hasOwn(optional, 'instructor'), false);
  assert.equal(Object.hasOwn(optional, 'modalidad'), false);
  assert.equal(adaptCursoDto({ ...cursoDto, precio_total: '12345678901234567890.99' }).precio, '12345678901234567890.99');
});

test('courses reject invalid consumed fields rather than supplying preview/default values', () => {
  for (const patch of [
    { id: '7' }, { id: 0 }, { titulo: null }, { descripcion: undefined },
    { precio_total: 1200 }, { precio_total: 'gratis' },
    { duracion_horas: 1.5 }, { nivel: false },
    { fecha_inicio: '2023-02-29' }, { fecha_fin: '2026-09-30T23:00:00.000Z' },
  ]) assert.throws(() => adaptCursoDto({ ...cursoDto, ...patch }), AdapterError);
});

test('services adapt their distinct list and detail price contracts without inventing duration minutes', () => {
  assert.deepEqual(adaptServicioDto(servicioDto), servicioModel);
  assert.deepEqual(adaptServiciosRespuesta({ servicios: [servicioDto] }), [servicioModel]);
  assert.deepEqual(adaptServicioDetalle(servicioDetalleDto), servicioDetalleModel);
  assert.equal(adaptServicioDto({ ...servicioDto, precio_min: 1.005 }).precio, '1.005');
  assert.equal(adaptServicioDetalle({ ...servicioDetalleDto, precio: 1e-7 }).precio, '0.0000001');
  assert.equal(Object.hasOwn(adaptServicioDto(servicioDto), 'duracionMinutos'), false);
  assert.equal(Object.hasOwn(adaptServicioDto(servicioDto), 'descripcion'), false);
  assert.throws(() => adaptServicioDetalle({ servicios: [servicioDetalleDto] }), AdapterError);
  assert.throws(() => adaptServicioDetalle(servicioDto), AdapterError);
  for (const patch of [{ precio_min: '200' }, { precio_min: Infinity }, { disponible: 'true' }, { duracion: null }, { categoria: null }]) {
    assert.throws(() => adaptServicioDto({ ...servicioDto, ...patch }), AdapterError);
  }
});

test('products adapt direct arrays and nested verified variant contracts', () => {
  assert.deepEqual(adaptProductoDto(productoDto), productoModel);
  assert.deepEqual(adaptProductosRespuesta([productoDto]), [productoModel]);
  assert.deepEqual(productoModel.variantes[0], { id: '11', tono: null, presentacion: '500 ml', precio: 150, stock: 3, imagen: null });
  assert.deepEqual(adaptProductoDto({ ...productoDto, marca: null, categoria: null, variantes: [], precio_min: null, en_stock: false }), {
    ...productoModel, precio: null, marca: null, categoria: null, variantes: [], enStock: false,
  });
  assert.throws(() => adaptProductoDto({ ...productoDto, precio_min: null }), AdapterError);
  for (const patch of [
    { marca: 'Marca' }, { categoria: { nombre: 12 } },
    { variantes: [{ ...productoDto.variantes[0], stock: 0.5 }] },
    { variantes: [{ ...productoDto.variantes[0], precio_venta: '150' }] },
    { variantes: [{ ...productoDto.variantes[0], id: 0 }] },
    { en_stock: 'true' }, { precio_min: '150' },
  ]) assert.throws(() => adaptProductoDto({ ...productoDto, ...patch }), AdapterError);
});

test('product search and facets use adapted name, category, variant and stock fields', () => {
  const product = adaptProductoDto(productoDto);
  assert.deepEqual(opcionesFiltroProductos([product]), ['Todos', 'Categoría: Cabello', 'Con existencias']);
  assert.deepEqual(filterProductos([product], 'tratamiento', 'Todos'), [product]);
  assert.deepEqual(filterProductos([product], '500 ML', 'Categoría: Cabello'), [product]);
  assert.deepEqual(filterProductos([product], 'no coincide', 'Todos'), []);
  assert.deepEqual(filterProductos([product], '', 'Con existencias'), [product]);
  assert.deepEqual(filterProductos([product], '', 'Categoría: Otra'), []);
});

test('endpoint adapters accept verified empty lists and reject empty/null or wrong wrappers', () => {
  assert.deepEqual(adaptCursosRespuesta({ cursos: [] }), []);
  assert.deepEqual(adaptServiciosRespuesta({ servicios: [] }), []);
  assert.deepEqual(adaptProductosRespuesta([]), []);
  for (const [convert, invalids] of [
    [adaptCursosRespuesta, [null, [], {}, { data: [] }, { cursos: null }]],
    [adaptServiciosRespuesta, [null, [], {}, { data: [] }, { servicios: null }]],
    [adaptProductosRespuesta, [null, {}, { productos: [] }, { data: [] }]],
  ]) for (const invalid of invalids) assert.throws(() => convert(invalid), AdapterError);
  assert.throws(
    () => adaptProductosRespuesta([{ ...productoDto, variantes: [{ ...productoDto.variantes[0], stock: 0.5 }] }]),
    (error) => error instanceof AdapterError && error.path === 'respuesta[0].variantes[0].stock',
  );
});

test('each confirmed JSON-list endpoint rejects a transport-empty 204 without masking it as []', async () => {
  for (const [Adapter, endpoint] of [
    [HttpCursosService, '/api/cursos'],
    [HttpServiciosService, '/api/servicios'],
    [HttpProductosService, '/api/productos'],
  ]) {
    const adapter = new Adapter(fixtureClient({ [endpoint]: new Response(null, { status: 204 }) }));
    await assert.rejects(adapter.listar(), AdapterError);
  }
});

test('real HTTP client and public adapters deliver adapted models to CatalogoViewModel', async () => {
  const requests = [];
  const controller = new AbortController();
  const http = fixtureClient({
    '/api/cursos': { cursos: [cursoDto] },
    '/api/servicios': { servicios: [servicioDto] },
    '/api/productos': [productoDto],
  }, requests);
  const adapter = new ComposedCatalogoService(new HttpServiciosService(http), new HttpCursosService(http), new HttpProductosService(http));
  const viewModel = new CatalogoViewModel(adapter);
  await viewModel.cargar(controller.signal);
  assert.deepEqual(viewModel.getSnapshot(), {
    datos: { Servicios: [servicioModel], Cursos: [cursoModel], Productos: [productoModel] },
    estadoCarga: 'listo',
    error: null,
  });
  assert.deepEqual(requests.map(({ path }) => path).sort(), ['/api/cursos', '/api/productos', '/api/servicios']);
  assert.ok(requests.every(({ options }) => options.signal === controller.signal));
});

test('detail ViewModels receive real adapted detail models through the confirmed endpoint strategy', async () => {
  const requests = [];
  const http = fixtureClient({ '/api/cursos': { cursos: [cursoDto] }, '/api/servicios/5': servicioDetalleDto }, requests);
  const course = new CursosViewModel(new HttpCursosService(http), '7');
  const service = new ServiciosViewModel(new HttpServiciosService(http), '5');
  await course.cargar();
  await service.cargar();
  assert.deepEqual(course.getSnapshot().datos, { ...cursoModel, imagen: null, cupoMaximo: null, inscritos: null });
  assert.deepEqual(service.getSnapshot().datos, servicioDetalleModel);
  assert.deepEqual(requests.map(({ path }) => path), ['/api/cursos', '/api/servicios/5']);
});

test('public detail adapters reject invalid IDs before sending requests and preserve missing-model errors', async () => {
  const requests = [];
  const http = fixtureClient({ '/api/cursos': { cursos: [] } }, requests);
  const courses = new HttpCursosService(http);
  const services = new HttpServiciosService(http);
  for (const adapter of [courses, services]) {
    for (const id of ['', 'abc', '0', '-1', '1.5']) await assert.rejects(adapter.obtener(id), AdapterError);
  }
  assert.deepEqual(requests, []);
  await assert.rejects(courses.obtener('999'), ModelNotFoundError);
});

test('service detail preserves HTTP 404 rather than recasting it as an adaptation error', async () => {
  const http = fixtureClient({ '/api/servicios/404': new Response(JSON.stringify({ error: 'Servicio no encontrado' }), { status: 404 }) });
  await assert.rejects(new HttpServiciosService(http).obtener('404'), (error) => {
    assert.ok(error instanceof HttpError);
    assert.equal(error.status, 404);
    assert.equal(error.path, '/api/servicios/404');
    assert.deepEqual(error.body, { error: 'Servicio no encontrado' });
    return true;
  });
});

test('service detail rejects a successful response that belongs to a different requested ID', async () => {
  const http = fixtureClient({ '/api/servicios/5': { ...servicioDetalleDto, id: 6 } });
  await assert.rejects(new HttpServiciosService(http).obtener('5'), (error) => error instanceof AdapterError && error.path === 'servicio.id');
});

test('invalid backend data reaches the real CatalogoViewModel as an adaptation error without preview fallback', async () => {
  const http = fixtureClient({
    '/api/cursos': { cursos: [{ ...cursoDto, precio_total: null }] },
    '/api/servicios': { servicios: [servicioDto] },
    '/api/productos': [productoDto],
  });
  const viewModel = new CatalogoViewModel(new ComposedCatalogoService(new HttpServiciosService(http), new HttpCursosService(http), new HttpProductosService(http)));
  await viewModel.cargar();
  const snapshot = viewModel.getSnapshot();
  assert.equal(snapshot.estadoCarga, 'error');
  assert.match(snapshot.error, /respuesta\.cursos\[0\]\.precio_total/);
  assert.equal(viewModel.getErrorType(), 'adaptacion');
  assert.deepEqual(snapshot.datos, { Servicios: [], Cursos: [], Productos: [] });
});


test('catalog service and ViewModel propagate HTTP failures without returning a successful empty catalog', async () => {
  for (const status of [401, 403, 500]) {
    const http = fixtureClient({
      '/api/cursos': { cursos: [] },
      '/api/servicios': new Response(JSON.stringify({ error: 'Unavailable' }), { status }),
      '/api/productos': [],
    });
    const service = new ComposedCatalogoService(new HttpServiciosService(http), new HttpCursosService(http), new HttpProductosService(http));
    const viewModel = new CatalogoViewModel(service);
    await viewModel.cargar();
    assert.equal(viewModel.getSnapshot().estadoCarga, 'error');
    assert.equal(viewModel.getErrorType(), 'http');
    assert.match(viewModel.getSnapshot().error, new RegExp(String(status)));
  }
});
