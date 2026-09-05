/** Injected by Vite `define` (Task 13); the fallback keeps tests and the dev server honest. */
export const APP_VERSION: string =
  typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0-dev'
