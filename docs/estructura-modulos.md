# Estructura real · 10 de octubre de 2026

Inventario generado desde el sistema de archivos después de la reorganización. Excluye dependencias, cachés, builds y archivos generados. Los README en capas sin código explican limitaciones; no acreditan integraciones terminadas.

## Tabla de módulos

| Módulo | Vistas | ViewModels y estado | Modelos | Adapters y DTO | Servicios |
| --- | --- | --- | --- | --- | --- |
| agenda | `agenda-view.tsx` | `agenda-preview.ts`<br>`agenda-state.ts`<br>`use-agenda-view-model.ts` | `cita.ts` | Sin implementación; README | Sin implementación; README |
| autenticacion | `autenticacion-seccion-view.tsx`<br>`autenticacion-view.tsx` | `autenticacion-state.ts`<br>`use-autenticacion-view-model.ts` | `autenticacion.ts` | Sin implementación; README | Sin implementación; README |
| carrito | `carrito-view.tsx` | `carrito-state.ts`<br>`use-carrito-view-model.ts` | `carrito.ts` | Sin implementación; README | Sin implementación; README |
| catalogo | `catalogo-view.tsx` | `catalogo-state.ts`<br>`catalogo-view-model.ts`<br>`use-catalogo-view-model.ts` | `catalogo.ts` | Sin implementación; README | `catalogo-service.ts` |
| configuracion | `configuracion-seccion-view.tsx`<br>`configuracion-view.tsx` | `configuracion-state.ts`<br>`use-configuracion-view-model.ts` | `configuracion.ts` | Sin implementación; README | Sin implementación; README |
| cuenta | `cuenta-view.tsx` | `cuenta-state.ts`<br>`use-cuenta-view-model.ts` | Sin implementación; README | Sin implementación; README | Sin implementación; README |
| cursos | `cursos-view.tsx`<br>`mis-cursos-view.tsx` | `cursos-preview.ts`<br>`cursos-state.ts`<br>`cursos-view-model.ts`<br>`mis-cursos-state.ts`<br>`use-cursos-view-model.ts`<br>`use-mis-cursos-view-model.ts` | `curso.ts` | `curso-dto.ts`<br>`cursos-adapter.ts` | `cursos-service.ts` |
| favoritos | `favoritos-view.tsx` | `favoritos-state.ts`<br>`use-favoritos-view-model.ts` | `favorito.ts` | Sin implementación; README | Sin implementación; README |
| informacion | `informacion-view.tsx`<br>`no-encontrado-view.tsx` | `informacion-state.ts`<br>`use-informacion-view-model.ts`<br>`use-no-encontrado-view-model.ts` | `informacion.ts` | Sin implementación; README | Sin implementación; README |
| inicio | `inicio-view.tsx` | `inicio-state.ts`<br>`use-inicio-view-model.ts` | Sin implementación; README | Sin implementación; README | Sin implementación; README |
| notificaciones | `notificaciones-view.tsx` | `notificaciones-state.ts`<br>`use-notificaciones-view-model.ts` | `notificacion.ts` | Sin implementación; README | Sin implementación; README |
| perfil | `editar-perfil-view.tsx`<br>`perfil-view.tsx` | `perfil-state.ts`<br>`use-editar-perfil-view-model.ts`<br>`use-perfil-view-model.ts` | `perfil.ts` | Sin implementación; README | Sin implementación; README |
| productos | `productos-list-view.tsx` | `productos-state.ts`<br>`use-productos-view-model.ts` | `producto.ts` | `producto-dto.ts`<br>`productos-adapter.ts` | `productos-service.ts` |
| servicios | `servicios-view.tsx` | `servicios-preview.ts`<br>`servicios-state.ts`<br>`servicios-view-model.ts`<br>`use-servicios-view-model.ts` | `servicio.ts` | `servicio-dto.ts`<br>`servicios-adapter.ts` | `servicios-service.ts` |
| ventas | `compras-view.tsx` | `use-compras-view-model.ts`<br>`ventas-state.ts` | `venta.ts` | Sin implementación; README | Sin implementación; README |

## Rutas conservadas

- `src/app/+not-found.tsx`
- `src/app/_layout.tsx`
- `src/app/agenda.tsx`
- `src/app/autenticacion.tsx`
- `src/app/carrito.tsx`
- `src/app/catalogo.tsx`
- `src/app/configuracion.tsx`
- `src/app/cuenta/[seccion].tsx`
- `src/app/cursos.tsx`
- `src/app/index.tsx`
- `src/app/perfil.tsx`
- `src/app/servicios.tsx`

Cursos y Servicios con `?id=…` usan detalle remoto; sin identificador conservan el preview anterior. Los listados se muestran en las categorías de Catálogo. Productos no tenía ruta propia de detalle.

