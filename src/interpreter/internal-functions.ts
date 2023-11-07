export function substring(s: string, start: number, end: number) {
  return s.substring(start - 1, end)
}

export function length(s: string) {
  return s.length
}

const stringFunctions = {
  substring,
  length
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
    default:
      return undefined
  }
}