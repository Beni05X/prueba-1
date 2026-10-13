# Revisión de la guía de estilos — Salón Brenn’s

Actividad: **Aplicar guía de estilos a la aplicación móvil**. Fecha de revisión: 5 de octubre de 2026.

Este informe corresponde únicamente a esta actividad. Describe la implementación visual y las comprobaciones realizadas; no modifica estados del checklist ni de Trello. La versión final se revisó en navegador con tamaños de 320 × 740 y 390 × 844. La comprobación en un dispositivo con Expo Go sigue pendiente.

## Referencia y auditoría inicial

La referencia obligatoria es [Actividad_3_Bina15.pdf](<C:/Users/benil/Videos/2026 10cuatrimestre/movil/Actividad_3_Bina15.pdf>). Antes de modificar la aplicación se revisaron su estructura, rutas, componentes, tema y carga de fuentes, y se compararon con las pantallas del documento.

El proyecto utiliza Expo SDK 57, React Native 0.86.3, TypeScript y Expo Router. El punto de entrada es `expo-router/entry`. Ya existían las URL `/`, `/autenticacion`, `/cursos`, `/catalogo`, `/servicios`, `/agenda` y `/perfil`, además de la ruta de página no encontrada. La navegación era un Stack; Inicio contenía botones para abrir las seis secciones y estas mostraban “Sección en preparación” con un enlace para volver al inicio. No había barra inferior, Carrito, Configuración ni lógica de negocio en las secciones.

El tema ya contenía el rosa principal y algunos tokens compartidos. Las fuentes Inter Regular y Bold estaban incluidas localmente y cargadas por `expo-font`. También existían botones, campos de entrada, textos, superficies y una pantalla base. Se reutilizaron estos elementos, se ampliaron los tokens y se conservaron las URL originales y la posibilidad de volver al inicio.

## Correspondencia con las pantallas del PDF

| Página del PDF | Elementos de referencia | Implementación |
| --- | --- | --- |
| 4 y 5 | Autenticación, formulario y acceso a crear cuenta | Autenticación y vistas de cuenta: marca rosa, encabezados, campos etiquetados, enlaces y acciones principales. |
| 7 | Inicio y Catálogo | Saludo, buscador, accesos a Servicios/Cursos/Productos, tarjetas y categorías del catálogo. |
| 8 | Detalle de Servicio | Superficie de imagen, nombre, precio, descripción, duración, contenido y botón para agendar. |
| 9 | Agenda | Selector Próximas/Historial, fechas, tarjetas de citas, estado y acceso visual al detalle. |
| 10 | Curso | Superficie de imagen, título, descripción, datos del curso, precio y acción de inscripción. |
| 12 | Carrito | Artículos, precios, control visual para eliminar, resumen y acción de pago. |
| 16 | Perfil y Configuración | Datos del perfil, accesos solicitados, cierre de sesión y categorías de configuración. |

Los datos mostrados son ejemplos para revisar la presentación. Las acciones que requieren autenticación, reservas, inscripciones, compras, pagos, guardado o eliminación permanecen deshabilitadas. Los selectores de categorías, Agenda y Apariencia sólo cambian la selección visual local.

La barra compartida conserva la secuencia **Inicio, Catálogo, Agenda, Carrito y Perfil**. Cada opción muestra icono y etiqueta; la activa utiliza `#ED4087` y las inactivas gris. Las pantallas de autenticación no muestran la barra y conservan el área segura inferior. No se agregó un menú hamburguesa.

Perfil incluye **Mis compras, Mis cursos, Mis citas, Favoritos, Configuración, Ayuda, Legal, Acerca de la aplicación y Cerrar sesión**. Configuración incluye **Notificaciones, Apariencia, Idioma, Métodos de pago y Seguridad**. Estos requisitos del menú se comprueban por separado sin alterar los elementos del checklist de Trello.

## Checklist de revisión

La tabla conserva los quince elementos exactos del checklist de Trello y su orden. Los puntos 1–14 están implementados y revisados en la versión web final. El punto 15 está parcialmente comprobado porque falta la revisión nativa. No se modificaron los estados en Trello.

