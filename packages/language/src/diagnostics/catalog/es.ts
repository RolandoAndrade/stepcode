import type { DiagnosticCode } from '../codes'
import type { Catalog } from '../format'

const templates: Record<DiagnosticCode, string> = {
  E1001: 'No entiendo «{text}» aquí.',
  E1002: 'A este texto le falta la comilla de cierre.',
  E1003:
    '«{text}» no es un número válido: deja un espacio o un operador entre el número y las letras.',
  E1006: '«==» no existe en StepCode: para comparar dos valores se escribe «{op:equal}».',
  E2001: 'Falta «;» al final de esta instrucción.',
  E2002: 'No esperaba «{found}» aquí.',
  E2003: 'Falta «{kw:$closer}» para cerrar el «{kw:$opener}» que empieza en la línea {openerLine}.',
  E2004: 'Falta «{kw:$expected}» aquí.',
  E2005: 'Falta «{bracket}»: hay un paréntesis o un corchete sin cerrar.',
  E2006: '«{kw:$closer}» no cierra ningún bloque abierto.',
  E2010: 'Falta el bloque principal: el programa necesita «{kw:program}» … «{kw:endProgram}».',
  E2011: 'Ya hay un bloque «{kw:program}» en este archivo: solo puede haber uno.',
  E2012: '«{found}» está fuera de todo bloque: ponlo dentro de «{kw:program}» … «{kw:endProgram}».',
  E2013: 'Este «{kw:switch}» ya tiene un «{kw:otherwise}»: solo puede haber uno.',
  E2014: '«{kw:elseIf}» no puede ir después de «{kw:else}»: mueve esta rama antes del «{kw:else}».',
  E2015:
    'Los subprogramas no pueden ir dentro de otro bloque; declara «{kw:procedure}» fuera de «{kw:program}» … «{kw:endProgram}».',
  E2020: 'No se puede asignar al resultado de una llamada: a la izquierda va una variable.',
  E2021:
    'Al parámetro «{name}» le falta su tipo: escribe «{name} {kw:as} {type:integer}», por ejemplo.',
  E2022: 'Este parámetro ya tiene «{kw:$modifier}».',
  E2023: 'Las dimensiones deben tener tamaño todas o ninguna.',
  E2030: 'No se pueden encadenar comparaciones: escribe «a {first} b {kw:and} b {second} c».',
  E2031: 'Falta una expresión aquí: encontré «{found}».',
  E2032: 'La expresión o el bloque está anidado demasiado profundo (más de {limit} niveles).',
  W2001: 'Instrucción vacía: este «;» sobra.',
}

const variants: Record<string, string> = {
  'E1001.indexBase':
    'No entiendo «{text}» aquí. Si querías que los arreglos empiecen en 0, se hace con la opción «indexBase» del perfil, no con una línea en el programa.',
}

export const es: Catalog = { templates, variants }
