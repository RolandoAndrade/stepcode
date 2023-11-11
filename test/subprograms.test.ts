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
  })
})