import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EventBus, StepCodeInterpreter } from '../src';
import { internalInterpret } from '../src/interpreter/internal-interpret';

describe('test interpreter relational operations', () => {
  let eventBus: EventBus
  let interpreter: StepCodeInterpreter
  beforeEach(() => {
    eventBus = new EventBus()
    interpreter = new StepCodeInterpreter(eventBus)
  })

  describe('test equality', () => {
    test('test two equal integers', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 10;
      c <- a = b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })

    test('test two different integers', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 20;
      c <- a = b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })

    test('equality between constant and variable', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, c Como Entero;
      a <- 10;
      c <- 10 = a;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })

    test('equality between variable and constant', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, c Como Entero;
      a <- 10;
      c <- a = 10;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })
  })

  describe('test inequality', () => {
    test('test two equal integers', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 10;
      c <- a <> b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })

    test('test two different integers', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 20;
      c <- a <> b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })

    test('inequality between constant and variable', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, c Como Entero;
      a <- 10;
      c <- 10 <> a;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })

    test('inequality between variable and constant', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, c Como Entero;
      a <- 10;
      c <- a <> 10;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })
  })

  describe('test less than', () => {
    test('test two equal integers', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 10;
      c <- a < b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })

    test('test left less than right integer', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 5;
      b <- 10;
      c <- a < b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })

    test('test right less than left integer', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 5;
      c <- a < b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })

    test('less than between constant and variable', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, c Como Entero;
      a <- 10;
      c <- 10 < a;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })

    test('less than between variable and constant', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, c Como Entero;
      a <- 10;
      c <- a < 10;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })
  })

  describe('test less than or equal', () => {
    test('test two equal integers', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 10;
      c <- a <= b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })

    test('test left less than right integer', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 5;
      b <- 10;
      c <- a <= b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })

    test('test right less than left integer', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 5;
      c <- a <= b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })

    test('less than or equal between constant and variable', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, c Como Entero;
      a <- 10;
      c <- 10 <= a;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })

    test('less than or equal between variable and constant', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, c Como Entero;
      a <- 10;
      c <- a <= 10;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })
  })

  describe('test greater than', () => {
    test('test two equal integers', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 10;
      c <- a > b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })

    test('test left greater than right integer', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 5;
      b <- 10;
      c <- a > b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })

    test('test right greater than left integer', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 5;
      c <- a > b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })

    test('greater than between constant and variable', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, c Como Entero;
      a <- 10;
      c <- 10 > a;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })

    test('greater than between variable and constant', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, c Como Entero;
      a <- 10;
      c <- a > 10;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })
  })

  describe('test greater than or equal', () => {
    test('test two equal integers', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 10;
      c <- a >= b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })

    test('test left greater than right integer', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 5;
      b <- 10;
      c <- a >= b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })

    test('test right greater than left integer', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 5;
      c <- a >= b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })

    test('greater than or equal between constant and variable', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, c Como Entero;
      a <- 10;
      c <- 10 >= a;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })

    test('greater than or equal between variable and constant', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, c Como Entero;
      a <- 10;
      c <- a >= 10;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })
  })
})