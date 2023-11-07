import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EventBus, StepCodeInterpreter } from '../src';
import { internalInterpret } from '../src/interpreter/internal-interpret';


describe('test interpreter aritmetic operations', () => {
  let eventBus: EventBus
  let interpreter: StepCodeInterpreter
  beforeEach(() => {
    eventBus = new EventBus()
    interpreter = new StepCodeInterpreter(eventBus)
  })
  describe('integer operations', () => {
    test('test basic sum operation', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 20;
      c <- a + b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '30')
    })
    test('test basic sub operation', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 20;
      c <- a - b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '-10')
    })
    test('test basic sub operation first negative', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- -10;
      b <- 20;
      c <- a - b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '-30')
    })
    test('test basic mul operation', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 20;
      c <- a * b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '200')
    })
    test('test basic div operation', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 20;
      b <- 10;
      c <- a / b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '2')
    })
    test('test basic mod operation', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 5;
      b <- 4;
      c <- a MOD b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1')
    })
    test('test basic integer division operation', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 4;
      c <- a DIV b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '2')
    })
    test('test power operation', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a Como Entero;
      a <- 10;
      Escribir a ^ 2;
      Escribir a ** 3;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '100')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1000')
    })
    test('operation order', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a Como Entero;
      a <- 10;
      Escribir a + 2 * 3;
      Escribir a * 2 + 3;
      Escribir a ^ 2 * 2 + 3;
      Escribir a * 2 ^ 2 + 3 * 2;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '16')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '23')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '203')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '46')
    })
  })
  describe('real operations', () => {
    test('test basic sum operation', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Real;
      a <- 10.5;
      b <- 20.5;
      c <- a + b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '31')
    })
    test('test basic sub operation', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Real;
      a <- 10.5;
      b <- 20.5;
      c <- a - b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '-10')
    })
    test('test basic sub operation first negative', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Real;
      a <- -10.5;
      b <- 20.5;
      c <- a - b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '-31')
    })
    test('test basic mul operation', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Real;
      a <- 10.5;
      b <- 20.5;
      c <- a * b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '215.25')
    })
    test('test basic div operation', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Real;
      a <- 20.5;
      b <- 10.5;
      c <- a / b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1.9523809523809523')
    })
    test('test basic mod operation', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b Como Real;
      a <- 5.5;
      b <- 4.5;
      Escribir a MOD b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1')
    })
    test('test complex operations with constants', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b Como Real;
      a <- 5.5;
      b <- 4.5;
      Escribir a + b * 2;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '14.5')
    })
  })
})
