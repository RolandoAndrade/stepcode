import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EventBus, StepCodeInterpreter } from '../src';
import { internalInterpret } from '../src/interpreter/internal-interpret';


describe('test interpreter subprograms', () => {
  let eventBus: EventBus
  let interpreter: StepCodeInterpreter
  beforeEach(() => {
    eventBus = new EventBus()
    interpreter = new StepCodeInterpreter(eventBus)
  })

  describe('procedures', () => {
    test('test basic procedure', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`SubProceso prueba
        Escribir 'hola';
      FinSubProceso
      Proceso pruebaProceso
        prueba();
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'hola')
    })
    test('procedure cannot override variable of the process', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`SubProceso prueba
        Definir a Como Entero;
        a <- 10;
      FinSubProceso
      Proceso pruebaProceso
        Definir a Como Entero;
        a <- 20;
        prueba();
        Escribir a;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '20')
    })
  })
})