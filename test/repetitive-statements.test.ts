import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EventBus, StepCodeInterpreter } from '../src';
import { internalInterpret } from '../src/interpreter/internal-interpret';

describe('test interpreter loop statements', () => {
  let eventBus: EventBus
  let interpreter: StepCodeInterpreter
  beforeEach(() => {
    eventBus = new EventBus()
    interpreter = new StepCodeInterpreter(eventBus)
  })

  describe('test while statement', () => {
    test('test simple while statement', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `Proceso prueba
        Definir a Como Entero;
        a <- 1;
        Mientras a < 5 Hacer
          Escribir a;
          a <- a + 1;
        FinMientras
      FinProceso`
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toBeCalledTimes(4)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '2')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '3')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '4')
    })

    test('test while statement with break', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `Proceso prueba
        Definir a Como Entero;
        a <- 1;
        Mientras a < 5 Hacer
          Escribir a;
          a <- a + 1;
          Si a = 3 Entonces
            Romper;
          FinSi
        FinMientras
      FinProceso`
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toBeCalledTimes(2)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '2')
    })

    test('test while statement with break ignores instructions', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `Proceso prueba
        Definir a Como Entero;
        a <- 1;
        Mientras a < 10 Hacer
          Escribir a;
          Si a = 3 Entonces
            Romper;
          FinSi
          a <- a + 1;
        FinMientras
        Escribir 'a=', a;
      FinProceso`
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '2')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a=3')
    })

    test('test while statement with continue', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `Proceso prueba
        Definir a Como Entero;
        a <- 0;
        Mientras a < 10 Hacer
          a <- a + 1;
          Si a MOD 2 Entonces
            Continuar;
          FinSi
          Escribir a;
        FinMientras
      FinProceso`
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '2')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '4')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '6')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '8')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', '1')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', '3')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', '5')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', '7')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', '9')
    })
  })

})