| Sección de /cuenta/[seccion] | Módulo | Pantalla |
| --- | --- | --- |
| compras | ventas | Mis compras |
| cursos | cursos | Mis cursos |
| favoritos | favoritos | Favoritos |
| ayuda | informacion | Ayuda |
| legal | informacion | Legal |
| acerca | informacion | Acerca de la app |
| cerrar-sesion | autenticacion | Mi perfil |
| editar-perfil | perfil | Editar perfil |
| notificaciones | notificaciones | Notificaciones |
| apariencia | configuracion | Apariencia |
| idioma | configuracion | Idioma |
| metodos-pago | configuracion | Métodos de pago |
| seguridad | configuracion | Seguridad |
| cambiar-contrasena | autenticacion | Cambiar contraseña |
| sesiones | configuracion | Sesiones activas |
| eliminar-cuenta | autenticacion | Eliminar cuenta |
| recuperar-contrasena | autenticacion | Recuperar contraseña |
| crear-cuenta | autenticacion | Crear cuenta |
| privacidad | informacion | Aviso de privacidad |
| terminos | informacion | Términos y condiciones |
| cancelaciones | informacion | Cancelaciones y reembolsos |
| reembolsos | informacion | Cancelaciones y reembolsos |
| cookies | informacion | Política de cookies |

La sección desconocida conserva el respaldo de Mi cuenta y el enlace a Perfil. La ruta no encontrada conserva su vista específica. No se añadieron funciones.

## Estado de implementación

- **Público integrado:** catálogo, productos, cursos y servicios. Servicios ejecutables y adapters puros; catálogo compone datos ya adaptados y no necesita otro mapper.
- **Local/preview:** autenticación, inicio, agenda, carrito, perfil, favoritos, ventas, notificaciones, configuración, mis cursos e información. No hay servicios simulados.
- **Solo navegación:** cuenta; no requiere endpoint ni entidad de negocio propios.
- Configuración sigue independiente por sus preferencias y seguridad. Productos conserva su contrato, validación de variantes y presentación consumida por catálogo. Carrito se separó de ventas sin mover compras.
- Cantidades editables, disponibilidad remota, inscripción, login real y checkout no estaban implementados. Faltan sesión móvil, reconciliación de formularios y pruebas de endpoints autenticados; véase [endpoints-api.md](endpoints-api.md).

## Árbol completo

