import type { BuiltinKey, KeywordKey, TypeKey } from '@stepcode/profiles'
import type { OperandClass, SymbolKind } from 'stepcode'

export type PlaceholderKey =
  | 'condition'
  | 'value'
  | 'name'
  | 'parameters'
  | 'result'
  | 'counter'
  | 'start'
  | 'limit'
  | 'case'
  | 'variable'
  | 'type'
  | 'message'
  | 'size'

/**
 * One plain sentence per keyword, type and builtin, written for someone meeting the language
 * for the first time — completion `info` and the hover tooltip both read from here (spec §5.7).
 */
export interface Descriptions {
  readonly keywords: Readonly<Record<KeywordKey, string>>
  readonly types: Readonly<Record<TypeKey, string>>
  readonly builtins: Readonly<Record<BuiltinKey, string>>
}

/** Every human string this package renders outside diagnostics (spec §9). */
export interface Strings {
  readonly kinds: Readonly<Record<SymbolKind, string>>
  readonly procedure: string
  readonly function: string
  readonly byReference: string
  readonly declaredAt: (line: number) => string
  readonly replaceWith: (name: string) => string
  readonly operandClass: Readonly<Record<OperandClass, string>>
  /** A builtin whose result type is its first argument's. */
  readonly same: string
  /** Snippet field names; ASCII so the inserted program stays lexable. */
  readonly placeholders: Readonly<Record<PlaceholderKey, string>>
  readonly descriptions: Descriptions
}

