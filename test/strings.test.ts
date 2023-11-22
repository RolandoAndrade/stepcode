import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EventBus, StepCodeInterpreter } from '../src';
import { internalInterpret } from '../src/interpreter/internal-interpret';


describe('test interpreter strings operations', () => {
  let eventBus: EventBus
  let interpreter: StepCodeInterpreter
  beforeEach(() => {
    eventBus = new EventBus()
    interpreter = new StepCodeInterpreter(eventBus)
  })

  describe('concatenation', () => {
    test('test basic concatenation', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b, c Como Cadena;
      a <- "Hola";
      b <- " mundo";
      c <- a + b;
      Escribir c;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'Hola mundo')
    })
  })

  describe('indexing', () => {
    test('test basic indexing', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b Como Cadena;
      a <- "Hola";
      b <- a[1];
      Escribir b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'H')
    })
    test('test reverse indexing', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b Como Cadena;
      a <- "Hola";
      b <- a[-1];
      Escribir b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a')
    })
  })

  describe('length', () => {
    test('test basic length', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b Como Cadena;
      a <- "Hola";
      b <- Longitud(a);
      Escribir b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '4')
    })
  })

  describe('substring', () => {
    test('test basic substring', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b Como Cadena;
      a <- "Hola";
      b <- Subcadena(a, 1, 2);
      Escribir b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'Ho')
    })
  })

  describe('uppercase', () => {
    test('test basic uppercase', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b Como Cadena;
      a <- "Hola";
      b <- Mayusculas(a);
      Escribir b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'HOLA')
    })
  })

  describe('lowercase', () => {
    test('test basic lowercase', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`Proceso prueba
      Definir a, b Como Cadena;
      a <- "Hola";
      b <- Minusculas(a);
      Escribir b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'hola')
    })
  })

  describe('test arrays@stepcode directive', () => {
    test('test basic indexing', async () => {
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(`$ arrays@stepcode
      Proceso prueba
      Definir a, b Como Cadena;
      a <- "Hola";
      b <- a[1];
      Escribir b;
      FinProceso`, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'o')
    })
  })
})