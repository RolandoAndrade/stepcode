import { ValidDataType } from './interpreter-types';

export type IdentifierReturnType = {
  identifier: string,
  type?: 'string' | 'integer' | 'real' | 'boolean' | 'character',
  value?: any
}

export type NumericVariable = IdentifierReturnType & {
  type: 'integer' | 'real',
  value: number
}

export type StringVariable = IdentifierReturnType & {
  type: 'string',
  value: string
}

export type BooleanVariable = IdentifierReturnType & {
  type: 'boolean',
  value: boolean
}

export type CharacterVariable = IdentifierReturnType & {
  type: 'character',
  value: string
}

export type VariableReturnType = NumericVariable | StringVariable | BooleanVariable | CharacterVariable

export type ExpressionReturnType = VariableReturnType

export type ReturnTypes = VariableReturnType | ExpressionReturnType | IdentifierReturnType