import type { SymbolKind } from 'stepcode'
import type { WorkerState } from './runtime/protocol'

/** Every human string the editor renders. Diagnostics come formatted from the language package. */
export interface Strings {
  readonly app: { readonly title: string; readonly editor: string }
  readonly toolbar: {
    readonly run: string
    readonly continue: string
    readonly step: string
    readonly stepOver: string
    readonly stepInto: string
    readonly stepOut: string
    readonly pause: string
    readonly stop: string
    readonly profile: string
    readonly toLight: string
    readonly toDark: string
    readonly errors: (count: number) => string
    readonly warnings: (count: number) => string
  }
  readonly states: Readonly<Record<WorkerState, string>>
  readonly console: {
    readonly title: string
    readonly clear: string
    readonly read: (name: string, type: string) => string
    readonly pressKey: string
    readonly placeholder: string
    readonly submit: string
    readonly waiting: (millis: number) => string
    readonly errorAt: (line: number, message: string) => string
    readonly dropped: (count: number) => string
  }
  readonly variables: {
    readonly title: string
    readonly empty: string
    readonly name: string
    readonly kind: string
    readonly type: string
    readonly value: string
    readonly unassigned: string
    readonly frameAt: (name: string, line: number) => string
    readonly arrayOf: (element: string, rank: number) => string
    readonly more: (count: number) => string
  }
  readonly problems: {
    readonly title: string
    readonly empty: string
    readonly summary: (errors: number, warnings: number) => string
  }
  readonly kinds: Readonly<Record<SymbolKind, string>>
}

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`

const es: Strings = {
  app: { title: 'StepCode', editor: 'Editor' },
  toolbar: {
    run: 'Ejecutar',
    continue: 'Continuar',
    step: 'Paso',
    stepOver: 'Pasar por encima',
    stepInto: 'Entrar',
    stepOut: 'Salir',
    pause: 'Pausar',
    stop: 'Detener',
    profile: 'Perfil',
    toLight: 'Tema claro',
    toDark: 'Tema oscuro',
    errors: (count) => plural(count, 'error', 'errores'),
    warnings: (count) => plural(count, 'advertencia', 'advertencias'),
  },
  states: {
    ready: 'Listo',
    running: 'Ejecutando',
    paused: 'En pausa',
    input: 'Esperando entrada',
    waiting: 'Esperando',
    done: 'Terminado',
    error: 'Error',
  },
  console: {
    title: 'Consola',
    clear: 'Limpiar',
    read: (name, type) => `Leer ${name} (${type})`,
    pressKey: 'Presiona una tecla',
    placeholder: 'Escribe y presiona Enter',
    submit: 'Enviar',
    waiting: (millis) => `Esperando ${millis} ms`,
    errorAt: (line, message) => `Línea ${line}: ${message}`,
    dropped: (count) => `… ${count} fragmentos descartados`,
  },
  variables: {
    title: 'Variables',
    empty: 'Sin programa en ejecución',
    name: 'Nombre',
    kind: 'Clase',
    type: 'Tipo',
    value: 'Valor',
    unassigned: '—',
    frameAt: (name, line) => `${name} · línea ${line}`,
    arrayOf: (element, rank) =>
      rank === 1 ? `Arreglo de ${element}` : `Arreglo de ${element} (${rank}D)`,
    more: (count) => `… (+${count})`,
  },
  problems: {
    title: 'Problemas',
    empty: 'Sin problemas',
    summary: (errors, warnings) =>
      `${plural(errors, 'error', 'errores')}, ${plural(warnings, 'advertencia', 'advertencias')}`,
  },
  kinds: {
    variable: 'variable',
    parameter: 'parámetro',
    result: 'resultado',
    constant: 'constante',
    counter: 'contador',
    subprogram: 'subprograma',
  },
}

const en: Strings = {
  app: { title: 'StepCode', editor: 'Editor' },
  toolbar: {
    run: 'Run',
    continue: 'Continue',
    step: 'Step',
    stepOver: 'Step over',
    stepInto: 'Step into',
    stepOut: 'Step out',
    pause: 'Pause',
    stop: 'Stop',
    profile: 'Profile',
    toLight: 'Light theme',
    toDark: 'Dark theme',
    errors: (count) => plural(count, 'error', 'errors'),
    warnings: (count) => plural(count, 'warning', 'warnings'),
  },
  states: {
    ready: 'Ready',
    running: 'Running',
    paused: 'Paused',
    input: 'Waiting for input',
    waiting: 'Waiting',
    done: 'Done',
    error: 'Error',
  },
  console: {
    title: 'Console',
    clear: 'Clear',
    read: (name, type) => `Read ${name} (${type})`,
    pressKey: 'Press a key',
    placeholder: 'Type and press Enter',
    submit: 'Send',
    waiting: (millis) => `Waiting ${millis} ms`,
    errorAt: (line, message) => `Line ${line}: ${message}`,
    dropped: (count) => `… ${count} chunks dropped`,
  },
  variables: {
    title: 'Variables',
    empty: 'No program running',
    name: 'Name',
    kind: 'Kind',
    type: 'Type',
    value: 'Value',
    unassigned: '—',
    frameAt: (name, line) => `${name} · line ${line}`,
    arrayOf: (element, rank) =>
      rank === 1 ? `Array of ${element}` : `Array of ${element} (${rank}D)`,
    more: (count) => `… (+${count})`,
  },
  problems: {
    title: 'Problems',
    empty: 'No problems',
    summary: (errors, warnings) =>
      `${plural(errors, 'error', 'errors')}, ${plural(warnings, 'warning', 'warnings')}`,
  },
  kinds: {
    variable: 'variable',
    parameter: 'parameter',
    result: 'result',
    constant: 'constant',
    counter: 'counter',
    subprogram: 'subprogram',
  },
}

const tables: Readonly<Record<string, Strings>> = { es, en }

/** Spec §11: by primary subtag; anything unknown is Spanish, the editor's home locale. */
export function stringsFor(locale: string): Strings {
  const primary = locale.toLowerCase().split('-')[0] ?? ''
  return tables[primary] ?? es
}
