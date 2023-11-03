import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EventBus, interpret, StepCodeInterpreter } from '../src';

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
      await interpret(`Proceso prueba
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
      await interpret(`Proceso prueba
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
      await interpret(`Proceso prueba
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
      await interpret(`Proceso prueba
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
      await interpret(`Proceso prueba
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
      await interpret(`Proceso prueba
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
      await interpret(`Proceso prueba
      Definir a, b, c Como Entero;
      a <- 10;
      b <- 4;
      c <- a DIV b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '2')
    })
  })
  describe('real operations', () => {

  })

})
