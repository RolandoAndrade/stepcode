import { ValidDataType } from './interpreter-types';

export function getInterpreterType(type: string): ValidDataType {
  switch (type.toLowerCase()) {
    case 'entero':
    case 'integer':
    case 'real':
      return 'integer'
    case 'cadena':
    case 'string':
      return 'string'
    case 'logico':
    case 'lógico':
    case 'boolean':
      return 'boolean'
    case 'caracter':
    case 'character':
      return 'character'
    default:
      throw new Error(`Invalid type ${type}`)
  }
}

export function parseValue(type: ValidDataType, value: string): any {
  switch (type) {
    case 'integer':
      return parseInt(value)
    case 'real':
      return parseFloat(value)
    case 'string':
      return value
    case 'boolean':
      return value === 'verdadero'
    case 'character':
      return value
    default:
      throw new Error(`Invalid type ${type}`)
  }
}