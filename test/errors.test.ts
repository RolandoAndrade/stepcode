import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EventBus, StepCodeInterpreter } from '../src';
import { validate } from '../src/interpreter/interpreter';

describe('test validation errors', () => {
  let eventBus: EventBus
  let interpreter: StepCodeInterpreter
  beforeEach(() => {
    eventBus = new EventBus()
    interpreter = new StepCodeInterpreter(eventBus)
  })

  describe('test basic validation errors', () => {
    test('test missing semicolon at line 2', () => {
      const errors = validate(`Proceso prueba
      Definir a, b, c Como Entero
      a <- 10;
      b <- 20;
      c <- a + b;
      Escribir c;
      FinProceso`)
      expect(errors).toEqual([])
    })
  })

})