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

  describe('imc calculator', () => {
    const code = `Proceso CalculoIMC
    Definir peso, altura, imc Como Real;
    Escribir "Introduzca su peso en kg";
    Leer peso;
    Escribir "Introduzca su altura en m";
    Leer altura;
    imc ← peso / altura ** 2;
    Si imc < 16 Entonces
        Escribir "Delgadez severa";
    Sino Si imc < 17 Entonces
        Escribir "Delgadez moderada";
    Sino Si imc < 18.5 Entonces
        Escribir "Delgadez leve";
    Sino Si imc < 25 Entonces
        Escribir "Normal";
    Sino Si imc < 30 Entonces
        Escribir "Sobrepeso";
    Sino Si imc < 35 Entonces
        Escribir "Obesidad leve";
    Sino Si imc < 40 Entonces
        Escribir "Obesidad media";
    Sino
        Escribir "Obesidad morbida";
    FinSi
    Escribir imc;
    FinProceso`

    test('test imc calculator', async () => {
      let i = 0;
      const inputs = [60, 1.7]
      eventBus.on('input-request', (resolve) => {
        resolve(inputs[i++].toString())
      })
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'Normal')
    })
  })

  describe('print characters of a string', () => {
    const code = `Proceso prueba
    Definir a Como Cadena;
    Leer a;
    Para i ← 1 Hasta Longitud(a) Con Paso 1 Hacer
        Escribir a[i];
    FinPara
    FinProceso`

    test('test print characters of a string', async () => {
      vi.spyOn(eventBus, 'emit')
      eventBus.on('input-request', (resolve) => {
        resolve('Hola')
      })
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'H')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'o')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'l')
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'a')
    })
  })

})