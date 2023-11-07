export function substring(s: string, start: number, end: number) {
  return s.substring(start - 1, end)
}

export function length(s: string) {
  return s.length
}

export function uppercase(s: string) {
  return s.toUpperCase()
}

export function lowercase(s: string) {
  return s.toLowerCase()
}


type Return = (...args: any[]) => any

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