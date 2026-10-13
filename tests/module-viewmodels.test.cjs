const assert = require('node:assert/strict');
const { test } = require('node:test');
const { ComposedCatalogoService } = require('@/modules/catalogo/services/catalogo-service');
const { CatalogoViewModel } = require('@/modules/catalogo/viewmodels/catalogo-view-model');
const { CursosViewModel } = require('@/modules/cursos/viewmodels/cursos-view-model');
const { ServiciosViewModel } = require('@/modules/servicios/viewmodels/servicios-view-model');

test('catalog service composes the existing internal-model ports without mixing modules', async () => {
  const Servicios = [{ id: '1', nombre: 'Servicio', precio: '150.00' }];
  const Cursos = [{ id: '2', nombre: 'Curso', precio: '250.00' }];
  const Productos = [{ id: '3', nombre: 'Producto', precio: '90.00' }];
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const receivedOptions = [];
  const source = (models) => ({
    listar: async (requestOptions) => {
      receivedOptions.push(requestOptions);
      return models;
    },
  });
  const service = new ComposedCatalogoService(source(Servicios), source(Cursos), source(Productos));

  const result = await service.obtener(options);
  assert.deepEqual(result, { Servicios, Cursos, Productos });
  assert.equal(result.Servicios, Servicios);
  assert.equal(result.Cursos, Cursos);
  assert.equal(result.Productos, Productos);
  assert.deepEqual(receivedOptions, [options, options, options]);
});

test('catalog ViewModel receives composed models from its Adapter contract', async () => {
  const models = {
    Servicios: [{ id: '1', nombre: 'Servicio', precio: '150.00' }],
    Cursos: [],
    Productos: [{ id: '3', nombre: 'Producto', precio: null }],
  };
  const controller = new AbortController();
  const viewModel = new CatalogoViewModel({
    obtener: async (options) => {
      assert.equal(options.signal, controller.signal);
      return models;
    },
  });

  await viewModel.cargar(controller.signal);
  assert.equal(viewModel.getSnapshot().datos, models);
  assert.equal(viewModel.getSnapshot().estadoCarga, 'listo');
  assert.equal(viewModel.getSnapshot().error, null);
});

test('course and service detail ViewModels consume adapted models and forward selected IDs', async () => {
  for (const ViewModel of [CursosViewModel, ServiciosViewModel]) {
    const model = { id: '7', nombre: 'Detalle', precio: '150.00' };
    const controller = new AbortController();
    const viewModel = new ViewModel({
      obtener: async (id, options) => {
        assert.equal(id, '7');
        assert.equal(options.signal, controller.signal);
        return model;
      },
    }, '7');
    assert.equal(viewModel.getSnapshot().datos, null);
    await viewModel.cargar(controller.signal);
    assert.equal(viewModel.getSnapshot().datos, model);
    assert.equal(viewModel.getSnapshot().estadoCarga, 'listo');
  }
});

test('course and service routes without IDs do not present example records as server data', async () => {
  for (const ViewModel of [CursosViewModel, ServiciosViewModel]) {
    let requested = false;
    const viewModel = new ViewModel({ obtener: async () => { requested = true; } });
    const data = viewModel.getSnapshot().datos;
    await viewModel.cargar();
    assert.equal(requested, false);
    assert.equal(data, null);
    assert.equal(viewModel.getSnapshot().datos, null);
  }
});
