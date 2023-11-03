import { beforeEach, describe, expect, test } from 'vitest';
import { CharStream, CommonTokenStream, InputStream } from 'antlr4';

import StepCodeLexer from '../src/parser/StepCodeLexer';
import StepCodeParser from '../src/parser/StepCodeParser';
import { StepCodeInterpreter } from '../src/interpreter/stepcode-interpreter';
import { EventBus } from '../src/interpreter/event-bus';

test('test parsing', async () => {
  const input = `
  Proceso prueba
    Definir a, b, c Como Entero;
    Definir w, x, y, z Como Real;
    Escribir 'Ingrese el valor de a:';
    Leer a, b;
    c <- a + b;
    Escribir 'El resultado es ', c;
  FinProceso
  `
  const chars = new CharStream(input, true)
  const lexer = new StepCodeLexer(chars)
  const tokens = new CommonTokenStream(lexer)
  const parser = new StepCodeParser(tokens)

  const program = parser.program()

  const eventBus = new EventBus()

  eventBus.on('input-request', async (callback: Function) => {
    // wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 1000))
    callback('100')
  })

  eventBus.on('output-request', (value: string) => {
    console.log('output-request', value)
  })

  const interpreter = new StepCodeInterpreter(eventBus);

  await interpreter.start(program)



  // console.log(program)
})
describe('test interpreter', () => {
  beforeEach(() => {

  })
  test('test basic sum operation', async () => {})
})