| # | Punto | Estado | Evidencia |
| --- | --- | --- | --- |
| 1 | Definir colores | Implementado | `Colors.primary` contiene `#ED4087`; `Colors` y `Surfaces` centralizan fondo blanco, superficies claras, texto oscuro, secundario gris, bordes y estados. |
| 2 | Definir tipografías | Implementado; renderizado nativo pendiente | Inter Regular para contenido e Inter Bold para títulos, etiquetas y acciones; fuentes locales, carga en el layout y variantes `Typography`. |
| 3 | Definir tamaños de texto | Implementado | `Sizes.text`, `Sizes.lineHeight` y `Typography` definen títulos, subtítulos, contenido, etiquetas y auxiliares. |
| 4 | Definir botones | Implementado | `Button` usa rosa, texto claro, radios y mínimos táctiles 48/44; `PreviewAction` deshabilita operaciones sin funcionalidad. `Touchable` mantiene los estilos de interacción al usarse con `Link`. |
| 5 | Definir campos de entrada | Implementado | `TextField` incluye etiqueta, borde, radio y foco rosa; se reutiliza en autenticación y vistas de cuenta. |
| 6 | Definir tarjetas | Implementado | Superficie `card`, `ThemedView` y `CatalogCard` con superficies claras y radios compartidos. |
| 7 | Definir iconos | Implementado; comprobación nativa pendiente | `Icon` e `IconSizes` centralizan geometría, tamaño y color; los SVG se cargan mediante el `expo-image` existente. |
| 8 | Definir espaciados | Implementado | `Spacing`, `Sizes` y `Radius` se reutilizan en pantallas, tarjetas, campos, botones y navegación. |
| 9 | Aplicar estilos a autenticación | Implementado y revisado en web | Formulario, marca, campos, enlaces y acciones según las páginas 4 y 5 del PDF. |
| 10 | Aplicar estilos a Cursos | Implementado y revisado en web | Detalle de curso, datos, precio y acción visual de inscripción según la página 10. |
| 11 | Aplicar estilos a Catálogo | Implementado y revisado en web | Buscador, selector de categorías y tarjetas según la página 7. |
| 12 | Aplicar estilos a Servicios | Implementado y revisado en web | Nombre, superficie de imagen, precio, descripción, duración y acción visual según la página 8. |
| 13 | Aplicar estilos a Agenda | Implementado y revisado en web | Selector Próximas/Historial y tarjetas de citas según la página 9. |
| 14 | Aplicar estilos a Perfil | Implementado y revisado en web | Perfil, accesos y configuración según la página 16; menú inferior compartido y vistas sin lógica de negocio. |
| 15 | Verificar consistencia visual | Parcial: web confirmada; Expo Go pendiente | Comparación visual de las pantallas finales, navegación por Perfil y Configuración, colores activos/inactivos y adaptación a 320 y 390 px. La corrección de `Touchable` está confirmada en web. |

## Archivos modificados y agregados

Inventario obtenido del estado actual de Git. No se realizó commit ni push.

