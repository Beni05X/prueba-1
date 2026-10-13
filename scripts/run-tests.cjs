/* global __dirname */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const testDirectory = path.join(projectRoot, 'tests');

function findTests(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory()
      ? findTests(filename)
      : entry.name.endsWith('.test.cjs')
        ? [filename]
        : [];
  });
}

const tests = findTests(testDirectory).sort();
if (tests.length === 0) {
  process.stderr.write('No test files were found.\n');
  process.exitCode = 1;
} else {
  const result = spawnSync(process.execPath, [
    '--require', path.join(__dirname, 'register-typescript.cjs'),
    '--test',
    ...tests,
  ], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  if (result.error) {
    process.stderr.write(`${result.error.message}\n`);
  }
  process.exitCode = result.status ?? 1;
}