```text
appmovil_Brenns/
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── assets/
│   ├── expo.icon/
│   │   ├── Assets/
│   │   │   ├── expo-symbol 2.svg
│   │   │   └── grid.png
│   │   └── icon.json
│   ├── fonts/
│   │   ├── Inter-Bold.ttf
│   │   ├── Inter-Regular.ttf
│   │   ├── OFL.txt
│   │   └── README.md
│   └── images/
│       ├── tabIcons/
│       │   ├── explore.png
│       │   ├── explore@2x.png
│       │   ├── explore@3x.png
│       │   ├── home.png
│       │   ├── home@2x.png
│       │   └── home@3x.png
│       ├── android-icon-background.png
│       ├── android-icon-foreground.png
│       ├── android-icon-monochrome.png
│       ├── expo-badge-white.png
│       ├── expo-badge.png
│       ├── expo-logo.png
│       ├── favicon.png
│       ├── icon.png
│       ├── logo-glow.png
│       ├── react-logo.png
│       ├── react-logo@2x.png
│       ├── react-logo@3x.png
│       ├── splash-icon.png
│       └── tutorial-web.png
├── docs/
│   ├── arquitectura-mvvm.md
│   ├── endpoints-api.md
│   ├── estructura-modulos.md
│   ├── guia-estilos.md
│   ├── implementacion-adapter.md
│   ├── migracion-adapter.json
│   └── revision-estructura.md
├── scripts/
│   ├── register-typescript.cjs
│   ├── reset-project.js
│   └── run-tests.cjs
├── src/
│   ├── app/
│   │   ├── cuenta/
│   │   │   └── [seccion].tsx
│   │   ├── _layout.tsx
│   │   ├── +not-found.tsx
│   │   ├── agenda.tsx
│   │   ├── autenticacion.tsx
│   │   ├── carrito.tsx
│   │   ├── catalogo.tsx
│   │   ├── configuracion.tsx
│   │   ├── cursos.tsx
│   │   ├── index.tsx
│   │   ├── perfil.tsx
│   │   └── servicios.tsx
│   ├── components/
│   │   ├── navigation/
│   │   │   ├── bottom-navigation.tsx
│   │   │   └── section-screen.tsx
│   │   ├── ui/
│   │   │   ├── account-section-styles.ts
│   │   │   ├── button.tsx
│   │   │   ├── icon.tsx
│   │   │   ├── screen.tsx
│   │   │   ├── style-guide.tsx
│   │   │   ├── text-field.tsx
│   │   │   └── touchable.tsx
│   │   ├── themed-text.tsx
│   │   └── themed-view.tsx
│   ├── config/
│   │   └── api.ts
│   ├── constants/
│   │   └── navigation.ts
│   ├── hooks/
│   │   ├── use-color-scheme.ts
│   │   ├── use-color-scheme.web.ts
│   │   └── use-theme.ts
│   ├── modules/
│   │   ├── agenda/
│   │   │   ├── adapters/
│   │   │   │   └── README.md
│   │   │   ├── models/
│   │   │   │   └── cita.ts
│   │   │   ├── services/
│   │   │   │   └── README.md
│   │   │   ├── viewmodels/
│   │   │   │   ├── agenda-preview.ts
│   │   │   │   ├── agenda-state.ts
│   │   │   │   └── use-agenda-view-model.ts
│   │   │   └── views/
│   │   │       └── agenda-view.tsx
│   │   ├── autenticacion/
│   │   │   ├── adapters/
│   │   │   │   └── README.md
│   │   │   ├── models/
│   │   │   │   └── autenticacion.ts
│   │   │   ├── services/
│   │   │   │   └── README.md
│   │   │   ├── viewmodels/
│   │   │   │   ├── autenticacion-state.ts
│   │   │   │   └── use-autenticacion-view-model.ts
│   │   │   └── views/
│   │   │       ├── autenticacion-seccion-view.tsx
│   │   │       └── autenticacion-view.tsx
│   │   ├── carrito/
│   │   │   ├── adapters/
│   │   │   │   └── README.md
│   │   │   ├── models/
│   │   │   │   └── carrito.ts
│   │   │   ├── services/
│   │   │   │   └── README.md
│   │   │   ├── viewmodels/
│   │   │   │   ├── carrito-state.ts
│   │   │   │   └── use-carrito-view-model.ts
│   │   │   └── views/
│   │   │       └── carrito-view.tsx
│   │   ├── catalogo/
│   │   │   ├── adapters/
│   │   │   │   └── README.md
│   │   │   ├── models/
│   │   │   │   └── catalogo.ts
│   │   │   ├── services/
│   │   │   │   └── catalogo-service.ts
│   │   │   ├── viewmodels/
│   │   │   │   ├── catalogo-state.ts
│   │   │   │   ├── catalogo-view-model.ts
│   │   │   │   └── use-catalogo-view-model.ts
│   │   │   └── views/
│   │   │       └── catalogo-view.tsx
│   │   ├── configuracion/
│   │   │   ├── adapters/
│   │   │   │   └── README.md
│   │   │   ├── models/
│   │   │   │   └── configuracion.ts
│   │   │   ├── services/
│   │   │   │   └── README.md
│   │   │   ├── viewmodels/
│   │   │   │   ├── configuracion-state.ts
│   │   │   │   └── use-configuracion-view-model.ts
│   │   │   └── views/
│   │   │       ├── configuracion-seccion-view.tsx
│   │   │       └── configuracion-view.tsx
│   │   ├── cuenta/
│   │   │   ├── adapters/
│   │   │   │   └── README.md
│   │   │   ├── models/
│   │   │   │   └── README.md
│   │   │   ├── services/
│   │   │   │   └── README.md
│   │   │   ├── viewmodels/
│   │   │   │   ├── cuenta-state.ts
│   │   │   │   └── use-cuenta-view-model.ts
│   │   │   └── views/
│   │   │       └── cuenta-view.tsx
│   │   ├── cursos/
│   │   │   ├── adapters/
│   │   │   │   ├── curso-dto.ts
│   │   │   │   ├── cursos-adapter.ts
│   │   │   │   └── README.md
│   │   │   ├── models/
│   │   │   │   └── curso.ts
│   │   │   ├── services/
│   │   │   │   └── cursos-service.ts
│   │   │   ├── viewmodels/
│   │   │   │   ├── cursos-preview.ts
│   │   │   │   ├── cursos-state.ts
│   │   │   │   ├── cursos-view-model.ts
│   │   │   │   ├── mis-cursos-state.ts
│   │   │   │   ├── use-cursos-view-model.ts
│   │   │   │   └── use-mis-cursos-view-model.ts
│   │   │   └── views/
│   │   │       ├── cursos-view.tsx
│   │   │       └── mis-cursos-view.tsx
│   │   ├── favoritos/
│   │   │   ├── adapters/
│   │   │   │   └── README.md
│   │   │   ├── models/
│   │   │   │   └── favorito.ts
│   │   │   ├── services/
│   │   │   │   └── README.md
│   │   │   ├── viewmodels/
│   │   │   │   ├── favoritos-state.ts
│   │   │   │   └── use-favoritos-view-model.ts
│   │   │   └── views/
│   │   │       └── favoritos-view.tsx
│   │   ├── informacion/
│   │   │   ├── adapters/
│   │   │   │   └── README.md
│   │   │   ├── models/
│   │   │   │   └── informacion.ts
│   │   │   ├── services/
│   │   │   │   └── README.md
│   │   │   ├── viewmodels/
│   │   │   │   ├── informacion-state.ts
│   │   │   │   ├── use-informacion-view-model.ts
│   │   │   │   └── use-no-encontrado-view-model.ts
│   │   │   └── views/
│   │   │       ├── informacion-view.tsx
│   │   │       └── no-encontrado-view.tsx
│   │   ├── inicio/
│   │   │   ├── adapters/
│   │   │   │   └── README.md
│   │   │   ├── models/
│   │   │   │   └── README.md
│   │   │   ├── services/
│   │   │   │   └── README.md
│   │   │   ├── viewmodels/
│   │   │   │   ├── inicio-state.ts
│   │   │   │   └── use-inicio-view-model.ts
│   │   │   └── views/
│   │   │       └── inicio-view.tsx
│   │   ├── notificaciones/
│   │   │   ├── adapters/
│   │   │   │   └── README.md
│   │   │   ├── models/
│   │   │   │   └── notificacion.ts
│   │   │   ├── services/
│   │   │   │   └── README.md
│   │   │   ├── viewmodels/
│   │   │   │   ├── notificaciones-state.ts
│   │   │   │   └── use-notificaciones-view-model.ts
│   │   │   └── views/
│   │   │       └── notificaciones-view.tsx
│   │   ├── perfil/
│   │   │   ├── adapters/
│   │   │   │   └── README.md
│   │   │   ├── models/
│   │   │   │   └── perfil.ts
│   │   │   ├── services/
│   │   │   │   └── README.md
│   │   │   ├── viewmodels/
│   │   │   │   ├── perfil-state.ts
│   │   │   │   ├── use-editar-perfil-view-model.ts
│   │   │   │   └── use-perfil-view-model.ts
│   │   │   └── views/
│   │   │       ├── editar-perfil-view.tsx
│   │   │       └── perfil-view.tsx
│   │   ├── productos/
│   │   │   ├── adapters/
│   │   │   │   ├── producto-dto.ts
│   │   │   │   ├── productos-adapter.ts
│   │   │   │   └── README.md
│   │   │   ├── models/
│   │   │   │   └── producto.ts
│   │   │   ├── services/
│   │   │   │   └── productos-service.ts
│   │   │   ├── viewmodels/
│   │   │   │   ├── productos-state.ts
│   │   │   │   └── use-productos-view-model.ts
│   │   │   └── views/
│   │   │       └── productos-list-view.tsx
│   │   ├── servicios/
│   │   │   ├── adapters/
│   │   │   │   ├── README.md
│   │   │   │   ├── servicio-dto.ts
│   │   │   │   └── servicios-adapter.ts
│   │   │   ├── models/
│   │   │   │   └── servicio.ts
│   │   │   ├── services/
│   │   │   │   └── servicios-service.ts
│   │   │   ├── viewmodels/
│   │   │   │   ├── servicios-preview.ts
│   │   │   │   ├── servicios-state.ts
│   │   │   │   ├── servicios-view-model.ts
│   │   │   │   └── use-servicios-view-model.ts
│   │   │   └── views/
│   │   │       └── servicios-view.tsx
│   │   └── ventas/
│   │       ├── adapters/
│   │       │   └── README.md
│   │       ├── models/
│   │       │   └── venta.ts
│   │       ├── services/
│   │       │   └── README.md
│   │       ├── viewmodels/
│   │       │   ├── use-compras-view-model.ts
│   │       │   └── ventas-state.ts
│   │       └── views/
│   │           └── compras-view.tsx
│   ├── services/
│   │   └── api.ts
│   ├── shared/
│   │   ├── adapters/
│   │   │   ├── adapter-error.ts
│   │   │   └── validation.ts
│   │   ├── models/
│   │   │   └── view-state.ts
│   │   └── viewmodels/
│   │       ├── load-state.ts
│   │       └── use-load-state.ts
│   ├── theme/
│   │   └── index.ts
│   ├── utils/
│   │   ├── format-calendar-date.ts
│   │   └── format-price.ts
│   └── global.css
├── tests/
│   ├── api-config.test.cjs
│   ├── data-validation.test.cjs
│   ├── http-client.test.cjs
│   ├── load-state.test.cjs
│   ├── module-viewmodels.test.cjs
│   ├── presentation-format.test.cjs
│   └── public-adapters.test.cjs
├── .env
├── .env.example
├── .gitignore
├── AGENTS.md
├── app.json
├── eslint.config.js
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```
