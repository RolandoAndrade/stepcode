import { ValidDataType } from './interpreter-types';

export function getInterpreterType(type: string): ValidDataType {
  switch (type.toLowerCase()) {
    case 'entero':
    case 'integer':
      return 'integer'
    case 'real':
    case 'float':
      return 'real'
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

export function isStructuredType(type: ValidDataType): boolean {
  return type === 'string' || type.includes('[]')
}

export function createNDArray(shape: number[], type: ValidDataType): {
  array: any[],
  type: string
} {
  if (shape.length === 1) {
    return {
      array: Array(shape[0]),
      type: `${type}[]`
    }
  } else {
    const array = Array(shape[0])
    let newType = type
    for (let i = 0; i < shape[0]; i++) {
      const child = createNDArray(shape.slice(1), type)
      array[i] = child.array
      newType = child.type
    }
    return {
      array,
      type: `${newType}[]`
    }
  }
}
