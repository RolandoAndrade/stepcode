import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EventBus, interpret, StepCodeInterpreter } from '../src';

describe('test interpreter conditional operations', () => {
  let eventBus: EventBus
  let interpreter: StepCodeInterpreter
  beforeEach(() => {
    eventBus = new EventBus()
    interpreter = new StepCodeInterpreter(eventBus)
  })

  describe('test if statement', () => {
    test('test if statement with true condition', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `
      Proceso prueba
        Definir a Como Entero;
        a <- 1;
        Si a = 1 Entonces
          Escribir 'a=1';
        FinSi
      FinProceso
      `
      await interpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a=1')
    })
    test('test if statement with false condition', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `
      Proceso prueba
        Definir a Como Entero;
        a <- 1;
        Si a = 2 Entonces
          Escribir 'a=1';
        FinSi
      FinProceso
      `
      await interpret(code, interpreter)
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a=1')
    })
    test('test if statement with true condition and else', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `
      Proceso prueba
        Definir a Como Entero;
        a <- 1;
        Si a = 1 Entonces
          Escribir 'a=1';
        Sino
          Escribir 'a!=1';
        FinSi
      FinProceso
      `
      await interpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a=1')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a!=1')
    })
    test('test if statement with false condition and else', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `
      Proceso prueba
        Definir a Como Entero;
        a <- 1;
        Si a = 2 Entonces
          Escribir 'a=1';
        Sino
          Escribir 'a!=1';
        FinSi
      FinProceso
      `
      await interpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a!=1')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a=1')
    })
    test('test if statement with true condition and else if', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `
      Proceso prueba
        Definir a Como Entero;
        a <- 1;
        Si a = 1 Entonces
          Escribir 'a=1';
        Sino Si a = 2 Entonces
          Escribir 'a=2';
        FinSi
      FinProceso
      `
      await interpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a=1')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a=2')
    })
    test('test if statement with false condition and else if', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `
      Proceso prueba
        Definir a Como Entero;
        a <- 2;
        Si a = 1 Entonces
          Escribir 'a=1';
        Sino Si a = 2 Entonces
          Escribir 'a=2';
        FinSi
      FinProceso
      `
      await interpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a=2')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a=1')
    })
    test('test if statement with true condition and else if and else', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `
      Proceso prueba
        Definir a Como Entero;
        a <- 1;
        Si a = 1 Entonces
          Escribir 'a=1';
        Sino Si a = 2 Entonces
          Escribir 'a=2';
        Sino
          Escribir 'a!=1';
        FinSi
      FinProceso
      `
      await interpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a=1')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a=2')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a!=1')
    })
    test('test if statement with false condition and else if and else', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `
      Proceso prueba
        Definir a Como Entero;
        a <- 2;
        Si a = 1 Entonces
          Escribir 'a=1';
        Sino Si a = 2 Entonces
          Escribir 'a=2';
        Sino
          Escribir 'a!=1';
        FinSi
      FinProceso
      `
      await interpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a=2')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a=1')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a!=1')
    })
    test('test if statement with false condition and else if false condition and else', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `
      Proceso prueba
        Definir a Como Entero;
        a <- 3;
        Si a = 1 Entonces
          Escribir 'a=1';
        Sino Si a = 2 Entonces
          Escribir 'a=2';
        Sino
          Escribir 'a!=1';
        FinSi
      FinProceso
      `
      await interpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a!=1')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a=1')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a=2')
    })
    test('test if statement with multiple statements in body', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `
      Proceso prueba
        Definir a, b Como Entero;
        a <- 1;
        Si a = 1 Entonces
          Escribir 'a=1';
          b <- 2;
          Escribir 'b=2';
        FinSi
      FinProceso
      `
      await interpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a=1')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'b=2')
    })
  })

  describe('test case statement', () => {
    test('test enter first case', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `
      Proceso prueba
        Definir a, b Como Entero;
        a <- 1;
        Segun a Hacer
          1: Escribir 'a=1';
          2: Escribir 'a=2';
          De Otro Modo: Escribir 'a!=1,2';
        FinSegun
      FinProceso
      `
      await interpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a=1')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a=2')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a!=1,2')
    })
    test('test enter second case', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `
      Proceso prueba
        Definir a, b Como Entero;
        a <- 2;
        Segun a Hacer
          1: Escribir 'a=1';
          2: Escribir 'a=2';
          De Otro Modo: Escribir 'a!=1,2';
        FinSegun
      FinProceso
      `
      await interpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a=2')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a=1')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a!=1,2')
    })
    test('test enter default case', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `
      Proceso prueba
        Definir a, b Como Entero;
        a <- 3;
        Segun a Hacer
          1: Escribir 'a=1';
          2: Escribir 'a=2';
          De Otro Modo: Escribir 'a!=1,2';
        FinSegun
      FinProceso
      `
      await interpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a!=1,2')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a=1')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a=2')
    })
    test('test multiple statements in case', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `
      Proceso prueba
        Definir a, b Como Entero;
        a <- 1;
        Segun a Hacer
          1: 
             Escribir 'a=1';
             b <- 2;
             Escribir 'b=2';
          2: Escribir 'a=2';
          De Otro Modo: Escribir 'a!=1,2';
        FinSegun
      FinProceso
      `
      await interpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a=1')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'b=2')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a=2')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a!=1,2')
    })
    test('test multiple constants in case', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `
      Proceso prueba
        Definir a, b Como Entero;
        a <- 2;
        Segun a Hacer
          1, 2: Escribir '1<=a<=2';
          3: Escribir 'a=3';
          De Otro Modo: Escribir 'a!=1,2,3';
        FinSegun
      FinProceso
      `
      await interpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1<=a<=2')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a=3')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'a!=1,2,3')
    })
  })
})