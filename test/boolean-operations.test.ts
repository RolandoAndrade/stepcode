import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EventBus, StepCodeInterpreter } from '../src';
import { internalInterpret } from '../src/interpreter/internal-interpret';


describe('test interpreter boolean operations', () => {
  let eventBus: EventBus
  let interpreter: StepCodeInterpreter
  beforeEach(() => {
    eventBus = new EventBus()
    interpreter = new StepCodeInterpreter(eventBus)
  })

  describe('and operation', () => {
    test('test true and true', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Logico;
      a <- Verdadero;
      b <- Verdadero;
      c <- a Y b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })

    test('test true and false', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Logico;
      a <- Verdadero;
      b <- Falso;
      c <- a Y b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })

    test('test false and true', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Logico;
      a <- Falso;
      b <- Verdadero;
      c <- a Y b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })
  })

  describe('or operation', () => {
    test('test true or true', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Logico;
      a <- Verdadero;
      b <- Verdadero;
      c <- a O b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })

    test('test true or false', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Logico;
      a <- Verdadero;
      b <- Falso;
      c <- a O b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })

    test('test false or true', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Logico;
      a <- Falso;
      b <- Verdadero;
      c <- a O b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })
  })

  describe('not operation', () => {
    test('test not true', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b Como Logico;
      a <- Verdadero;
      b <- No a;
      Escribir b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
    })
    test('test not false', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b Como Logico;
      a <- Falso;
      b <- No a;
      Escribir b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
    })
  })
})