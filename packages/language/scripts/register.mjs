// Node's own ESM resolver does not probe file extensions the way `tsc`/bundlers do: an
// extensionless specifier like `./run-source` or `../src/index` simply fails to resolve, even
// under `--experimental-transform-types`. This codebase's convention (tsconfig.base.json's
// `moduleResolution: "bundler"`) is extensionless imports everywhere, so a script run with
// plain `node` cannot load its own module graph. This hook fixes that, and only that: it
// retries an unresolved relative or `@stepcode/`-workspace specifier with `.ts` and then
// `/index.ts` appended, and marks `.json` imports with the `type: "json"` attribute Node's
// loader now requires (`@stepcode/profiles` imports its locale tables as JSON). It changes
// nothing else, and is used only for running these scripts directly:
//
//   node --experimental-transform-types --conditions=development \
//     --import ./packages/language/scripts/register.mjs \
//     packages/language/scripts/<script>.ts

import { register } from 'node:module'

// `--import` only loads this module in the main thread; it does not by itself install the
// hooks below in the dedicated loader thread. Registering the same file as its own hooks
// module is what actually wires `resolve`/`load` into module resolution.
register(import.meta.url, import.meta.url)

/** @type {import('node:module').ResolveHook} */
export async function resolve(specifier, context, nextResolve) {
  const extensionless =
    (specifier.startsWith('.') ||
      specifier.startsWith('/') ||
      specifier.startsWith('@stepcode/')) &&
    !/\.[a-zA-Z]+$/.test(specifier)
  if (extensionless) {
    try {
      return await nextResolve(specifier, context)
    } catch (error) {
      if (error?.code !== 'ERR_MODULE_NOT_FOUND') throw error
      for (const candidate of [`${specifier}.ts`, `${specifier}/index.ts`]) {
        try {
          return await nextResolve(candidate, context)
        } catch {
          // try the next candidate
        }
      }
      throw error
    }
  }
  if (specifier.endsWith('.json')) {
    const result = await nextResolve(specifier, context)
    return { ...result, importAttributes: { ...result.importAttributes, type: 'json' } }
  }
  return nextResolve(specifier, context)
}

/** @type {import('node:module').LoadHook} */
export async function load(url, context, nextLoad) {
  if (url.endsWith('.json')) {
    return nextLoad(url, {
      ...context,
      importAttributes: { ...context.importAttributes, type: 'json' },
    })
  }
  return nextLoad(url, context)
}
