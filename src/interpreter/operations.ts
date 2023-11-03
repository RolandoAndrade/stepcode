export function sum(a: number, b: number) {
  return a + b
}

export function sub(a: number, b: number) {
  return a - b
}

export function mul(a: number, b: number) {
  return a * b
}

export function div(a: number, b: number) {
  return a / b
}

export function mod(a: number, b: number) {
  return a % b
}

export function eq(a: any, b: any) {
  return a === b
}

export function neq(a: any, b: any) {
  return a !== b
}

export function lt(a: number, b: number) {
  return a < b
}

export function gt(a: number, b: number) {
  return a > b
}

export function lte(a: number, b: number) {
  return a <= b
}

export function gte(a: number, b: number) {
  return a >= b
}

export function and(a: boolean, b: boolean) {
  return a && b
}

export function or(a: boolean, b: boolean) {
  return a || b
}

export function not(a: boolean) {
  return !a
}

export function integerDivision(a: number, b: number) {
  return Math.trunc(a / b)
}