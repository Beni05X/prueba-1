# Salón Brenn’s · aplicación móvil

Expo SDK 57, React Native 0.86.3, TypeScript 6 y Expo Router. Node.js 22.13 o superior y npm; las versiones se fijan con package-lock.json.

## Preparar y ejecutar

```bash
npm ci
npm start
npm run typecheck
npm run lint
npm test
```

También existen npm run android, npm run ios y npm run web. El simulador de iOS requiere macOS. Expo genera expo-env.d.ts y .expo/types/router.d.ts al iniciar; no se editan manualmente. Para instalar dependencias compatibles usa npx expo install <paquete>. No hay cambios de dependencias en esta reorganización.

## API externa

En una copia nueva, copia .env.example a .env y configura la URL **raíz** confirmada de la API externa, sin /api. Si ya tienes .env, conserva su valor. La app obtiene la base de EXPO_PUBLIC_API_URL y no incorpora un backend.

- src/config/api.ts es el único lugar que lee EXPO_PUBLIC_API_URL, con acceso estático compatible con Expo. Valida HTTP(S), host y URL raíz; rechaza credenciales, consulta, fragmento, rutas y configuración ausente. Elimina espacios exteriores y barras finales. No hay URL alternativa.
- src/services/api.ts contiene el único cliente HTTP. Los servicios de módulos usan rutas relativas /api/… y entregan modelos adaptados.
- .env y sus variantes están ignorados; .env.example permanece versionable. EXPO_PUBLIC_ es información pública incluida en el bundle, nunca secretos. Recarga completamente la app tras cambiarla.

Consulta [variables de entorno de Expo](https://docs.expo.dev/guides/environment-variables/) y [contratos y límites del backend](docs/endpoints-api.md). La evidencia histórica de endpoints no garantiza que el despliegue actual mantenga esos contratos.

## Estructura y responsabilidades

```text
src/
  app/          # Rutas de Expo Router y _layout.tsx
  modules/      # 15 módulos de Salón Brenn’s
  components/   # Componentes visuales reutilizables
  config/api.ts # Lectura y validación de la URL
  services/api.ts # Cliente HTTP común
  theme/        # Colores, Inter, medidas y estilos originales
  constants/    # Navegación compartida
  hooks/        # Hooks compartidos existentes
  shared/       # Validación de adapters y estado de carga compartido
  utils/        # Formato de importes y fechas
assets/         # Imágenes, fuentes e icono de Expo existentes
```

Cada módulo contiene views, viewmodels, models, adapters y services. Las capas sin implementación tienen un README que explica su alcance; no se crean llamadas HTTP ni entidades ficticias para llenar carpetas.

Flujo remoto: **Vista → ViewModel → servicio → cliente HTTP; respuesta → adapter → modelo → ViewModel → Vista**. Los adapters son funciones puras; los servicios realizan operaciones y componen resultados; los ViewModels administran estado, errores y presentación. Los DTO están junto a sus adapters. Los datos personales se aíslan por usuario y revisión de sesión; los ejemplos permanecen únicamente en pruebas.

Carrito tiene su propio módulo; ventas conserva Mis compras. productos sigue como módulo especializado consumido por catálogo, con su contrato y adaptación propios. Configuración conserva su separación existente porque reúne apariencia, idioma, seguridad y métodos de pago. Cuenta compone las secciones de navegación; no duplica Perfil.

Se conserva src/app, la barra Inicio/Catálogo/Agenda/Carrito/Perfil y los accesos a Cursos, Servicios y Configuración. No se añade App.tsx ni AppNavigator. Los recursos de iconos mantienen las rutas de app.json (assets/images y assets/expo.icon); no se crea una carpeta icons vacía.

## Implementado y pendiente

Catálogo combina los listados públicos de servicios, cursos y productos. El detalle de servicio usa su endpoint; curso y producto se obtienen de sus listados porque no hay un contrato público de detalle separado confirmado. Sin identificador se ofrece explorar el catálogo. Los errores HTTP, de red y de datos no se convierten en éxito ni en ejemplos.

La autenticación utiliza NextAuth v5 y confirma sesión/perfil antes de publicar acceso. Perfil y edición, variantes/carrito, horarios/citas, inscripción/Mis cursos, favoritos, pedidos/historial y recordatorios están conectados a sus contratos. Las escrituras requieren confirmación del servidor y recargan los datos afectados. Apariencia conserva su preferencia del dispositivo.

El detalle de servicio incorpora calendario y disponibilidad real. Citas e inscripciones muestran transferencia bancaria y pago pendiente, con los datos de la web expresamente confirmados por el usuario. Las imágenes ausentes o fallidas muestran “Imagen”; productos usa diez elementos por página después de búsqueda, filtros y orden. Consulta el [informe de calendario y transferencias](docs/reservas-transferencias-2026-10-13.md) para los archivos, contratos y verificaciones.

Las pruebas con una cuenta autorizada en Android, logout y cambio de cuenta permanecen pendientes: no había dispositivo conectado. No se ejecutan compras o pagos reales automáticamente. Consulta el [informe del 13 de octubre](docs/integracion-cuenta-2026-10-13.md) para los endpoints, archivos, contenido retirado, resultados reales y operaciones sin contrato confirmado.

El [inventario real de módulos y rutas](docs/estructura-modulos.md) incluye el árbol completo y la tabla por capas. El [informe de correcciones y validación](docs/revision-estructura.md) enumera archivos movidos, modificados, retirados y limitaciones. Consulta también [la arquitectura](docs/arquitectura-mvvm.md) y [la guía visual](docs/guia-estilos.md).

Las pruebas usan Node y TypeScript ya instalados; no necesitan credenciales ni acceso al backend. Se comprueban contratos con fixtures, adaptación, precisión, cancelación, estados de error, composición de servicios y configuración de URL. Lint mantiene visible una advertencia previa del hook de hidratación web.
