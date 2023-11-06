# StepCode

StepCode is a pseudo-code language for writing step-by-step instructions. It is designed to be easy to read and write, 
and to be easily converted to other languages. It is based on the syntax
of [PSeInt](http://pseint.sourceforge.net/), a pseudo-code language for teaching programming.

## About this repository

This repository contains the source code for the StepCode interpreter for NodeJS/Browser. 
It uses the [ANTLR](http://www.antlr.org/) parser generator.

## Installation

To install the StepCode interpreter, run the following command:

```
npm install stepcode
```

## Usage

To use the StepCode interpreter, you must first import the interpreter

```typescript
import { interpret, EventBus } from 'stepcode';
```

Create an event bus to receive events from the interpreter:

```typescript
const eventBus = new EventBus();

eventBus.on('output-request', (message: string) => {
    console.log(message);
});

eventBus.on('input-request', (resolve: (s: string) => void) => {
  console.log(message);
});
```

Then, you can interpret a StepCode program by calling the `interpret` function:

```typescript
const result = interpret({
    code: `Proceso HolaMundo
        Escribir "Hola mundo";
    FinProceso`,
});
```

The `interpret` function returns a promise that resolves to the result of the program.

