const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const realReact = require('react');
const load = Module._load;
let state = [], cursor = 0;
let sessionRevision = 1, resourceIndex = 0;
const availability = { sinAtencion: false, horarios: [{ id: '1', hora: '12:00', disponible: true }, { id: '2', hora: '13:00', disponible: false }] };
let availabilityLoading = false;
function sessionResource() {
  const index = resourceIndex++;
  const datos = index === 0 ? [] : index === 1 ? { banco: {}, anticipoPorcentaje: 50 } : availability;
  return { datos, cargando: index === 2 && availabilityLoading, error: null, ocupado: false, authenticated: true, recargar: async () => {}, ejecutar: async () => false };
}
function useState(initial) { const index = cursor++; if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial; return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }]; }
const theme = { primary: '#ED4087', primarySoft: '#FFE8F2', backgroundElement: '#FFFFFF', border: '#E9E4E7', textSecondary: '#7B7479' };
const themeTokens = { Colors: theme, Spacing: { one: 4, two: 8, three: 16 }, Sizes: { controlMinHeight: 48, touchMinWidth: 44, borderWidth: 1 }, Radius: { control: 12, card: 16 }, ControlStates: { opacity: { pressed: 0.8 } }, IconSizes: { small: 16 }, Typography: { body: {} } };
// A small hook-state harness tests JS ViewModels/JSX decisions, not a native renderer.
Module._load = function(request, ...args) {
  if (request === 'react') return { ...realReact, useState, useCallback: value => value };
  if (request === 'react-native') return { View: 'View', Pressable: 'Pressable', TextInput: 'TextInput', StyleSheet: { create: value => value, flatten: value => value } };
  if (request === 'expo-router') return { Link: 'Link' };
  if (request === 'expo-image') return { Image: 'Image' };
  if (request === '@/hooks/use-theme') return { useTheme: () => theme };
  if (request === '@/components/themed-text') return { ThemedText: 'ThemedText' };
  if (request === '@/components/ui/touchable') return { Touchable: 'Touchable' };
  if (request === '@/components/ui/icon') return { Icon: 'Icon' };
  if (request === '@/theme') return themeTokens;
  if (request === '@/modules/auth/viewmodels/auth-session-provider') return { useAuthSession: () => ({ sessionRevision }) };
  if (request === '@/shared/viewmodels/use-session-resource' || request === './use-session-resource') return { useSessionResource: sessionResource };
  if (request === '@/shared/viewmodels/use-current-time') return { useCurrentTime: () => new Date(2026, 9, 13, 12).getTime() };
  return load.call(this, request, ...args);
};
const { MediaPlaceholder } = require('@/components/ui/style-guide');
const { usePaginationViewModel } = require('@/shared/viewmodels/use-pagination-view-model');
const { useReservaViewModel } = require('@/modules/agenda/viewmodels/use-reserva-view-model');
Module._load = load;
function render(fn) { cursor = 0; return fn(); }
test('reservation ViewModel clears the hour on date/service/employee/session changes, including returning to a previous service', () => {
  state = []; let service = { id: '4', nombre: 'Servicio publicado', precio: '200' }, employee;
  const draw = () => { resourceIndex = 0; return render(() => useReservaViewModel(service, employee)); };
  let vm = draw(); vm.cambiarFecha('2026-10-14'); vm = draw();
  vm.cambiarHora('13:00'); assert.equal(draw().hora, null);
  vm.cambiarHora('12:00'); vm = draw(); assert.equal(vm.puedeReservar, true);
  availabilityLoading = true; assert.equal(draw().puedeReservar, false); availabilityLoading = false;
  vm = draw(); vm.cambiarFecha('2026-10-15'); vm = draw(); assert.equal(vm.hora, null);
  vm.cambiarHora('12:00'); assert.equal(draw().hora, '12:00');
  service = { ...service, id: '5' }; vm = draw(); assert.equal(vm.hora, null); assert.equal(vm.fecha, '');
  service = { ...service, id: '4' }; vm = draw(); assert.equal(vm.hora, null); assert.equal(vm.fecha, '');
  vm.cambiarFecha('2026-10-15'); vm = draw(); vm.cambiarHora('12:00');
  employee = '8'; vm = draw(); assert.equal(vm.hora, null);
  vm.cambiarFecha('2026-10-15'); vm = draw(); vm.cambiarHora('12:00');
  sessionRevision++; assert.equal(draw().hora, null);
});
test('shared image shows only Imagen when absent/invalid/failed and resets on URI changes including A → B → A', () => {
  state = []; let previousKey;
  const draw = source => {
    const wrapper = MediaPlaceholder({ source, label: 'Nombre fuera de la imagen' });
    if (wrapper.key !== previousKey) { state = []; previousKey = wrapper.key; }
    return render(() => wrapper.type(wrapper.props)).props.children;
  };
  assert.equal(draw(null).props.children, 'Imagen');
  assert.equal(draw('invalid').props.children, 'Imagen');
  let image = draw('https://example.invalid/a.jpg');
  assert.equal(image.type, 'Image'); image.props.onError();
  assert.equal(draw('https://example.invalid/a.jpg').props.children, 'Imagen');
  assert.equal(draw('https://example.invalid/b.jpg').type, 'Image');
  assert.equal(draw('https://example.invalid/a.jpg').type, 'Image');
});
test('pagination ViewModel resets on query/filter/order changes and remembers a clamp when counts grow again', () => {
  state = [];
  let items = Array.from({ length: 35 }, (_, i) => i), key = 'query/filter/order';
  const draw = () => render(() => usePaginationViewModel(items, key));
  let vm = draw(); vm.next(); vm = draw(); vm.next(); vm = draw();
  assert.equal(vm.page, 3); assert.equal(vm.items.length, 10);
  key = 'new-query/filter/order'; vm = draw(); assert.equal(vm.page, 1);
  vm.next(); vm = draw(); key = 'new-query/new-filter/order'; assert.equal(draw().page, 1);
  vm = draw(); vm.next(); vm = draw(); key = 'new-query/new-filter/new-order'; assert.equal(draw().page, 1);
  vm = draw(); vm.next(); vm = draw(); vm.next(); vm = draw();
  items = items.slice(0, 12); assert.equal(draw().page, 2);
  items = Array.from({ length: 35 }, (_, i) => i); assert.equal(draw().page, 2);
});
