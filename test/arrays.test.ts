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
  })
})