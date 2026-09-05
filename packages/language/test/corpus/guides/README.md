# The course-guide corpus

Programs written from the eleven practice guides of *Fundamentos de Programación* (Rolando
Andrade): the eight unit guides (U1–U6, plus the U5 arrays/strings/matrices sheets), the two
pretaller sheets and the review sheet. They are written in **strict StepCode** — the default
`es` profile: semicolons, every variable declared, typed parameters, `indexBase` 1 — and every
one of them checks clean, with no error and no warning (`guides.test.ts`).

The guides are the inspiration, not a transcript. The v1 conformance corpus next door
(`../programs`) already covers most of the arithmetic, conditional and loop exercises, so the
programs here are the ones a student would actually hand in for the exercises the corpus does
*not* cover, plus programs written on purpose for checker features the corpus barely touches:
`Constante` (absent there), typed array and matrix parameters (`Como Entero[]`, `Como
Entero[,]` — absent), `Concatenar`, `Escribir Sin Saltar`, `Esperar`, `Esperar Tecla`,
`Limpiar Pantalla` and `Aleatorio` (all absent), recursion (absent), and `DIV`, `Caracter`,
`Subcadena`, `Segun` over `Cadena`, and the trigonometric and logarithmic builtins (all thin).

Every program also has a `<slug>.run.json` sidecar — `{ runs: [{ name?, inputs, output, seed? }] }`,
the schema of `../programs/README.md` — recorded with `scripts/record-run.ts` and read against
the source by hand; `run.test.ts` replays each one under `es` and asserts the output. The
inputs chosen for each program are listed under **Runs** below.

## Programs

