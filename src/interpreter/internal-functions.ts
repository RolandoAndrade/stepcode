export function substring(s: string, start: number, end: number) {
  return {
    value: s.substring(start - 1, end),
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
    default:
      return undefined
  }
}
