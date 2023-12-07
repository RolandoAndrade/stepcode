import { StepCodeInterpreter } from './stepcode-interpreter.ts';

export function substring(s: string, start: number, end: number) {
  return {
    value: s.substring(start - StepCodeInterpreter.ARRAY_START, end),
    type: 'string'
  }
}

export function length(s: string | any[]) {
  return {
    value: s.length,
    type: 'integer'
  }
}

export function uppercase(s: string) {
  return {
    value: s.toUpperCase(),
    type: 'string'
  }
}

export function lowercase(s: string) {
  return {
    value: s.toLowerCase(),
    type: 'string'
  }
}


type Return = (...args: any[]) => {
  value: any,
  type: string
}

function truncate(n: number) {
  return {
    value: Math.trunc(n),
    type: 'integer'
  }
}

function round(n: number) {
  return {
    value: Math.round(n),
    type: 'integer'
  }
}

function abs(n: number) {
  return {
    value: Math.abs(n),
    type: 'real'
  }
}

function random() {
  return {
    value: Math.random(),
    type: 'real'
  }
}

function parseNumber(n: any) {
  if (typeof n === 'number') {
    if (Number.isInteger(n)) {
      return {
        value: n,
        type: 'integer'
      }
    }
    return {
      value: n,
      type: 'real'
    }
  }
  if (typeof n === 'string') {
    if (n.includes('.')) {
      return {
        value: parseFloat(n),
        type: 'real'
      }
    }
    return {
      value: parseInt(n),
      type: 'integer'
    }
  }
  throw new Error(`Invalid number ${n}`)
}

function parseString(s: any) {
  return {
    value: s.toString(),
    type: 'string'
  }
}

export function getFunctionFromIdentifier(identifier: string): Return | undefined {
  switch (identifier.toLowerCase()) {
    case 'substring':
    case 'subcadena':
      return substring
    case 'length':
    case 'longitud':
      return length
    case 'upper':
    case 'mayusculas':
      return uppercase
    case 'lower':
    case 'minusculas':
      return lowercase
    case 'trunc':
    case 'truncar':
      return truncate
    case 'round':
    case 'redondear':
    case 'redon':
      return round
    case 'abs':
      return abs
    case 'random':
    case 'aleatorio':
      return random
    case 'convertiranumero':
    case 'tonum':
      return parseNumber
    case 'convertiracadena':
    case 'tostr':
      return parseString
    default:
      return undefined
  }
}