| Program | Guide | Exercise | Exercises |
| --- | --- | --- | --- |
| `u1-energia-einstein` | U1 | 5 | `Constante`, `^`, `Real` arithmetic |
| `u1-tiempo-mru` | U1 | 6 | `Escribir Sin Saltar`, `Real` division, guard against zero |
| `u1-operaciones-basicas` | U1 | 4 | `DIV` and `MOD` beside `/` and `^` |
| `u1-saludo-nombre-apellido` | U1 | 2 | nested `Concatenar` |
| `u2-tipos-de-datos` | U2 | 3 | one variable of each scalar type, `ConvertirATexto` |
| `u3-intercambio-por-referencia` | U3 | 7 | typed `Por Referencia` parameters |
| `u3-mayor-de-tres` | U3 | 8 | function called inside its own argument list |
| `u3-formula-cuadratica` | U3 | 6.f | `RC`, `Abs`, unary minus, nested `Si` |
| `u3-funciones-trigonometricas` | U3 | 6.c | `Sen`, `Cos`, `Tan`, `Ln`, `Exp`, `PI` |
| `pretaller-bandera-venezuela` | Pretaller | 1 | nested `Para` with a computed bound |
| `pretaller-mosaico` | Pretaller | 2 | one loop with `DIV`/`MOD` instead of two |
| `pretaller-mosaico-con-marco` | Pretaller | 3 | procedure called around a nested loop |
| `u4-paquetes-de-caramelos` | U4 | 1 | `DIV`/`MOD` chain over one value |
| `u4-area-circulo-constante` | U4 | 2 | `Constante` inside the process, next to `PI` |
| `u4-promedio-ponderado` | U4 | 4 | `Redon`, `Real` weights, `Sino Si` ladder |
| `u4-conversion-de-distancias` | U4 | 6 | `Segun` over `Cadena` labels, `De Otro Modo` |
| `u4-suma-de-digitos` | U4 | 8 | `Mientras` with `DIV`/`MOD` |
| `u4-mcd-recursivo` | U4 | 11 | recursion |
| `u4-mcm-con-mcd` | U4 | 10 | function calling a function, `Repetir … Hasta Que`, `Caracter` |
| `u4-primos-en-intervalo` | U4 | 12 | `Logico` function, `Continuar`, `Trunc(RC(n))` |
| `u4-numero-a-hexadecimal` | U4 | 17 | string indexing as a lookup table, `Cadena` result |
| `u4-collatz` | U4 | 16 | `Mientras Que`, reassigning the read variable |
| `u4-palindromo-numerico` | U4 | 15 | `Repetir` around a helper function |
| `u5-pretaller-adivinar-contrasena` | U5 Pretaller | 1 | `Logico` flag, `Y`/`No` in a loop condition |
| `u5-pretaller-palabras-sin-repetir` | U5 Pretaller | 2 | `Cadena[]` parameter, linear search |
| `u5-pretaller-editor-de-cadena` | U5 Pretaller | 3 | `Subcadena` splice, `Caracter` parameter |
| `u5-arreglos-orden-descendente` | U5 Arreglos | 1 | array parameters written inside a subprocess |
| `u5-arreglos-menu-de-orden` | U5 Arreglos | 2 | `Segun` over `Entero`, `Logico` argument |
| `u5-arreglos-eliminar-pares` | U5 Arreglos | 3 | array plus by-reference length |
| `u5-arreglos-insercion-ordenada` | U5 Arreglos | 4 | by-reference count grown by the callee |
| `u5-arreglos-minimo-y-maximo` | U5 Arreglos | 5 | two by-reference outputs |
| `u5-arreglos-buscar-cadena` | U5 Arreglos | 6 | `Cadena[]` search with `Minusculas` |
| `u5-arreglos-generador-de-nombres` | U5 Arreglos | 7 | `Aleatorio` as an index |
| `u5-arreglos-producto-punto` | U5 Arreglos | 8 | `Real[]` parameters, accumulation |
| `u5-cadenas-invertir` | U5 Cadenas | 1 | `Caracter` from `s[i]` concatenated into a `Cadena` |
| `u5-cadenas-mayusculas-alternadas` | U5 Cadenas | 2 | `Mayusculas`/`Minusculas` keeping `Caracter` |
| `u5-cadenas-vocales-en-mayuscula` | U5 Cadenas | 3 | `Caracter` compared with one-character literals |
| `u5-cadenas-eliminar-vocales` | U5 Cadenas | 4 | `Segun` over `Caracter` with a label list |
| `u5-cadenas-contar-caracter` | U5 Cadenas | 8 | `Caracter` parameter |
| `u5-cadenas-primer-repetido` | U5 Cadenas | 10 | nested loops over one string |
| `u5-cadenas-mezclar` | U5 Cadenas | 11 | `Subcadena` for the tail of the longer string |
| `u5-matrices-suma` | U5 Matrices | 1 | `Como Entero[,]` parameters, `m[i, j]` |
| `u5-matrices-producto` | U5 Matrices | 3 | triple nested loop |
| `u5-matrices-transpuesta` | U5 Matrices | 4 | two matrix parameters, `Real[,]` |
| `u5-matrices-simetrica` | U5 Matrices | 5 | `Logico` function over a matrix |
| `u6-operaciones-de-arreglo` | U6 | 1 | eight subprograms over the same array |
| `u6-menu-interactivo` | U6 | 4 | `Limpiar Pantalla`, `Esperar`, `Esperar Tecla`, `Romper` |
| `u6-funciones-utilitarias` | U6 | 4 | `Real` and `Logico` results, recursion |
| `repaso-cadenas-concatenadas` | Repaso | 4 | `Cadena` reassignment chain (the guide's own program) |
| `repaso-numeros-repetidos` | Repaso | 7 | `Y`/`O` in a `Sino Si` ladder |
| `repaso-altura-a-metros` | Repaso | 8 | `Constante`, `Minusculas`, nested classification |
| `repaso-salario-por-tramos` | Repaso | 10 | tiered `Real` arithmetic in a function |

## Error corpus

`errors/` holds short programs that each contain exactly one realistic student mistake taken
from the same topics. The first line of every file declares the diagnostics the checker must
report, in order:

```
// expect: E3010
```

`guides.test.ts` asserts the checker's codes equal that list exactly — no more and no fewer —
so these files pin both what is reported and what is *not*.

| Program | Mistake | Code |
| --- | --- | --- |
| `e3001-variable-no-declarada` | the second operand is never declared | E3001 |
| `e3002-definir-repetido` | the same variable is defined twice | E3002 |
| `e3003-uso-antes-de-declarar` | the variable is used above its `Definir` | E3003 |
| `e3006-llamar-a-una-variable` | a variable is called like a function | E3006 |
| `e3007-asignar-a-constante` | a value is assigned to a `Constante` | E3007 |
| `e3008-asignar-al-contador` | the `Para` counter is advanced by hand | E3008 |
| `e3009-escribir-arreglo-completo` | `Escribir` of a whole array | E3009 |
| `e3010-promedio-real-en-entero` | a `Real` average stored in an `Entero` | E3010 |
| `e3011-literal-largo-en-caracter` | a whole word assigned to a `Caracter` | E3011 |
| `e3012-texto-mas-numero` | `Cadena + Entero` without converting | E3012 |
| `e3013-asignar-en-una-cadena` | writing into a string by index | E3013 |
| `e3014-condicion-no-logica` | a number used as a condition | E3014 |
| `e3016-indices-de-mas` | a one-dimensional array indexed as a matrix | E3016 |
| `e3017-indice-real` | a `Real` used as an index | E3017 |
| `e3022-dimension-repetida` | `Dimension` over an array that already has a size | E3022 |
| `e3023-tamano-variable` | the array size is a variable read at runtime | E3023 |
| `e3025-division-entre-cero` | division by the literal zero | E3025 |
| `e3026-contador-real` | the `Para` counter is declared `Real` | E3026 |
| `e3027-paso-cero` | `Con Paso 0` | E3027 |
| `e3028-selector-real` | `Segun` over a `Real` | E3028 |
| `e3030-etiqueta-duplicada` | the menu repeats a label | E3030 |
| `e3031-romper-fuera-de-ciclo` | `Romper` with no loop around it | E3031 |
| `e3032-referencia-con-literal` | a literal passed to a by-reference parameter | E3032 |
| `e3033-retornar-en-el-proceso` | `Retornar` with a value in the main process | E3033 |
| `e3034-aridad-incorrecta` | three arguments for a two-parameter function | E3034 |
| `e3035-argumento-de-tipo-incorrecto` | a `Cadena` passed where an `Entero` is expected | E3035 |
| `e3036-aridad-de-subcadena` | `Subcadena` called with two arguments | E3036 |
| `e3037-longitud-de-un-numero` | `Longitud` of a number | E3037 |
| `w3001-codigo-inalcanzable` | a statement after the last `Retornar` | W3001 |
| `w3002-variable-no-usada` | a declared variable that is never read | W3002 |
| `w3003-variable-sin-valor` | an accumulator read before it is initialised | W3003 |
| `w3004-funcion-sin-resultado` | the function never assigns its result | W3004 |

## Runtime corpus

`runtime/` holds one program per runtime code, E4001–E4008, each a realistic mistake from the
same guides. The first line declares the code; when the program reads input, one
`// input: <text>` line per answer follows it, the text after the single space verbatim:

```
// expect: E4004
// input: veinte
```

`guides.test.ts` compiles each one clean, drives it with `start` and `continue`, answers input
from the header lines, and asserts the run ends with exactly that code — from an `error` result,
or, for E4004, from the `rejected` diagnostic of the re-reported input request.

## Runs

| Program | Inputs | What the run shows |
| --- | --- | --- |
| `pretaller-bandera-venezuela` | `2` `4` | a flag two rows per stripe, four columns wide |
| `pretaller-mosaico-con-marco` | `4` | a four-by-four mosaic inside its frame |
| `pretaller-mosaico` | `4` | a four-by-four mosaic of alternating colours |
| `repaso-altura-a-metros` | `Femenino` `5.6` | a female height of 5.6 feet lands in the tall branch |
| `repaso-cadenas-concatenadas` | — | the reassignment chain of the guide's own program |
| `repaso-numeros-repetidos` | `4` `4` `7` | two of the three numbers match |
| `repaso-salario-por-tramos` | `40` `2500` | a gross salary that reaches every tax tier |
| `u1-energia-einstein` | `0.001` | one gram of Energion |
| `u1-operaciones-basicas` | `17` `5` | seventeen and five, so every operator shows a distinct value |
| `u1-saludo-nombre-apellido` | `Rolando` `Andrade` | a first and last name joined into one greeting |
| `u1-tiempo-mru` | `12` `0.5` | a snail that does move, so the division branch runs |
| `u2-tipos-de-datos` | `Ana` `22` `1.62` `P` | one value of each type, with the student branch true |
| `u3-formula-cuadratica` | `1` `-5` `6` | a quadratic with two real roots |
| `u3-funciones-trigonometricas` | `45` | forty-five degrees, where the tangent is one |
| `u3-intercambio-por-referencia` | `7` `3` | two values swapped through by-reference parameters |
| `u3-mayor-de-tres` | `4` `9` `6` | the largest of three is the middle argument |
| `u4-area-circulo-constante` | `2.5` | a radius of two and a half, both constants |
| `u4-collatz` | `6` | six climbs to sixteen before falling to one |
| `u4-conversion-de-distancias` | `5` `km` `mi` | five kilometres to miles, a labelled case in both Segun |
| `u4-mcd-recursivo` | `48` `18` | forty-eight and eighteen, four levels of recursion |
| `u4-mcm-con-mcd` | `12` `18` `s` `4` `6` `n` | two passes of the Repetir loop before the user answers n |
| `u4-numero-a-hexadecimal` | `255` `4095` `0` | two conversions, then zero ends the loop |
| `u4-palindromo-numerico` | `12321` `1234` `0` | one palindrome, one that is not, then zero |
| `u4-paquetes-de-caramelos` | `18` | eighteen sweets leave one over |
| `u4-primos-en-intervalo` | `10` `30` | the primes between ten and thirty |
| `u4-promedio-ponderado` | `Ana` `15` `18` `17` | a weighted average that rounds into the pass band |
| `u4-suma-de-digitos` | `-1234` | a negative number, so Abs is what makes the loop run |
| `u5-arreglos-buscar-cadena` | `4` `Pera` `Manzana` `Uva` `Melon` `manzana` | a lowercase query finds a capitalised entry |
| `u5-arreglos-eliminar-pares` | `6` `3` `8` `5` `4` `7` `10` | three of six numbers survive the compaction |
| `u5-arreglos-generador-de-nombres` | `3` `2` `Ana` `Luis` `Sofia` `Perez` `Gomez` `4`, seed 1 | four names drawn from three firsts and two lasts |
| `u5-arreglos-insercion-ordenada` | `5` `3` `9` `1` `7` `2` `8` `6` `4` `10` | ten numbers inserted, the array sorted after each one |
| `u5-arreglos-menu-de-orden` | `5` `2` `4` `1` `5` `3` `2` | option two sorts the five numbers descending |
| `u5-arreglos-minimo-y-maximo` | `5` `7` `2` `9` `4` `1` | the smallest last and the largest in the middle |
| `u5-arreglos-orden-descendente` | `5` `3` `8` `1` `9` `5` | five numbers sorted from largest to smallest |
| `u5-arreglos-producto-punto` | `3` `0.5` `1.5` `-2` `4` `2` `3` | three weights against three inputs |
| `u5-cadenas-contar-caracter` | `cada palabra` `a` | the letter a, counted five times |
| `u5-cadenas-eliminar-vocales` | `Programacion Estructurada` | every vowel dropped from a two-word phrase |
| `u5-cadenas-invertir` | `algoritmo` | a word reversed character by character |
| `u5-cadenas-mayusculas-alternadas` | `algoritmo` | even positions upper, odd lower |
| `u5-cadenas-mezclar` | `abc` `wxyz` | a shorter first string, so the tail of the second is appended |
| `u5-cadenas-primer-repetido` | `programa` | the r of programa is the first letter to repeat |
| `u5-cadenas-vocales-en-mayuscula` | `algoritmo` | only the vowels come back uppercase |
| `u5-matrices-producto` | `2` `3` `2` `1` `2` `3` `4` `5` `6` `7` `8` `9` `10` `11` `12` | a two-by-three matrix times a three-by-two |
| `u5-matrices-simetrica` | `3` `1` `2` `3` `2` `4` `5` `3` `5` `6` | a three-by-three matrix that is symmetric |
| `u5-matrices-suma` | `2` `2` `1` `2` `3` `4` `5` `6` `7` `8` | two two-by-two matrices added entry by entry |
| `u5-matrices-transpuesta` | `2` `3` `1.5` `2.5` `3.5` `4.5` `5.5` `6.5` | a two-by-three matrix of reals transposed |
| `u5-pretaller-adivinar-contrasena` | `clave` `3` `abc` `clave` | one wrong guess, then the right one |
| `u5-pretaller-editor-de-cadena` | `5` `H` `1` `o` `2` `x` `0` | two characters written into a blank of five, then position zero |
| `u5-pretaller-palabras-sin-repetir` | `sol` `luna` `sol` `""` | a repeated word is refused before the empty line ends it |
| `u6-funciones-utilitarias` | `6` `7` | six feet, then seven: prime and factorial both in range |
| `u6-menu-interactivo` | `1` `1000` `""` `2` `10` `""` `0` | both menu options, then zero leaves |
| `u6-operaciones-de-arreglo` | `5` `4` `9` `1` `7` `3` `7` | five numbers through all eight subprograms |
