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

  describe('marathon qualifiers', () => {
    const code = `Proceso Maraton
    Definir edad como Entero;
    Definir sexo como Caracter;
    Definir tiempo como Real;
    Escribir "Ingrese la edad de la persona: ";
    Leer edad;
    Escribir "Ingrese el sexo de la persona (M/F): ";
    Leer sexo;
    sexo ← Mayusculas(sexo);
    Escribir "Ingrese el tiempo de calificacion en minutos: ";
    Leer tiempo;
    Si sexo = 'M' Entonces
        Si edad < 40 Y tiempo < 150.0 Entonces
            Escribir "El corredor clasifica";
        SiNo Si (edad ≥ 40 ) Y (tiempo < 175) Entonces
            Escribir "El corredor clasifica";
        Sino
            Escribir "El corredor no clasifica";
        FinSi
    SiNo Si sexo = 'F' Entonces
        Si tiempo < 180 Entonces
            Escribir "El corredor clasifica";
        SiNo
            Escribir "El corredor no clasifica";
        FinSi
    SiNo
        Escribir "El sexo ingresado no es valido";
    FinSi
    FinProceso`

    test('test <40 year old male', async () => {
      let i = 0;
      const inputs = [39, 'm', 149.9]
      eventBus.on('input-request', (resolve) => {
        resolve(inputs[i++].toString())
      })
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'El corredor clasifica')
    })

    test('test <40 year old male slow', async () => {
      let i = 0;
      const inputs = [39, 'm', 150]
      eventBus.on('input-request', (resolve) => {
        resolve(inputs[i++].toString())
      })
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'El corredor no clasifica')
    })

    test('test >= 40 year old male', async () => {
      let i = 0;
      const inputs = [40, 'm', 174.9]
      eventBus.on('input-request', (resolve) => {
        resolve(inputs[i++].toString())
      })
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'El corredor clasifica')
    })

    test('test >= 40 year old male slow', async () => {
      let i = 0;
      const inputs = [40, 'm', 175]
      eventBus.on('input-request', (resolve) => {
        resolve(inputs[i++].toString())
      })
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'El corredor no clasifica')
    })

    test('test females', async () => {
      let i = 0;
      const inputs = [40, 'f', 179.9]
      eventBus.on('input-request', (resolve) => {
        resolve(inputs[i++].toString())
      })
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'El corredor clasifica')
    })

    test('test females slow', async () => {
      let i = 0;
      const inputs = [40, 'f', 180.0]
      eventBus.on('input-request', (resolve) => {
        resolve(inputs[i++].toString())
      })
      vi.spyOn(eventBus, 'emit')
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'El corredor no clasifica')
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

  describe('bubble sort', () => {
    const code = `Proceso prueba
    Definir a, aux Como Entero;
    Dimension a[5];
    Para i ← 1 Hasta 5 Con Paso 1 Hacer
        Leer a[i];
    FinPara
    Para i ← 1 Hasta 5 Con Paso 1 Hacer
        Para j ← 1 Hasta 5 - i Con Paso 1 Hacer
            Si a[j] > a[j + 1] Entonces
                aux ← a[j];
                a[j] ← a[j + 1];
                a[j + 1] ← aux;
            FinSi
        FinPara
    FinPara
    Escribir a;
    FinProceso`

    test('test bubble sort', async () => {
      vi.spyOn(eventBus, 'emit')
      const inputs = [42, 12, 1, 15, 16]
      let i = 0
      eventBus.on('input-request', (resolve) => {
        resolve(inputs[i++].toString())
      })
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', '1,12,15,16,42')
    })
  })

  describe('upper lower case', () => {
    const code = `Proceso MayusculasMinusculas
    Definir palabra Como Cadena;
    Definir letra Como Caracter;
    Escribir 'Introduce palabra';
    Leer palabra;
    Para i ← 1 Hasta Longitud(palabra) Con Paso 1 Hacer
        Si i MOD 2 = 0 Entonces
            letra ← Minusculas(palabra[i]);
        Sino
            letra ← Mayusculas(palabra[i]);
        FinSi
        palabra ← Subcadena(palabra, 1, i - 1) + letra + Subcadena(palabra, i + 1, Longitud(palabra));
    FinPara
    Escribir palabra;
    FinProceso`

    test('test upper lower case', async () => {
      vi.spyOn(eventBus, 'emit')
      eventBus.on('input-request', (resolve) => {
        resolve('Rolando Andrade')
      })
      await internalInterpret(code, interpreter)
      expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'RoLaNdO AnDrAdE')
    })
  })

})