| Archivo | Cambio | Relación con el checklist |
| --- | --- | --- |
| [src/theme/index.ts](C:/Users/benil/Videos/appmovil_Brenns/src/theme/index.ts) | Modificado: paleta, superficies, tipografía y dimensiones visuales compartidas. | 1–8 |
| [src/constants/navigation.ts](C:/Users/benil/Videos/appmovil_Brenns/src/constants/navigation.ts) | Modificado: cinco opciones del menú y regla compartida de visibilidad. | 7–8, 14–15 |
| [src/app/_layout.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/app/_layout.tsx) | Modificado: barra inferior compartida, encabezados de pantalla y registro de nuevas vistas. | 2, 9–15 |
| [src/app/index.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/app/index.tsx) | Modificado: Inicio basado en la referencia, categorías, tarjetas y enlaces. | 6–8, 15 |
| [src/app/autenticacion.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/app/autenticacion.tsx) | Modificado: formulario y enlaces visuales de autenticación. | 2–5, 8–9 |
| [src/app/catalogo.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/app/catalogo.tsx) | Modificado: buscador, categorías y tarjetas de ejemplo. | 2–8, 11 |
| [src/app/servicios.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/app/servicios.tsx) | Modificado: detalle visual del servicio. | 2–8, 12 |
| [src/app/cursos.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/app/cursos.tsx) | Modificado: detalle visual del curso. | 2–8, 10 |
| [src/app/agenda.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/app/agenda.tsx) | Modificado: selector y tarjetas de citas de ejemplo. | 2–8, 13 |
| [src/app/perfil.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/app/perfil.tsx) | Modificado: perfil y todos los accesos solicitados. | 2–8, 14 |
| [src/app/carrito.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/app/carrito.tsx) | Agregado: presentación de artículos, resumen y acción visual de pago. | 2–8, 15 |
| [src/app/configuracion.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/app/configuracion.tsx) | Agregado: las cinco categorías de configuración. | 2, 6–8, 14 |
| [src/app/cuenta/[seccion].tsx](C:/Users/benil/Videos/appmovil_Brenns/src/app/cuenta/[seccion].tsx) | Agregado: vistas visuales de los accesos de cuenta, autenticación y configuración. | 2–9, 14 |
| [src/components/themed-text.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/components/themed-text.tsx) | Modificado: variantes tipográficas de etiquetas, acciones y auxiliares. | 1–3 |
| [src/components/themed-view.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/components/themed-view.tsx) | Modificado: presentación compartida de tarjetas. | 1, 6, 8 |
| [src/components/ui/screen.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/components/ui/screen.tsx) | Modificado: encabezado, regreso, espaciado, scroll, teclado y áreas seguras. | 2–3, 8–15 |
| [src/components/navigation/bottom-navigation.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/components/navigation/bottom-navigation.tsx) | Agregado: barra de cinco opciones, color activo y accesibilidad. | 7–8, 14–15 |
| [src/components/ui/icon.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/components/ui/icon.tsx) | Agregado: iconos compartidos con tamaño y color del tema. | 7 |
| [src/components/ui/style-guide.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/components/ui/style-guide.tsx) | Agregado: buscador, selector, tarjetas, filas de menú e información y acciones visuales. | 2–15 |
| [src/components/ui/touchable.tsx](C:/Users/benil/Videos/appmovil_Brenns/src/components/ui/touchable.tsx) | Agregado: wrapper de interacción que conserva callbacks de estilo dentro del componente al utilizar `Link`/`Slot` de Expo Router; conserva etiquetas y roles accesibles. | 4, 7, 9–15 |
| [docs/guia-estilos.md](C:/Users/benil/Videos/appmovil_Brenns/docs/guia-estilos.md) | Agregado: este informe de revisión. | 15 y evidencias de la actividad |

Los componentes [Button](C:/Users/benil/Videos/appmovil_Brenns/src/components/ui/button.tsx) y [TextField](C:/Users/benil/Videos/appmovil_Brenns/src/components/ui/text-field.tsx) se reutilizaron sin modificar sus archivos. Las fuentes existentes se conservaron; no se agregó una dependencia para iconos o tipografía.

## Validaciones y límites de la confirmación

| Comprobación | Resultado al redactar este informe |
| --- | --- |
| TypeScript: `npm run typecheck` | Código de salida 0 en la versión final, después del último ajuste de `Touchable`. Los tipos de rutas se generaron con la utilidad oficial de Expo. |
| ESLint con la configuración del proyecto y sin caché | Confirmado mediante la API de ESLint: 0 errores y 1 advertencia previa. |
| CLI final de ESLint | `node node_modules/expo/bin/cli lint -- --no-cache`: código de salida 0, con 0 errores y 1 advertencia previa. |
| Advertencia previa de ESLint | `src/hooks/use-color-scheme.web.ts:11`, regla `react-hooks/set-state-in-effect`. Ya existía antes de esta actividad. |
| Pruebas configuradas | No hay script ni framework de pruebas configurado en el proyecto. |
| Revisión estática | Confirmadas rutas originales, menú solicitado, uso del tema, áreas seguras y acciones de negocio deshabilitadas. |
| Exportación web | Se generaron 12 rutas con código de salida 0. Corresponde a la versión anterior al último ajuste de `Touchable`; no confirma el renderizado visual final. |
| Revisión visual en navegador | Versión final confirmada después de reiniciar Metro: Inicio, Autenticación, registro, Catálogo, Servicios, Cursos, Agenda, Carrito, Perfil y Configuración. También se recorrieron los accesos de cuenta y preferencias. Sin errores de ejecución observados. |
| Adaptación web | Las ocho pantallas principales revisadas a 320 px mantienen el ancho del documento igual al del viewport, barra con cinco opciones de aproximadamente 62 × 64 px y una sola opción rosa. Autenticación oculta la barra. También se capturaron las pantallas a 390 px. |
| Campos y tipografía web | Inter Regular y Bold cargadas. Campo de correo de 48 px, borde rosa al enfocar y acción principal sin funcionalidad deshabilitada. |
| Espacios de Git | `git diff --check` terminó con código de salida 0. |
| Revisión en dispositivo con Expo Go | No comprobada todavía. |

