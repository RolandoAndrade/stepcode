import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EventBus, StepCodeInterpreter } from '../src';
import { internalInterpret } from '../src/interpreter/internal-interpret';
import { computeTokenPosition } from '../src/interpreter/completions/compute-token-index';
import { getSuggestions } from '../src/interpreter/completions/autocomplete';


describe('test suggestions', () => {
  test('test basic suggestions', async () => {
    const code = `Proceso prueba
    Definir a, b, c Como E
    FinProceso`;
    for (let i = 1; i < 60; i++) {
      const suggestions = getSuggestions(code, { line: 2, column: i }, computeTokenPosition);
      console.log(suggestions);
    }

  });
})