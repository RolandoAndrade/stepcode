import { describe, expect, it } from 'vitest'
import { parseHeader } from '../src/examples/header'

describe('parseHeader', () => {
  it('reads título and descripción and strips them from the body', () => {
    const text = [
      '// título: Hola mundo',
      '// descripción: Saluda',
      'Proceso A',
      'FinProceso',
      '',
    ].join('\n')
    expect(parseHeader(text)).toEqual({
      title: 'Hola mundo',
      description: 'Saluda',
      body: 'Proceso A\nFinProceso\n',
    })
  })

  it('tolerates missing lines and accepts ASCII keys', () => {
    expect(parseHeader('// titulo: X\nProceso A\nFinProceso\n')).toEqual({
      title: 'X',
      description: '',
      body: 'Proceso A\nFinProceso\n',
    })
    expect(parseHeader('Proceso A\nFinProceso\n')).toEqual({
      title: '',
      description: '',
      body: 'Proceso A\nFinProceso\n',
    })
  })
})
