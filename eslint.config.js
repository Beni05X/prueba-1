// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['src/hooks/use-color-scheme.web.ts'],
    rules: {
      // The Expo starter applies the device theme after web hydration.
      // Keep this diagnostic visible without changing the hydration hook.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);