La comparación visual web quedó comprobada. El renderizado nativo de las fuentes y SVG, el desplazamiento, las áreas seguras y el comportamiento con teclado deben confirmarse mediante la revisión indicada abajo. El punto de consistencia visual no se considera completamente verificado hasta entonces.

Las capturas de revisión están fuera del proyecto: [Inicio](C:/Users/benil/.codex/visualizations/2026/10/06/01a10f54-a0ec-73c0-8fdc-cbdeac4bb9c9/screenshots/inicio.png), [Autenticación](C:/Users/benil/.codex/visualizations/2026/10/06/01a10f54-a0ec-73c0-8fdc-cbdeac4bb9c9/screenshots/autenticacion.png), [Catálogo](C:/Users/benil/.codex/visualizations/2026/10/06/01a10f54-a0ec-73c0-8fdc-cbdeac4bb9c9/screenshots/catalogo.png), [Servicios](C:/Users/benil/.codex/visualizations/2026/10/06/01a10f54-a0ec-73c0-8fdc-cbdeac4bb9c9/screenshots/servicios.png), [Cursos](C:/Users/benil/.codex/visualizations/2026/10/06/01a10f54-a0ec-73c0-8fdc-cbdeac4bb9c9/screenshots/cursos.png), [Agenda](C:/Users/benil/.codex/visualizations/2026/10/06/01a10f54-a0ec-73c0-8fdc-cbdeac4bb9c9/screenshots/agenda.png), [Carrito](C:/Users/benil/.codex/visualizations/2026/10/06/01a10f54-a0ec-73c0-8fdc-cbdeac4bb9c9/screenshots/carrito.png), [Perfil](C:/Users/benil/.codex/visualizations/2026/10/06/01a10f54-a0ec-73c0-8fdc-cbdeac4bb9c9/screenshots/perfil.png) y [Configuración](C:/Users/benil/.codex/visualizations/2026/10/06/01a10f54-a0ec-73c0-8fdc-cbdeac4bb9c9/screenshots/configuracion.png). Se conservaron [mediciones de la revisión web](C:/Users/benil/.codex/visualizations/2026/10/06/01a10f54-a0ec-73c0-8fdc-cbdeac4bb9c9/screenshots/verificacion-web.json).

## Revisión en Expo Go

1. Abrir una terminal en la raíz del proyecto y ejecutar `npm run start`.
2. Usar un dispositivo con Expo Go compatible con **Expo SDK 57**, conectado a la misma red Wi-Fi que la computadora.
3. Escanear el código QR mostrado por Expo CLI y esperar a que carguen la aplicación y las fuentes.
4. Comparar cada módulo con las páginas del PDF: Autenticación y crear cuenta, Inicio, Catálogo, Servicios, Agenda, Cursos, Carrito, Perfil y Configuración.
5. Pulsar las cinco opciones inferiores y comprobar iconos, etiquetas, colores activo/inactivo, uniformidad de la barra y regreso entre pantallas.
6. Abrir los nueve accesos de Perfil y las cinco categorías de Configuración. Confirmar que las acciones que todavía no tienen funcionalidad sólo presentan su apariencia.
7. Desplazarse hasta el final de las pantallas largas y comprobar que el contenido respeta las áreas seguras. Abrir el teclado en los formularios y buscadores, revisar que los campos sean accesibles y cerrarlo para comprobar la distribución.
8. Revisar que todos los textos usan la jerarquía Inter prevista y que los controles y tarjetas mantienen colores, radios y espaciados consistentes.

## Alcance respetado

No se implementaron endpoints, variables de entorno, comunicación con API, MVVM, Adapter, MVP ni Mobile-D. No se eliminaron rutas ni se implementaron operaciones de negocio nuevas. No se realizaron cambios en Trello, commit ni push. Esta revisión termina en la actividad de guía de estilos y queda sujeta a la comprobación visual de esta etapa.
