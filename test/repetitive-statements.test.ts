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

    describe('test nested while statement', () => {
      test('test nested while statement', async () => {
        vi.spyOn(eventBus, 'emit')
        const code = `Proceso prueba
          Definir a, b Como Entero;
          a <- 1;
          Mientras a <= 5 Hacer
            b <- 1;
            Mientras b <= 5 Hacer
              Escribir a, ' * ', b, ' = ', a * b;
              b <- b + 1;
            FinMientras
            a <- a + 1; 
          FinMientras
        FinProceso`
        await internalInterpret(code, interpreter)
        expect(eventBus.emit).toBeCalledTimes(25)
        for (let i = 1; i <= 5; i++) {
          for (let j = 1; j <= 5; j++) {
            expect(eventBus.emit).toHaveBeenCalledWith('output-request', `${i} * ${j} = ${i * j}`)
          }
        }
      })

      test('test nested while statement with break', async () => {
        vi.spyOn(eventBus, 'emit')
        const code = `Proceso prueba
          Definir a, b Como Entero;
          a <- 1;
          Mientras a <= 5 Hacer
            b <- 1;
            Mientras b <= 5 Hacer
              Escribir a, ' * ', b, ' = ', a * b;
              b <- b + 1;
              Si b = 3 Entonces
                Romper;
              FinSi
            FinMientras
            a <- a + 1; 
          FinMientras
        FinProceso`
        await internalInterpret(code, interpreter)
        expect(eventBus.emit).toBeCalledTimes(10)
        for (let i = 1; i <= 5; i++) {
          for (let j = 1; j <= 2; j++) {
            expect(eventBus.emit).toHaveBeenCalledWith('output-request', `${i} * ${j} = ${i * j}`)
          }
        }
      })

      test('test nested while statement with continue', async () => {
        vi.spyOn(eventBus, 'emit')
        const code = `Proceso prueba
          Definir a, b Como Entero;
          a <- 1;
          Mientras a <= 5 Hacer
            b <- 1;
            Mientras b <= 5 Hacer
              b <- b + 1;
              Si b MOD 2 Entonces
                Continuar;
              FinSi
              Escribir a, ' * ', b - 1, ' = ', a * (b - 1);
            FinMientras
            a <- a + 1; 
          FinMientras
        FinProceso`
        await internalInterpret(code, interpreter)
        expect(eventBus.emit).toBeCalledTimes(15)
        for (let i = 1; i <= 5; i++) {
          for (let j = 1; j <= 5; j += 2) {
            expect(eventBus.emit).toHaveBeenCalledWith('output-request', `${i} * ${j} = ${i * j}`)
          }
        }
      })
    })
  })

  describe('test for statement', () => {
    test('test simple for statement', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `Proceso prueba
        Definir a Como Entero;
        Para a <- 1 Hasta 5 Hacer
          Escribir a;
        FinPara
      FinProceso`
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toBeCalledTimes(5)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '2')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '3')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '4')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '5')
    })

    test('test simple for statement with break', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `Proceso prueba
        Definir a Como Entero;
        Para a <- 1 Hasta 5 Hacer
          Si a = 3 Entonces
            Romper;
          FinSi
          Escribir a;
        FinPara
      FinProceso`
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toBeCalledTimes(2)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '2')
    })

    test('test simple for statement with continue', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `Proceso prueba
        Definir a Como Entero;
        Para a <- 1 Hasta 5 Hacer
          Si a MOD 2 Entonces
            Continuar;
          FinSi
          Escribir a;
        FinPara
      FinProceso`
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toBeCalledTimes(2)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '2')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '4')
    })

    test('test for statement with positive step', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `Proceso prueba
        Definir a Como Entero;
        Para a <- 1 Hasta 5 Con Paso 2 Hacer
          Escribir a;
        FinPara
      FinProceso`
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toBeCalledTimes(3)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '3')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '5')
    })

    test('test for statement with negative step', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `Proceso prueba
        Definir a Como Entero;
        Para a <- 5 Hasta 1 Con Paso -2 Hacer
          Escribir a;
        FinPara
      FinProceso`
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toBeCalledTimes(3)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '5')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '3')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1')
    })

    test('test nested for statement', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `Proceso prueba
        Definir a, b Como Entero;
        Para a <- 1 Hasta 5 Hacer
          Para b <- 1 Hasta 5 Hacer
            Escribir a, ' * ', b, ' = ', a * b;
          FinPara
        FinPara
      FinProceso`
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toBeCalledTimes(25)
      for (let i = 1; i <= 5; i++) {
        for (let j = 1; j <= 5; j++) {
          expect(eventBus.emit).toHaveBeenCalledWith('output-request', `${i} * ${j} = ${i * j}`)
        }
      }
    })

    test('test nested for statement with break', async () => {
      vi.spyOn(eventBus, 'emit')
      const code = `Proceso prueba
        Definir a, b Como Entero;
        Para a <- 1 Hasta 5 Hacer
          Para b <- 1 Hasta 5 Hacer
            Si b = 3 Entonces
              Romper;
            FinSi
            Escribir a, ' * ', b, ' = ', a * b;
          FinPara
        FinPara
      FinProceso`
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toBeCalledTimes(10)
      for (let i = 1; i <= 5; i++) {
        for (let j = 1; j <= 2; j++) {
          expect(eventBus.emit).toHaveBeenCalledWith('output-request', `${i} * ${j} = ${i * j}`)
        }
      }
    })
  })

})