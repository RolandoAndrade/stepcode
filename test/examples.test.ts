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

  describe('valid triangle and type', () => {
    const code = `Proceso Triangulo
    Definir a, b, c Como Real;
    Definir iguales Como Entero;

    Escribir "Introduzca a, b y c";
    Leer a, b, c;

    Si (a ≥ b + c ) O (b ≥ a + c) O (c ≥ a + b) Entonces
        Escribir "Triangulo no valido";
    Sino
        iguales ← 0;
        Si a = b Entonces
            iguales ← iguales + 1;
        FinSi
        Si a = c Entonces
            iguales ← iguales + 1;
        FinSi
        Si b = c Entonces
            iguales ← iguales + 1;
        FinSi
        Segun iguales Hacer
            0:
                Escribir "Triangulo escaleno";
            1:
                Escribir "Triangulo isosceles";
            De otro modo:
                Escribir "Triangulo equilatero";
        FinSegun
    FinSi
    Escribir iguales;
    FinProceso`

    test('test invalid triangle', async () => {
      let i = 0;
      const inputs = [1.2, 3, 6.2]
      eventBus.on('input-request', (resolve) => {
        resolve(inputs[i++].toString())
      })
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'Triangulo no valido')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'Triangulo escaleno')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'Triangulo isosceles')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'Triangulo equilatero')
    })

    test('test equilateral triangle', async () => {
      let i = 0;
      const inputs = [3, 3, 3]
      eventBus.on('input-request', (resolve) => {
        resolve(inputs[i++].toString())
      })
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'Triangulo equilatero')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'Triangulo no valido')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'Triangulo escaleno')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'Triangulo isosceles')
    })

    test('test isosceles triangle', async () => {
      let i = 0;
      const inputs = [3, 3, 4]
      eventBus.on('input-request', (resolve) => {
        resolve(inputs[i++].toString())
      })
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'Triangulo isosceles')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'Triangulo no valido')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'Triangulo escaleno')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'Triangulo equilatero')
    })

    test('test scalene triangle', async () => {
      let i = 0;
      const inputs = [3, 4, 5]
      eventBus.on('input-request', (resolve) => {
        resolve(inputs[i++].toString())
      })
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'Triangulo escaleno')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'Triangulo no valido')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'Triangulo isosceles')
      expect(eventBus.emit).not.toHaveBeenCalledWith('output-request', 'Triangulo equilatero')
    })
  })


})