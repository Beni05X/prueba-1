# Configuración técnica

Aplicación con Expo SDK 57, React Native 0.86.3, TypeScript 6 y Expo Router.

## Requisitos

- Node.js 22.13 o superior.
- npm. El proyecto utiliza `package-lock.json` para fijar las dependencias.

## Preparar e iniciar el proyecto

Instala las dependencias desde la raíz del proyecto:

```bash
npm ci
```

Inicia el servidor de desarrollo:

```bash
npm run start
```

Expo genera automáticamente `expo-env.d.ts` y los tipos de rutas en
`.expo/types/router.d.ts`. Estos archivos están ignorados por Git y no deben
editarse manualmente. `tsconfig.json` ya los incluye.

En una copia nueva del proyecto, espera a que Metro esté listo antes de ejecutar
las comprobaciones. Puedes detener el servidor con `Ctrl+C` o ejecutar los
comandos en otra terminal.

También están disponibles `npm run android`, `npm run ios` y `npm run web` para
iniciar Expo y abrir la plataforma correspondiente. El simulador de iOS requiere
macOS.

## Comprobaciones

```bash
npm run typecheck
npm run lint
```

`typecheck` ejecuta `tsc --noEmit`. `lint` ejecuta `expo lint` con la configuración
plana de `eslint-config-expo` definida en `eslint.config.js`.

## Navegación y dependencias

El punto de entrada es `expo-router/entry`. Las rutas se encuentran en `src/app/`
y los archivos `_layout.tsx` configuran la navegación. Los componentes, hooks y
utilidades se mantienen fuera de ese directorio.

Para añadir una dependencia, utiliza Expo CLI para resolver una versión
compatible con el SDK:

```bash
npx expo install <paquete>
```

Consulta la [documentación de Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/),
la [generación de tipos de rutas](https://docs.expo.dev/router/reference/typed-routes/)
y la [configuración de ESLint](https://docs.expo.dev/guides/using-eslint/).
