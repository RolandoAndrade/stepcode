import type { SymbolKind } from 'stepcode'
import type { WorkerState } from './runtime/protocol'

export type PanelKey = 'editor' | 'console' | 'problems' | 'variables'

/** Every human string the editor renders. Diagnostics come formatted from the language package. */
export interface Strings {
  readonly app: {
    readonly title: string
    readonly editor: string
    readonly untitled: string
    readonly shared: string
    /** Browser tab title: `● name · StepCode` when dirty. */
    readonly windowTitle: (name: string, dirty: boolean) => string
  }
  readonly profiles: Readonly<Record<string, string>>
  readonly panels: Readonly<Record<PanelKey, string>>
  readonly toolbar: {
    readonly menu: string
    readonly run: string
    readonly debug: string
    readonly continue: string
    readonly stepOver: string
    readonly stepInto: string
    readonly stepOut: string
    readonly pause: string
    readonly stop: string
    readonly new: string
    readonly open: string
    readonly save: string
    readonly saveAs: string
    readonly more: string
    readonly filename: string
    readonly profile: string
    readonly toLight: string
    readonly toDark: string
    readonly errors: (count: number) => string
    readonly warnings: (count: number) => string
  }
  readonly menu: {
    readonly examples: string
    readonly share: string
    readonly profile: string
    readonly customize: string
    readonly view: string
    readonly resetLayout: string
    readonly settings: string
    readonly about: string
  }
  readonly states: Readonly<Record<WorkerState, string>>
  readonly status: {
    readonly position: (line: number, column: number) => string
    readonly noProblems: string
    readonly problems: (errors: number, warnings: number) => string
    readonly ready: string
    readonly running: string
    readonly pausedAt: (line: number) => string
    readonly waitingInput: string
    readonly waiting: string
    readonly done: string
    readonly errorAt: (line: number) => string
    readonly cursor: string
    readonly state: string
  }
  readonly dock: {
    readonly collapse: string
    readonly expand: string
    readonly float: string
    readonly popout: string
  }
  readonly console: {
    readonly title: string
    readonly clear: string
    readonly autoScroll: string
    readonly read: (name: string, type: string) => string
    readonly pressKey: string
    readonly placeholder: string
    readonly submit: string
    readonly waiting: (millis: number) => string
    readonly errorAt: (line: number, message: string) => string
    readonly dropped: (count: number) => string
    readonly finished: string
    readonly seeLine: (line: number) => string
  }
  readonly variables: {
    readonly title: string
    readonly empty: string
    readonly pauseToSee: string
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
    readonly error: string
    readonly warning: string
    readonly line: (line: number) => string
  }
  readonly kinds: Readonly<Record<SymbolKind, string>>
  readonly dialog: {
    readonly close: string
    readonly cancel: string
    readonly ok: string
  }
  readonly confirmSave: {
    readonly title: (name: string) => string
    readonly body: string
    readonly save: string
    readonly discard: string
  }
  readonly warnings: {
    readonly title: string
    readonly body: string
    readonly runAnyway: string
  }
  readonly examples: {
    readonly title: string
    readonly search: string
    readonly empty: string
    readonly load: string
    readonly topics: Readonly<Record<string, string>>
  }
  readonly share: {
    readonly title: string
    readonly link: string
    readonly copy: string
    readonly copied: string
    readonly open: string
    readonly note: string
    readonly tooLong: string
    readonly unknownProfile: string
  }
  readonly about: {
    readonly title: string
    readonly tagline: string
    readonly version: (version: string) => string
    readonly repository: string
    readonly academy: string
    readonly licence: string
  }
  readonly settings: {
    readonly title: string
    readonly reset: string
    readonly sections: Readonly<
      Record<'language' | 'editor' | 'execution' | 'appearance' | 'layout', string>
    >
    readonly language: {
      readonly profile: string
      readonly customize: string
      readonly builder: string
      readonly base: string
      readonly name: string
      readonly nameHint: string
      readonly keywords: string
      readonly types: string
      readonly operators: string
      readonly builtins: string
      readonly options: string
      readonly spellingsHint: string
      readonly preview: string
      readonly save: string
      readonly delete: string
      readonly duplicate: string
      readonly invalid: (message: string) => string
      readonly option: Readonly<
        Record<
          | 'indexBase'
          | 'caseSensitive'
          | 'foldAccents'
          | 'implicitDeclarations'
          | 'requireSemicolons'
          | 'typedParameters'
          | 'assignWithEquals',
          string
        >
      >
    }
    readonly editor: {
      readonly fontSize: string
      readonly lineNumbers: string
      readonly wordWrap: string
      readonly autocomplete: string
      readonly tabSize: string
      readonly highlightLine: string
    }
    readonly execution: {
      readonly warnOnWarnings: string
      readonly clearConsoleOnRun: string
    }
    readonly appearance: {
      readonly theme: string
      readonly system: string
      readonly light: string
      readonly dark: string
      readonly uiLanguage: string
      readonly auto: string
      readonly spanish: string
      readonly english: string
    }
    readonly layout: {
      readonly reset: string
      readonly showConsoleOnRun: string
    }
  }
  readonly files: {
    readonly saved: string
    readonly downloaded: string
    readonly openFailed: string
    readonly saveFailed: string
    readonly accept: string
  }
  readonly pwa: {
    readonly updateAvailable: string
    readonly reload: string
  }
  readonly mobile: {
    readonly sheet: string
    readonly symbols: string
    readonly moreActions: string
  }
  readonly host: {
    readonly workerError: string
  }
}

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`

const es: Strings = {
  app: {
    title: 'StepCode',
    editor: 'Editor',
    untitled: 'sin título.stepcode',
    shared: 'compartido.stepcode',
    windowTitle: (name, dirty) => `${dirty ? '● ' : ''}${name} · StepCode`,
  },
  profiles: { es: 'Español', en: 'English', pseint: 'PSeInt' },
  panels: { editor: 'Editor', console: 'Consola', problems: 'Problemas', variables: 'Variables' },
  toolbar: {
    menu: 'Menú',
    run: 'Ejecutar',
    debug: 'Depurar',
    continue: 'Continuar',
    stepOver: 'Paso',
    stepInto: 'Entrar',
    stepOut: 'Salir',
    pause: 'Pausar',
    stop: 'Detener',
    new: 'Nuevo',
    open: 'Abrir…',
    save: 'Guardar',
    saveAs: 'Guardar como…',
    more: 'Más acciones',
    filename: 'Nombre del archivo',
    profile: 'Perfil',
    toLight: 'Tema claro',
    toDark: 'Tema oscuro',
    errors: (count) => plural(count, 'error', 'errores'),
    warnings: (count) => plural(count, 'advertencia', 'advertencias'),
  },
  menu: {
    examples: 'Ejemplos…',
    share: 'Compartir…',
    profile: 'Perfil',
    customize: 'Personalizar…',
    view: 'Vista',
    resetLayout: 'Restablecer diseño',
    settings: 'Ajustes…',
    about: 'Acerca de',
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
  status: {
    position: (line, column) => `Ln ${line}, Col ${column}`,
    noProblems: '✓ Sin problemas',
    problems: (errors, warnings) => `✖ ${errors}  ▲ ${warnings}`,
    ready: 'Listo',
    running: 'Ejecutando…',
    pausedAt: (line) => `En pausa en la línea ${line}`,
    waitingInput: 'Esperando entrada',
    waiting: 'Esperando…',
    done: 'Terminado',
    errorAt: (line) => `Error en la línea ${line}`,
    cursor: 'Posición del cursor',
    state: 'Estado',
  },
  dock: { collapse: 'Contraer', expand: 'Expandir', float: 'Flotar', popout: 'Abrir en ventana' },
  console: {
    title: 'Consola',
    clear: 'Limpiar',
    autoScroll: 'Desplazamiento automático',
    read: (name, type) => `Leer ${name} (${type})`,
    pressKey: 'Presiona una tecla',
    placeholder: 'Escribe y presiona Enter',
    submit: 'Enviar',
    waiting: (millis) => `Esperando ${millis} ms`,
    errorAt: (line, message) => `Línea ${line}: ${message}`,
    dropped: (count) => `… ${count} fragmentos descartados`,
    finished: '— Programa terminado —',
    seeLine: (line) => `ver línea ${line}`,
  },
  variables: {
    title: 'Variables',
    empty: 'Sin programa en ejecución',
    pauseToSee: 'Pausa el programa para ver las variables',
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
    error: 'error',
    warning: 'advertencia',
    line: (line) => `línea ${line}`,
  },
  kinds: {
    variable: 'variable',
    parameter: 'parámetro',
    result: 'resultado',
    constant: 'constante',
    counter: 'contador',
    subprogram: 'subprograma',
  },
  dialog: { close: 'Cerrar', cancel: 'Cancelar', ok: 'Aceptar' },
  confirmSave: {
    title: (name) => `¿Guardar los cambios de ${name}?`,
    body: 'Si no los guardas, se perderán.',
    save: 'Guardar',
    discard: 'No guardar',
  },
  warnings: {
    title: 'El programa tiene advertencias',
    body: 'Puedes ejecutarlo igualmente o revisarlas primero.',
    runAnyway: 'Ejecutar igualmente',
  },
  examples: {
    title: 'Ejemplos',
    search: 'Buscar ejemplos',
    empty: 'Ningún ejemplo coincide',
    load: 'Abrir ejemplo',
    topics: {
      'primeros-pasos': 'Primeros pasos',
      condicionales: 'Condicionales',
      ciclos: 'Ciclos',
      arreglos: 'Arreglos',
      funciones: 'Funciones',
      'un-poco-mas': 'Un poco más',
    },
  },
  share: {
    title: 'Compartir',
    link: 'Enlace',
    copy: 'Copiar',
    copied: 'Enlace copiado',
    open: 'Abrir en nueva pestaña',
    note: 'El programa viaja dentro del enlace; no se guarda en ningún servidor.',
    tooLong: 'El enlace es muy largo; algunas aplicaciones lo recortan.',
    unknownProfile: 'El enlace usa un perfil que no existe aquí; se abrió con Español.',
  },
  about: {
    title: 'Acerca de',
    tagline: 'Editor de pseudocódigo',
    version: (version) => `Versión ${version}`,
    repository: 'Repositorio',
    academy: 'Academia',
    licence: 'Licencia MIT',
  },
  settings: {
    title: 'Ajustes',
    reset: 'Restablecer',
    sections: {
      language: 'Lenguaje',
      editor: 'Editor',
      execution: 'Ejecución',
      appearance: 'Apariencia',
      layout: 'Diseño',
    },
    language: {
      profile: 'Perfil',
      customize: 'Personalizar…',
      builder: 'Perfil personalizado',
      base: 'Basado en',
      name: 'Nombre',
      nameHint: 'Solo letras, números y guiones',
      keywords: 'Palabras clave',
      types: 'Tipos',
      operators: 'Operadores',
      builtins: 'Funciones',
      options: 'Opciones',
      spellingsHint: 'Separa alternativas con comas; la primera es la principal',
      preview: 'Vista previa',
      save: 'Guardar perfil',
      delete: 'Eliminar perfil',
      duplicate: 'Ya existe un perfil con ese nombre',
      invalid: (message) => `Perfil inválido: ${message}`,
      option: {
        indexBase: 'Arreglos empiezan en 1',
        caseSensitive: 'Distinguir mayúsculas',
        foldAccents: 'Ignorar acentos',
        implicitDeclarations: 'Declaraciones implícitas',
        requireSemicolons: 'Exigir punto y coma',
        typedParameters: 'Parámetros con tipo',
        assignWithEquals: 'Asignar con =',
      },
    },
    editor: {
      fontSize: 'Tamaño de letra',
      lineNumbers: 'Números de línea',
      wordWrap: 'Ajustar líneas',
      autocomplete: 'Autocompletar',
      tabSize: 'Tamaño de tabulación',
      highlightLine: 'Resaltar la línea actual',
    },
    execution: {
      warnOnWarnings: 'Avisar antes de ejecutar con advertencias',
      clearConsoleOnRun: 'Limpiar la consola al ejecutar',
    },
    appearance: {
      theme: 'Tema',
      system: 'Sistema',
      light: 'Claro',
      dark: 'Oscuro',
      uiLanguage: 'Idioma de la interfaz',
      auto: 'Automático',
      spanish: 'Español',
      english: 'English',
    },
    layout: { reset: 'Restablecer diseño', showConsoleOnRun: 'Mostrar la consola al ejecutar' },
  },
  files: {
    saved: 'Guardado',
    downloaded: 'Descargado',
    openFailed: 'No se pudo abrir el archivo',
    saveFailed: 'No se pudo guardar el archivo',
    accept: 'Programas StepCode',
  },
  pwa: { updateAvailable: 'Hay una versión nueva', reload: 'Recargar' },
  mobile: { sheet: 'Paneles', symbols: 'Símbolos', moreActions: 'Más acciones' },
  host: { workerError: 'Error interno del intérprete' },
}

const en: Strings = {
  app: {
    title: 'StepCode',
    editor: 'Editor',
    untitled: 'untitled.stepcode',
    shared: 'shared.stepcode',
    windowTitle: (name, dirty) => `${dirty ? '● ' : ''}${name} · StepCode`,
  },
  profiles: { es: 'Español', en: 'English', pseint: 'PSeInt' },
  panels: { editor: 'Editor', console: 'Console', problems: 'Problems', variables: 'Variables' },
  toolbar: {
    menu: 'Menu',
    run: 'Run',
    debug: 'Debug',
    continue: 'Continue',
    stepOver: 'Step over',
    stepInto: 'Step into',
    stepOut: 'Step out',
    pause: 'Pause',
    stop: 'Stop',
    new: 'New',
    open: 'Open…',
    save: 'Save',
    saveAs: 'Save as…',
    more: 'More actions',
    filename: 'File name',
    profile: 'Profile',
    toLight: 'Light theme',
    toDark: 'Dark theme',
    errors: (count) => plural(count, 'error', 'errors'),
    warnings: (count) => plural(count, 'warning', 'warnings'),
  },
  menu: {
    examples: 'Examples…',
    share: 'Share…',
    profile: 'Profile',
    customize: 'Customize…',
    view: 'View',
    resetLayout: 'Reset layout',
    settings: 'Settings…',
    about: 'About',
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
  status: {
    position: (line, column) => `Ln ${line}, Col ${column}`,
    noProblems: '✓ No problems',
    problems: (errors, warnings) => `✖ ${errors}  ▲ ${warnings}`,
    ready: 'Ready',
    running: 'Running…',
    pausedAt: (line) => `Paused at line ${line}`,
    waitingInput: 'Waiting for input',
    waiting: 'Waiting…',
    done: 'Done',
    errorAt: (line) => `Error at line ${line}`,
    cursor: 'Cursor position',
    state: 'State',
  },
  dock: { collapse: 'Collapse', expand: 'Expand', float: 'Float', popout: 'Open in window' },
  console: {
    title: 'Console',
    clear: 'Clear',
    autoScroll: 'Auto-scroll',
    read: (name, type) => `Read ${name} (${type})`,
    pressKey: 'Press a key',
    placeholder: 'Type and press Enter',
    submit: 'Send',
    waiting: (millis) => `Waiting ${millis} ms`,
    errorAt: (line, message) => `Line ${line}: ${message}`,
    dropped: (count) => `… ${count} chunks dropped`,
    finished: '— Program finished —',
    seeLine: (line) => `see line ${line}`,
  },
  variables: {
    title: 'Variables',
    empty: 'No program running',
    pauseToSee: 'Pause the program to see its variables',
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
    error: 'error',
    warning: 'warning',
    line: (line) => `line ${line}`,
  },
  kinds: {
    variable: 'variable',
    parameter: 'parameter',
    result: 'result',
    constant: 'constant',
    counter: 'counter',
    subprogram: 'subprogram',
  },
  dialog: { close: 'Close', cancel: 'Cancel', ok: 'OK' },
  confirmSave: {
    title: (name) => `Save changes to ${name}?`,
    body: 'Unsaved changes will be lost.',
    save: 'Save',
    discard: "Don't save",
  },
  warnings: {
    title: 'The program has warnings',
    body: 'You can run it anyway or review them first.',
    runAnyway: 'Run anyway',
  },
  examples: {
    title: 'Examples',
    search: 'Search examples',
    empty: 'No example matches',
    load: 'Open example',
    topics: {
      'primeros-pasos': 'First steps',
      condicionales: 'Conditionals',
      ciclos: 'Loops',
      arreglos: 'Arrays',
      funciones: 'Functions',
      'un-poco-mas': 'A bit more',
    },
  },
  share: {
    title: 'Share',
    link: 'Link',
    copy: 'Copy',
    copied: 'Link copied',
    open: 'Open in new tab',
    note: 'The program travels inside the link; nothing is stored on a server.',
    tooLong: 'The link is very long; some apps truncate it.',
    unknownProfile: 'The link uses a profile that does not exist here; opened with Español.',
  },
  about: {
    title: 'About',
    tagline: 'Pseudocode editor',
    version: (version) => `Version ${version}`,
    repository: 'Repository',
    academy: 'Academy',
    licence: 'MIT licence',
  },
  settings: {
    title: 'Settings',
    reset: 'Reset',
    sections: {
      language: 'Language',
      editor: 'Editor',
      execution: 'Execution',
      appearance: 'Appearance',
      layout: 'Layout',
    },
    language: {
      profile: 'Profile',
      customize: 'Customize…',
      builder: 'Custom profile',
      base: 'Based on',
      name: 'Name',
      nameHint: 'Letters, digits and hyphens only',
      keywords: 'Keywords',
      types: 'Types',
      operators: 'Operators',
      builtins: 'Functions',
      options: 'Options',
      spellingsHint: 'Separate alternatives with commas; the first is primary',
      preview: 'Preview',
      save: 'Save profile',
      delete: 'Delete profile',
      duplicate: 'A profile with that name already exists',
      invalid: (message) => `Invalid profile: ${message}`,
      option: {
        indexBase: 'Arrays start at 1',
        caseSensitive: 'Case sensitive',
        foldAccents: 'Ignore accents',
        implicitDeclarations: 'Implicit declarations',
        requireSemicolons: 'Require semicolons',
        typedParameters: 'Typed parameters',
        assignWithEquals: 'Assign with =',
      },
    },
    editor: {
      fontSize: 'Font size',
      lineNumbers: 'Line numbers',
      wordWrap: 'Word wrap',
      autocomplete: 'Autocomplete',
      tabSize: 'Tab size',
      highlightLine: 'Highlight current line',
    },
    execution: {
      warnOnWarnings: 'Warn before running with warnings',
      clearConsoleOnRun: 'Clear the console on run',
    },
    appearance: {
      theme: 'Theme',
      system: 'System',
      light: 'Light',
      dark: 'Dark',
      uiLanguage: 'Interface language',
      auto: 'Automatic',
      spanish: 'Español',
      english: 'English',
    },
    layout: { reset: 'Reset layout', showConsoleOnRun: 'Show the console on run' },
  },
  files: {
    saved: 'Saved',
    downloaded: 'Downloaded',
    openFailed: 'The file could not be opened',
    saveFailed: 'The file could not be saved',
    accept: 'StepCode programs',
  },
  pwa: { updateAvailable: 'A new version is available', reload: 'Reload' },
  mobile: { sheet: 'Panels', symbols: 'Symbols', moreActions: 'More actions' },
  host: { workerError: 'Internal interpreter error' },
}

const tables: Readonly<Record<string, Strings>> = { es, en }

/** Spec §11: by primary subtag; anything unknown is Spanish, the editor's home locale. */
export function stringsFor(locale: string): Strings {
  const primary = locale.toLowerCase().split('-')[0] ?? ''
  return tables[primary] ?? es
}
