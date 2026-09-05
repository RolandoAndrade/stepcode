import type { DiagnosticCode } from '../codes'
import type { Catalog } from '../format'

const templates: Record<DiagnosticCode, string> = {
  E1001: 'I do not understand "{text}" here.',
  E1002: 'This text is missing its closing quote.',
  E1003:
    '"{text}" is not a valid number: leave a space or an operator between the number and the letters.',
  E1006: '"==" is not part of StepCode: write "{op:equal}" to compare two values.',
  E2001: 'This statement is missing its ";".',
  E2002: 'I did not expect "{found}" here.',
  E2003: '"{kw:$closer}" is missing: the "{kw:$opener}" on line {openerLine} is never closed.',
  E2004: '"{kw:$expected}" is missing here.',
  E2005: '"{bracket}" is missing: a bracket is left open.',
  E2006: '"{kw:$closer}" does not close any open block.',
  E2010: 'The main block is missing: a program needs "{kw:program}" … "{kw:endProgram}".',
  E2011: 'There is already a "{kw:program}" block in this file: only one is allowed.',
  E2012: '"{found}" is outside every block: put it inside "{kw:program}" … "{kw:endProgram}".',
  E2013: 'This "{kw:switch}" already has an "{kw:otherwise}": only one is allowed.',
  E2014: '"{kw:elseIf}" cannot come after "{kw:else}": move this branch before the "{kw:else}".',
  E2015:
    'A subprogram cannot be nested inside another block; declare "{kw:$form}" outside "{kw:program}" … "{kw:endProgram}".',
  E2020: 'You cannot assign to the result of a call: the left side must be a variable.',
  E2021: 'Parameter "{name}" has no type: write "{name} {kw:as} {type:integer}", for example.',
  E2022: 'This parameter already has "{kw:$modifier}".',
  E2023: 'Dimensions must all have a size or none at all.',
  E2030: 'Comparisons cannot be chained: write "a {first} b {kw:and} b {second} c".',
  E2031: 'An expression is missing here: I found "{found}".',
  E2032: 'This expression or block is nested too deeply (more than {limit} levels).',
  W2001: 'Empty statement: this ";" is not needed.',
  E3001: '"{name}" is not declared.',
  E3002: '"{name}" is already declared in this block.',
  E3003: '"{name}" is used here, before it is declared below: move the declaration up.',
  E3004: 'There is already a subprogram called "{name}": give the variable another name.',
  E3005: '"{name}" is a subprogram, not a variable.',
  E3006: '"{name}" is not a subprogram: it cannot be called.',
  E3007: '"{name}" is a constant: its value cannot change.',
  E3008: '"{name}" is this loop\'s counter: it cannot change inside the loop.',
  E3009: 'A single value is needed here, and this is a whole array.',
  E3010: 'A {found} cannot be stored where a {expected} is expected.',
  E3011: 'A {type:char} holds one single letter, and this text has {length}.',
  E3012: '"{op}" cannot work with {found}: it expects {expected} here.',
  E3013:
    'A single letter of a text cannot be changed; build the new text with "{builtin:substring}" and "{builtin:concat}".',
  E3014: 'A condition has to be {type:boolean}, and this one is {found}.',
  E3015: 'I cannot work out the type of "{name}".',
  E3016: 'This array needs {expected} indices and you gave it {found}.',
  E3017: 'An index has to be {type:integer}, and this one is {found}.',
  E3020: '"{name}" is a subprogram with no return value: it cannot be used as a value.',
  E3021: '"{name}" is not declared: declare it before dimensioning it.',
  E3022: '"{name}" cannot be dimensioned.',
  E3023: 'An array size has to be a positive whole number known in advance.',
  E3024: 'The value of constant "{name}" has to be computable before the program runs.',
  E3025: 'This divides by zero: "{op}" needs a divisor other than 0.',
  E3026: 'Counter "{name}" has to be {type:integer}, and it is {found}.',
  E3027: 'The step cannot be 0: the loop would never end.',
  E3028: 'A {found} value cannot be switched on: use {type:integer}, {type:char} or {type:string}.',
  E3029: 'This value has to be computable before the program runs.',
  E3030: 'The value {value} already appears in another option of this "{kw:switch}".',
  E3031: '"{kw:$kw}" can only be used inside a loop.',
  E3032: 'Parameter "{param}" is {kw:byRef}: pass a variable here, not a computed value.',
  E3033: 'Only a {kw:function} can return a value.',
  E3034: '"{name}" needs {expected} arguments and you gave it {found}.',
  E3035: 'Argument {position} of "{name}" is {found} and {expected} is expected.',
  E3036: '"{builtin:$builtin}" needs {expected} arguments and you gave it {found}.',
  E3037: 'Argument {position} of "{builtin:$builtin}" is {found} and {expected} is expected.',
  W3001: 'This code never runs.',
  W3002: '"{name}" is declared but never read.',
  W3003: '"{name}" is read but never given a value.',
  W3004: '"{name}" is never given a value: the function returns nothing.',
  E4001: 'Index {index} is outside "{name}": its positions run from {low} to {high}.',
  E4002: 'This divides by zero: "{op}" received a divisor equal to 0.',
  E4003: '"{name}" has no value yet: give it one before using it.',
  E4004: 'The input "{text}" does not fit "{name}", which is {type}.',
  E4005:
    'Too many nested calls: "{name}" reached {depth} calls without returning. Check the stopping condition.',
  E4006: 'Function "{name}" ended without a result: assign its result or use "{kw:return}".',
  E4007: '"{builtin:$builtin}" does not accept this value.',
  E4008: 'The step of the loop over "{name}" is 0: the loop would never end.',
  E4009: 'An internal error stopped the run: {message}',
}

