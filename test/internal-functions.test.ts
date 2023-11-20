import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EventBus, StepCodeInterpreter } from '../src';
import { internalInterpret } from '../src/interpreter/internal-interpret';


describe('test interpreter internal functions', () => {
  let eventBus: EventBus
  let interpreter: StepCodeInterpreter
  beforeEach(() => {
    eventBus = new EventBus()
    interpreter = new StepCodeInterpreter(eventBus)
  })

  test('test abs', async () => {
    vi.spyOn(eventBus, 'emit')
    const code = `Proceso prueba
    Definir a Como Real;
    Leer a;
    Escribir abs(a);
    FinProceso`;
    const inputs = [-1, 1]
    let i = 0;
    eventBus.on('input-request', (resolve) => {
      resolve(inputs[i++].toString())
    })
    await internalInterpret(code, interpreter)
    expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1')
    expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1')
  })

  test('test round', async () => {
    vi.spyOn(eventBus, 'emit')
    const code = `Proceso prueba
    Definir a, b Como Real;
    Leer a, b;
    Escribir round(a);
    Escribir round(b);
    FinProceso`;
    const inputs = [-1.5, 1.5]
    let i = 0;
    eventBus.on('input-request', (resolve) => {
      resolve(inputs[i++].toString())
    })
    await internalInterpret(code, interpreter)
    expect(eventBus.emit).toHaveBeenCalledWith('output-request', '-1')
    expect(eventBus.emit).toHaveBeenCalledWith('output-request', '2')
  })

  test('test truncate', async () => {
    vi.spyOn(eventBus, 'emit')
    const code = `Proceso prueba
    Definir a Como Real;
    Leer a;
    Escribir truncar(a);
    FinProceso`;
    eventBus.on('input-request', (resolve) => {
      resolve('1.5')
    })
    await internalInterpret(code, interpreter)
    expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1')
  })

  test('test random', async () => {
    vi.spyOn(eventBus, 'emit')
    const code = `Proceso prueba
    Escribir random();
    FinProceso`;
    await internalInterpret(code, interpreter)
    expect(eventBus.emit).toHaveBeenCalledWith('output-request', expect.stringMatching(/^0\.\d+$/))
  })
})