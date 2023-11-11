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
    test('procedure receives parameters', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`SubProceso suma(a, b)
        Escribir a + b;
      FinSubProceso
      Proceso prueba
        suma(10, 20);
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '30')
    })
    test('procedure test by reference', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`SubProceso swap(a por referencia, b por referencia)
        Definir temp Como Entero;
        temp <- a;
        a <- b;
        b <- temp;
      FinSubProceso
      Proceso prueba
        Definir a, b Como Entero;
        a <- 10;
        b <- 20;
        swap(a, b);
        Escribir 'a=',a;
        Escribir 'b=',b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a=20')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'b=10')
    })
    test('procedure test by value and reference', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`SubProceso swap(a por valor, b por referencia)
        Definir temp Como Entero;
        temp <- a;
        a <- b;
        b <- temp;
      FinSubProceso
      Proceso prueba
        Definir a, b Como Entero;
        a <- 10;
        b <- 20;
        swap(a, b);
        Escribir 'a=',a;
        Escribir 'b=',b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a=10')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'b=10')
    })
    test('procedure test array by parameter', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`SubProceso cambio(a)
        a[1] <- 10;
      FinSubProceso
      Proceso prueba
        Definir a Como Entero;
        Dimension a[3];
        a[1] <- 20;
        a[2] <- 30;
        a[3] <- 40;
        cambio(a);
        Escribir a;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '10,30,40')
    })
  })
})