import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { DIAGNOSTIC_CODES, type Diagnostic, formatDiagnostic } from '../../src/diagnostics/index'
import { allocateArray, RuntimeError } from '../../src/interpreter/value'
import { collectRun, type ProfileName, profileNamed, startSource } from '../helpers'

const main = (...lines: string[]): string =>
  ['Proceso p', ...lines.map((line) => `  ${line}`), 'FinProceso'].join('\n')

interface Case {
  readonly code: string
  /** A program that fails with exactly this code at runtime. */
  readonly source: string
  readonly inputs?: readonly string[]
  /** The source text the diagnostic must cover. */
  readonly text: string
  /** A neighbouring program that runs to `done` with the same inputs. */
  readonly clean: string
  readonly cleanInputs?: readonly string[]
  readonly profile?: ProfileName
}

const cases: Case[] = [
  {
    code: 'E4001',
    source: main('Definir a Como Entero[3];', 'Definir i Como Entero;', 'i <- 4;', 'a[i] <- 1;'),
    text: 'i',
    clean: main(
      'Definir a Como Entero[3];',
      'Definir i Como Entero;',
      'i <- 3;',
      'a[i] <- 1;',
      'Escribir a[i];',
    ),
  },
  {
    code: 'E4002',
    source: main('Definir n Como Entero;', 'Leer n;', 'Escribir 10 / n;'),
    inputs: ['0'],
    text: 'n',
    clean: main('Definir n Como Entero;', 'Leer n;', 'Escribir 10 / n;'),
    cleanInputs: ['5'],
  },
  {
    code: 'E4003',
    source: main(
      'Definir total, i Como Entero;',
      'Para i <- 1 Hasta 0 Hacer',
      '  total <- total + i;',
      'FinPara',
      'Escribir total;',
    ),
    text: 'total',
    clean: main(
      'Definir total, i Como Entero;',
      'total <- 0;',
      'Para i <- 1 Hasta 0 Hacer',
      '  total <- total + i;',
      'FinPara',
      'Escribir total;',
    ),
  },
  {
    code: 'E4004',
    source: main('Definir edad Como Entero;', 'Leer edad;', 'Escribir edad;'),
    inputs: ['veinte'],
    text: 'edad',
    clean: main('Definir edad Como Entero;', 'Leer edad;', 'Escribir edad;'),
    cleanInputs: ['20'],
  },
  {
    code: 'E4005',
    source: [
      'Funcion r Como Entero <- cuenta(n Como Entero)',
      '  r <- cuenta(n + 1);',
      'FinFuncion',
      'Proceso p',
      '  Escribir cuenta(1);',
      'FinProceso',
    ].join('\n'),
    text: 'cuenta(n + 1)',
    clean: [
      'Funcion r Como Entero <- cuenta(n Como Entero)',
      '  Si n >= 10 Entonces',
      '    r <- n;',
      '  Sino',
      '    r <- cuenta(n + 1);',
      '  FinSi',
      'FinFuncion',
      'Proceso p',
      '  Escribir cuenta(1);',
      'FinProceso',
    ].join('\n'),
  },
  {
    code: 'E4006',
    source: [
      'Funcion r Como Entero <- mayor(a Como Entero, b Como Entero)',
      '  Si a > b Entonces',
      '    r <- a;',
      '  FinSi',
      'FinFuncion',
      'Proceso p',
      '  Escribir mayor(1, 2);',
      'FinProceso',
    ].join('\n'),
    text: 'mayor',
    clean: [
      'Funcion r Como Entero <- mayor(a Como Entero, b Como Entero)',
      '  Si a > b Entonces',
      '    r <- a;',
      '  Sino',
      '    r <- b;',
      '  FinSi',
      'FinFuncion',
      'Proceso p',
      '  Escribir mayor(1, 2);',
      'FinProceso',
    ].join('\n'),
  },
  {
    code: 'E4007',
    source: main('Definir x Como Real;', 'Leer x;', 'Escribir RC(x);'),
    inputs: ['-4'],
    text: 'x',
    clean: main('Definir x Como Real;', 'Leer x;', 'Escribir RC(x);'),
    cleanInputs: ['4'],
  },
  {
    code: 'E4008',
    source: main(
      'Definir i, paso Como Entero;',
      'Leer paso;',
      'Para i <- 1 Hasta 10 Con Paso paso Hacer',
      '  Escribir i;',
      'FinPara',
    ),
    inputs: ['0'],
    text: 'paso',
    clean: main(
      'Definir i, paso Como Entero;',
      'Leer paso;',
      'Para i <- 1 Hasta 10 Con Paso paso Hacer',
      '  Escribir i;',
      'FinPara',
    ),
    cleanInputs: ['5'],
  },
]

/** The runtime diagnostic a run ends with: an `error` result, or the `rejected` of an input request (E4004). */
function diagnosticOf(
  source: string,
  inputs: readonly string[],
  profile: ProfileName,
): Diagnostic | undefined {
  const result = collectRun(startSource(source, { profileName: profile }).run, inputs)
  if (result.kind === 'error') return result.diagnostic
  if (result.kind === 'input') return result.rejected
  return undefined
}

describe('every runtime code has a case', () => {
  it('covers E4001–E4008', () => {
    const covered = [...new Set(cases.map((entry) => entry.code))].sort()
    const expected = DIAGNOSTIC_CODES.filter((code) => code.startsWith('E4'))
    expect(covered).toEqual([...expected].sort())
  })

  for (const entry of cases) {
    describe(entry.code, () => {
      const profile = entry.profile ?? 'es'

      it('is raised over the right text', () => {
        const diagnostic = diagnosticOf(entry.source, entry.inputs ?? [], profile)
        expect(diagnostic?.code).toBe(entry.code)
        expect(diagnostic && entry.source.slice(diagnostic.span.start, diagnostic.span.end)).toBe(
          entry.text,
        )
      })

      it('renders in es and en with no unfilled slot', () => {
        const diagnostic = diagnosticOf(entry.source, entry.inputs ?? [], profile)
        expect(diagnostic).toBeDefined()
        if (diagnostic === undefined) return
        const spanish = formatDiagnostic(diagnostic, 'es', profileNamed(profile))
        const english = formatDiagnostic(diagnostic, 'en', profiles.en)
        expect(spanish).not.toMatch(/\{[a-zA-Z$:]+\}/)
        expect(english).not.toMatch(/\{[a-zA-Z$:]+\}/)
        expect(spanish.length).toBeGreaterThan(0)
        expect(english).not.toBe(spanish)
      })

      it('leaves the neighbouring program running to done', () => {
        const result = collectRun(
          startSource(entry.clean, { profileName: profile }).run,
          entry.cleanInputs ?? entry.inputs ?? [],
        )
        expect(result).toEqual({ kind: 'done' })
      })
    })
  }
})

describe('E4001.size', () => {
  // Unreachable from a compiled program (E3023 folds every size), so the allocator is called
  // directly (§8, §9).
  it('renders in es and en', () => {
    let diagnostic: Diagnostic | undefined
    try {
      allocateArray('integer', [0], { name: 'a', spans: [{ start: 0, end: 1 }] })
    } catch (error) {
      if (error instanceof RuntimeError) diagnostic = error.diagnostic
    }
    expect(diagnostic?.data).toEqual({ name: 'a', size: 0, hint: 'size' })
    if (diagnostic === undefined) return
    expect(formatDiagnostic(diagnostic, 'es', profiles.es)).not.toMatch(/\{[a-zA-Z$:]+\}/)
    expect(formatDiagnostic(diagnostic, 'en', profiles.en)).toContain('cannot have size 0')
  })
})
