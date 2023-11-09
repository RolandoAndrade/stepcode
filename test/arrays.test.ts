import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EventBus, StepCodeInterpreter } from '../src';
import { internalInterpret } from '../src/interpreter/internal-interpret';


describe('test interpreter array operations', () => {
  let eventBus: EventBus
  let interpreter: StepCodeInterpreter
  beforeEach(() => {
    eventBus = new EventBus()
    interpreter = new StepCodeInterpreter(eventBus)
  })

  describe('allocation', () => {
    test('test allocation', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a Como Entero;
      Dimension a[3];
      a[1] <- 1;
      a[2] <- 2;
      a[3] <- 3;
      Escribir a[1], a[2], a[3];
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '123')
    })

    test('test allocation matrix', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a Como Entero;
      Dimension a[3,3];
      a[1][1] <- 1;
      a[2][2] <- 2;
      a[3][3] <- 3;
      Escribir a[1][1], a[2][2], a[3][3];
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '123')
    })
  })

  describe('indexing', () => {
    test('test basic indexing', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b Como Entero;
      Dimension a[3];
      a[1] <- 1;
      a[2] <- 2;
      a[3] <- 3;
      b <- a[1];
      Escribir b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1')
    })
    test('test reverse indexing', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b Como Entero;
      Dimension a[3];
      a[1] <- 1;
      a[2] <- 2;
      a[3] <- 3;
      b <- a[-1];
      Escribir b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '3')
    })
    test('test matrix indexing', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b Como Entero;
      Dimension a[3,3];
      a[1][1] <- 1;
      a[2][2] <- 2;
      a[3][3] <- 3;
      b <- a[1][1];
      Escribir b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1')
    })
    test('test matrix comma indexing', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b Como Entero;
      Dimension a[3,3];
      a[1][1] <- 1;
      a[2][2] <- 2;
      a[3][3] <- 3;
      b <- a[1,1];
      Escribir b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1')
    })
    test('test matrix comma indexing 2', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b Como Entero;
      Dimension a[3,3];
      a[1,1] <- 1;
      a[2,2] <- 2;
      a[3,3] <- 3;
      b <- a[2,2];
      Escribir b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '2')
    })
  })

  describe('length', () => {
    test('test length', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a Como Entero;
      Dimension a[3];
      Escribir Longitud(a);
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '3')
    })
  })

  describe('set elements with read', () => {
    const code = `Proceso prueba
    Definir a Como Entero;
    Dimension a[3];
    Leer a[1];
    Leer a[2];
    Leer a[3];
    Escribir a[1], a[2], a[3];
    FinProceso`

    test('test set elements with read', async () => {
      vi.spyOn(eventBus, 'emit')
      const input = [1, 2, 3]
      let i = 0
      eventBus.on('input-request', (resolve) => {
        resolve(input[i++].toString())
      })
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '123')
    })
  })
})