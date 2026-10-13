/* global __dirname */
// Tests execute the real TypeScript models/adapters with the existing compiler.
// Type checking remains the responsibility of `npm run typecheck`.
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '..');
const resolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveProjectAlias(request, parent, ...rest) {
  const resolvedRequest = request.startsWith('@/assets/')
    ? path.join(projectRoot, 'assets', request.slice('@/assets/'.length))
    : request.startsWith('@/')
      ? path.join(projectRoot, 'src', request.slice('@/'.length))
      : request;

  return resolveFilename.call(this, resolvedRequest, parent, ...rest);
};

function compileTypeScript(module, filename) {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });

  module._compile(result.outputText, filename);
}

require.extensions['.ts'] = compileTypeScript;
require.extensions['.tsx'] = compileTypeScript;