const es: Strings = {
  kinds: {
    variable: 'variable',
    parameter: 'parámetro',
    result: 'resultado',
    constant: 'constante',
    counter: 'contador',
    subprogram: 'subprograma',
  },
  procedure: 'procedimiento',
  function: 'función',
  byReference: 'por referencia',
  declaredAt: (line) => `declarada en la línea ${line}`,
  replaceWith: (name) => `Cambiar a «${name}»`,
  operandClass: {
    numeric: 'número',
    text: 'texto',
    boolean: 'lógico',
    integer: 'entero',
    scalar: 'valor',
  },
  same: 'igual al argumento',
  placeholders: {
    condition: 'condicion',
    value: 'valor',
    name: 'nombre',
    parameters: 'parametros',
    result: 'resultado',
    counter: 'contador',
    start: 'inicio',
    limit: 'limite',
    case: 'caso',
    variable: 'variable',
    type: 'tipo',
    message: 'mensaje',
    size: 'tamano',
  },
  descriptions: {
    keywords: {
      program: 'Marca donde empieza el programa principal.',
      endProgram: 'Marca donde termina el programa principal.',
      define: 'Crea una variable nueva y dice de qué tipo es.',
      as: 'Une el nombre de la variable con su tipo.',
      constant: 'Crea un valor con nombre que nunca cambia.',
      dimension: 'Crea un arreglo con la cantidad de casillas que indiques.',
      if: 'Ejecuta unas instrucciones solo si la condición se cumple.',
      // biome-ignore lint/suspicious/noThenProperty: `then` is a StepCode keyword key, and this table is keyed by KeywordKey
      then: 'Empieza las instrucciones que se ejecutan cuando la condición se cumple.',
      elseIf: 'Prueba otra condición cuando la anterior no se cumplió.',
      else: 'Ejecuta estas instrucciones cuando ninguna condición se cumplió.',
      endIf: 'Cierra la instrucción condicional.',
      switch: 'Elige un camino comparando un valor con varios casos.',
      case: 'Empieza el camino que corresponde a un valor concreto.',
      otherwise: 'Empieza el camino que se toma cuando ningún caso coincide.',
      endSwitch: 'Cierra la selección por casos.',
      while: 'Repite instrucciones mientras la condición siga cumpliéndose.',
      do: 'Empieza el cuerpo que se repite.',
      endWhile: 'Cierra el ciclo que repite mientras se cumple una condición.',
      for: 'Repite instrucciones contando desde un valor hasta otro.',
      to: 'Indica el valor hasta el que cuenta el ciclo.',
      step: 'Indica de cuánto en cuánto avanza el contador.',
      endFor: 'Cierra el ciclo que cuenta.',
      repeat: 'Repite instrucciones al menos una vez y prueba la condición al final.',
      until: 'Indica la condición que detiene el ciclo.',
      break: 'Sale del ciclo de inmediato.',
      continue: 'Salta al siguiente turno del ciclo.',
      procedure: 'Define un grupo de instrucciones con nombre que no devuelve un valor.',
      endProcedure: 'Cierra la definición del subproceso.',
      function: 'Define un grupo de instrucciones con nombre que devuelve un valor.',
      endFunction: 'Cierra la definición de la función.',
      return: 'Termina el subprograma y devuelve un valor.',
      byRef: 'Hace que el parámetro comparta la variable de quien llama.',
      byValue: 'Hace que el parámetro reciba una copia del valor.',
      write: 'Muestra un valor en la consola.',
      writeNoNewline: 'Muestra un valor en la consola sin pasar a la línea siguiente.',
      read: 'Lee un valor escrito por el usuario y lo guarda en la variable.',
      clearScreen: 'Borra todo lo que hay escrito en la consola.',
      wait: 'Detiene el programa durante el tiempo indicado.',
      waitKey: 'Detiene el programa hasta que el usuario presione una tecla.',
      and: 'Es verdadero solo si las dos condiciones son verdaderas.',
      or: 'Es verdadero si al menos una de las dos condiciones es verdadera.',
      not: 'Invierte una condición: lo verdadero pasa a falso.',
      mod: 'Da el residuo de una división entera.',
      div: 'Da el cociente entero de una división.',
      true: 'El valor lógico verdadero.',
      false: 'El valor lógico falso.',
    },
    types: {
      integer: 'Números sin decimales.',
      real: 'Números con decimales.',
      string: 'Texto: una serie de caracteres entre comillas.',
      char: 'Un solo carácter.',
      boolean: 'Solo dos valores posibles: verdadero o falso.',
    },
    builtins: {
      abs: 'Da el valor de un número sin su signo.',
      sqrt: 'Da la raíz cuadrada de un número.',
      ln: 'Da el logaritmo natural de un número.',
      exp: 'Eleva el número e a la potencia indicada.',
      sin: 'Da el seno de un ángulo medido en radianes.',
      cos: 'Da el coseno de un ángulo medido en radianes.',
      tan: 'Da la tangente de un ángulo medido en radianes.',
      asin: 'Da el ángulo en radianes cuyo seno es el valor dado.',
      acos: 'Da el ángulo en radianes cuyo coseno es el valor dado.',
      atan: 'Da el ángulo en radianes cuya tangente es el valor dado.',
      trunc: 'Quita los decimales de un número.',
      round: 'Redondea un número al entero más cercano.',
      random: 'Da un número al azar entre 0 y 1.',
      randomBetween: 'Da un número entero al azar dentro del rango indicado.',
      pi: 'El valor de pi.',
      length: 'Da cuántos caracteres tiene un texto.',
      upper: 'Convierte un texto a mayúsculas.',
      lower: 'Convierte un texto a minúsculas.',
      substring: 'Da el trozo de texto que hay entre dos posiciones.',
      concat: 'Une dos textos en uno solo.',
      toNumber: 'Convierte un texto en número.',
      toText: 'Convierte un número en texto.',
    },
  },
}

