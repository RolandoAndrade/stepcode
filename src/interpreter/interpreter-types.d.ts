type DataTypes = 'string' | 'integer' | 'real' | 'boolean' | 'character'

export type ArrayType = `${ValidDataType|ArrayType}[]`

export type ValidDataType = DataTypes & ArrayType

export type OperationType = '+' | '-' | '*' | '/' | '%' | '==' | '!=' | '<' | '>' | '<=' | '>=' | '&&' | '||' | '!' | '++' | '--'