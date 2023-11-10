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
    default:
      return undefined
  }
}