const en: Strings = {
  kinds: {
    variable: 'variable',
    parameter: 'parameter',
    result: 'result',
    constant: 'constant',
    counter: 'counter',
    subprogram: 'subprogram',
  },
  procedure: 'procedure',
  function: 'function',
  byReference: 'by reference',
  declaredAt: (line) => `declared on line ${line}`,
  replaceWith: (name) => `Replace with "${name}"`,
  operandClass: {
    numeric: 'number',
    text: 'text',
    boolean: 'boolean',
    integer: 'integer',
    scalar: 'value',
  },
  same: 'same as the argument',
  placeholders: {
    condition: 'condition',
    value: 'value',
    name: 'name',
    parameters: 'parameters',
    result: 'result',
    counter: 'counter',
    start: 'start',
    limit: 'limit',
    case: 'case',
    variable: 'variable',
    type: 'type',
    message: 'message',
    size: 'size',
  },
  descriptions: {
    keywords: {
      program: 'Marks where the main program starts.',
      endProgram: 'Marks where the main program ends.',
      define: 'Creates a new variable and says what type it holds.',
      as: 'Joins a variable name to its type.',
      constant: 'Creates a named value that never changes.',
      dimension: 'Creates an array with as many slots as you ask for.',
      if: 'Runs some instructions only when the condition holds.',
      // biome-ignore lint/suspicious/noThenProperty: `then` is a StepCode keyword key, and this table is keyed by KeywordKey
      then: 'Starts the instructions that run when the condition holds.',
      elseIf: 'Tries another condition when the previous one did not hold.',
      else: 'Runs these instructions when no condition held.',
      endIf: 'Closes the conditional instruction.',
      switch: 'Picks one path by comparing a value against several cases.',
      case: 'Starts the path for one particular value.',
      otherwise: 'Starts the path taken when no case matches.',
      endSwitch: 'Closes the selection by cases.',
      while: 'Repeats instructions while the condition keeps holding.',
      do: 'Starts the body that repeats.',
      endWhile: 'Closes the loop that repeats while a condition holds.',
      for: 'Repeats instructions counting from one value up to another.',
      to: 'Gives the value the loop counts up to.',
      step: 'Gives how much the counter advances each turn.',
      endFor: 'Closes the counting loop.',
      repeat: 'Repeats instructions at least once and tests the condition at the end.',
      until: 'Gives the condition that stops the loop.',
      break: 'Leaves the loop right away.',
      continue: 'Jumps to the next turn of the loop.',
      procedure: 'Defines a named group of instructions that returns no value.',
      endProcedure: 'Closes the procedure definition.',
      function: 'Defines a named group of instructions that returns a value.',
      endFunction: 'Closes the function definition.',
      return: 'Ends the subprogram and hands a value back.',
      byRef: 'Makes the parameter share the caller variable.',
      byValue: 'Makes the parameter receive a copy of the value.',
      write: 'Shows a value in the console.',
      writeNoNewline: 'Shows a value in the console without moving to the next line.',
      read: 'Reads a value typed by the user and stores it in the variable.',
      clearScreen: 'Erases everything written in the console.',
      wait: 'Pauses the program for the time given.',
      waitKey: 'Pauses the program until the user presses a key.',
      and: 'True only when both conditions are true.',
      or: 'True when at least one of the two conditions is true.',
      not: 'Flips a condition: what was true becomes false.',
      mod: 'Gives the remainder of an integer division.',
      div: 'Gives the whole-number quotient of a division.',
      true: 'The boolean value true.',
      false: 'The boolean value false.',
    },
    types: {
      integer: 'Numbers with no decimals.',
      real: 'Numbers with decimals.',
      string: 'Text: a run of characters between quotes.',
      char: 'A single character.',
      boolean: 'Only two possible values: true or false.',
    },
    builtins: {
      abs: 'Gives a number without its sign.',
      sqrt: 'Gives the square root of a number.',
      ln: 'Gives the natural logarithm of a number.',
      exp: 'Raises the number e to the given power.',
      sin: 'Gives the sine of an angle measured in radians.',
      cos: 'Gives the cosine of an angle measured in radians.',
      tan: 'Gives the tangent of an angle measured in radians.',
      asin: 'Gives the angle in radians whose sine is the given value.',
      acos: 'Gives the angle in radians whose cosine is the given value.',
      atan: 'Gives the angle in radians whose tangent is the given value.',
      trunc: 'Drops the decimals of a number.',
      round: 'Rounds a number to the nearest whole number.',
      random: 'Gives a random number between 0 and 1.',
      randomBetween: 'Gives a random whole number inside the given range.',
      pi: 'The value of pi.',
      length: 'Gives how many characters a text has.',
      upper: 'Turns a text into upper case.',
      lower: 'Turns a text into lower case.',
      substring: 'Gives the piece of text between two positions.',
      concat: 'Joins two texts into one.',
      toNumber: 'Turns a text into a number.',
      toText: 'Turns a number into text.',
    },
  },
}

const TABLES: Readonly<Record<string, Strings>> = { es, en }

/** The table for a BCP-47 tag: exact, then primary subtag (`es-MX` → `es`), then `en`. */
export function stringsFor(locale: string): Strings {
  const exact = TABLES[locale]
  if (exact !== undefined) return exact
  const primary = locale.split('-')[0] ?? ''
  return TABLES[primary] ?? en
}
