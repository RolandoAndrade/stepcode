import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EventBus, interpret, StepCodeInterpreter } from '../src';

describe('test interpreter conditional operations', () => {
  let eventBus: EventBus
  let interpreter: StepCodeInterpreter
  beforeEach(() => {
    eventBus = new EventBus()
    interpreter = new StepCodeInterpreter(eventBus)
  })

})