const variants: Record<string, string> = {
  'E1001.indexBase':
    'I do not understand "{text}" here. To make arrays start at 0, use the profile option "indexBase" instead of a line in the program.',
  'E2002.builtin':
    'I did not expect "{found}" here: "{builtin:$builtin}" is a language function, pick another name.',
  'E3001.suggest': '"{name}" is not declared. Did you mean "{suggestion}"?',
  'E3001.declare': '"{name}" is not declared: declare it with "{kw:define}" before using it.',
  'E3002.result':
    '"{name}" is already this function\'s result: remove this "{kw:define}", the header declares it.',
  'E3002.parameter': '"{name}" is already a parameter of this subprogram.',
  'E3009.array': '"{name}" is a whole array, and a single value is needed here.',
  'E3009.scalar': '"{name}" is not an array: it cannot be indexed.',
  'E3010.trunc':
    'A {found} cannot be stored where a {expected} is expected: use "{builtin:trunc}" or "{builtin:round}".',
  'E3010.div':
    'A {found} cannot be stored where a {expected} is expected: "{kw:div}" gives the whole division.',
  'E3010.index':
    'A {found} cannot be stored where a {expected} is expected: take one letter with "text[i]".',
  'E3010.toNumber':
    'A {found} cannot be stored where a {expected} is expected: convert it with "{builtin:toNumber}".',
  'E3010.toText':
    'A {found} cannot be stored where a {expected} is expected: convert it with "{builtin:toText}".',
  'E3010.rank':
    'This array is {found} and {expected} is expected: the number of dimensions differs.',
  'E3010.element': 'This array is {found} and {expected} is expected: the element type differs.',
  'E3012.divide': '"{op}" only divides whole numbers: use "{op:divide}" to divide with decimals.',
  'E3012.trunc':
    '"{op}" only works with {type:integer}: convert first with "{builtin:trunc}" or "{builtin:round}".',
  'E3012.toText':
    '"{op}" does not mix text and numbers: convert the number with "{builtin:toText}".',
  'E3014.compare':
    'A condition has to be {type:boolean}, and this one is {found}: compare explicitly, for example "… <> 0".',
  'E3015.parameter':
    'I cannot work out the type of parameter "{name}": write "{name} {kw:as} {type:integer}", for example.',
  'E3015.result':
    'I cannot work out the type of result "{name}": declare the function\'s type with "{kw:as}".',
  'E3022.again': '"{name}" is already a dimensioned array: it can only be dimensioned once.',
  'E3022.kind': '"{name}" is not a variable of this block: only variables can be dimensioned.',
  'E3022.rank':
    '"{name}" was declared with a different number of dimensions: use {expected} instead of {found}.',
  'E3026.kind': 'Counter "{name}" has to be a variable of this block, declared with "{kw:define}".',
  'E3035.trunc':
    'Argument {position} of "{name}" is {found} and {expected} is expected: use "{builtin:trunc}" or "{builtin:round}".',
  'E3035.div':
    'Argument {position} of "{name}" is {found} and {expected} is expected: "{kw:div}" gives the whole division.',
  'E3035.index':
    'Argument {position} of "{name}" is {found} and {expected} is expected: take one letter with "text[i]".',
  'E3035.toNumber':
    'Argument {position} of "{name}" is {found} and {expected} is expected: convert it with "{builtin:toNumber}".',
  'E3035.toText':
    'Argument {position} of "{name}" is {found} and {expected} is expected: convert it with "{builtin:toText}".',
  'E3035.rank':
    'Argument {position} of "{name}" is {found} and {expected} is expected: the number of dimensions differs.',
  'E3035.element':
    'Argument {position} of "{name}" is {found} and {expected} is expected: the element type differs.',
  'E4001.size': '"{name}" cannot have size {size}: an array needs at least one position.',
  'E4003.cell': '"{name}[{index}]" has no value yet: give it one before using it.',
  'E4004.integer':
    'The input "{text}" is not an {type:integer}: type digits only, with an optional sign, like "-12".',
  'E4004.real':
    'The input "{text}" is not a {type:real}: type a number with an optional decimal point, like "3.5".',
  'E4004.boolean': 'The input "{text}" is not a {type:boolean}: type "{kw:true}" or "{kw:false}".',
  'E4004.char': 'The input "{text}" does not fit a {type:char}: type exactly one character.',
  'E4007.negative': '"{builtin:$builtin}" does not accept a negative number.',
  'E4007.nonPositive': '"{builtin:$builtin}" needs a number greater than 0.',
  'E4007.domain': '"{builtin:$builtin}" only accepts values between -1 and 1.',
  'E4007.range': '"{builtin:$builtin}" needs its first value to be no greater than its second.',
  'E4007.number': '"{builtin:$builtin}" could not read "{text}" as a number.',
}

export const en: Catalog = { templates, variants }
