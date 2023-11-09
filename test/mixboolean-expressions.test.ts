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

  describe('mix arithmetic with boolean and relational operations', () => {
    describe('test valid triangle', async () => {
      const code = `Proceso Triangulo
      Definir a, b, c Como Real;
      Definir valido Como Logico;
      Leer a, b, c;
      valido <- a < b + c Y b < a + c Y c < a + b;
      Escribir valido;
      FinProceso`;

      test('test true', async () => {
        vi.spyOn(eventBus, 'emit')
        const inputs = [3, 4, 5]
        let i = 0;
        eventBus.on('input-request', (resolve) => {
          resolve(inputs[i++].toString())
        })
        await internalInterpret(code, interpreter)
        expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'true')
      })

      test('test false', async () => {
        vi.spyOn(eventBus, 'emit')
        const inputs = [3, 4, 8]
        let i = 0;
        eventBus.on('input-request', (resolve) => {
          resolve(inputs[i++].toString())
        })
        await internalInterpret(code, interpreter)
        expect(eventBus.emit).toHaveBeenCalledWith('output-request', 'false')
      })
    })

    describe('test true value', async () => {
      const code = `Proceso prueba
      Definir a, b, c Como Real;
      Definir x, yy, z Como Logico;
      Leer a, b, c;
      x <- a * b + c < a * (b + c);
      yy <- a * b + c > a * (b + c);
      z <- a * b + c = a * (b + c);
      Escribir x, yy, z;
      Escribir x Y yy O z;
      Escribir a * b + c < a * (b + c) Y a * b + c > a * (b + c) O a * b + c = a * (b + c);
      FinProceso`;

      test('test 1', async () => {
        vi.spyOn(eventBus, 'emit')
        const inputs = [2, 3, 4]
        let i = 0;
        eventBus.on('input-request', (resolve) => {
          resolve(inputs[i++].toString())
        })
        await internalInterpret(code, interpreter)
        const x = 2 * 3 + 4 < 2 * (3 + 4)
        const yy = 2 * 3 + 4 > 2 * (3 + 4)
        const z = 2 * 3 + 4 === 2 * (3 + 4)
        expect(eventBus.emit).toHaveBeenCalledWith('output-request', `${x}${yy}${z}`)
        expect(eventBus.emit).toHaveBeenCalledWith('output-request', `${x && yy || z}`)
        expect(eventBus.emit).toHaveBeenCalledWith('output-request', `${x && yy || z}`)
      })

      test('test 2', async () => {
        vi.spyOn(eventBus, 'emit')
        const inputs = [7, 2, 8]
        let i = 0;
        eventBus.on('input-request', (resolve) => {
          resolve(inputs[i++].toString())
        })
        await internalInterpret(code, interpreter)
        const x = 7 * 2 + 8 < 7 * (2 + 8)
        const yy = 7 * 2 + 8 > 7 * (2 + 8)
        const z = 7 * 2 + 8 === 7 * (2 + 8)
        expect(eventBus.emit).toHaveBeenCalledWith('output-request', `${x}${yy}${z}`)
        expect(eventBus.emit).toHaveBeenCalledWith('output-request', `${x && yy || z}`)
        expect(eventBus.emit).toHaveBeenCalledWith('output-request', `${x && yy || z}`)
      })
    })
  })

})