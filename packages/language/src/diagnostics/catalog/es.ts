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
    'Los subprogramas no pueden ir dentro de otro bloque; declara «{kw:$form}» fuera de «{kw:program}» … «{kw:endProgram}».',
  E2020: 'No se puede asignar al resultado de una llamada: a la izquierda va una variable.',
  E2021:
    'Al parámetro «{name}» le falta su tipo: escribe «{name} {kw:as} {type:integer}», por ejemplo.',
  E2022: 'Este parámetro ya tiene «{kw:$modifier}».',
  E2023: 'Las dimensiones deben tener tamaño todas o ninguna.',
  E2030: 'No se pueden encadenar comparaciones: escribe «a {first} b {kw:and} b {second} c».',
  E2031: 'Falta una expresión aquí: encontré «{found}».',
  E2032: 'La expresión o el bloque está anidado demasiado profundo (más de {limit} niveles).',
  W2001: 'Instrucción vacía: este «;» sobra.',
  E3001: '«{name}» no está declarada.',
  E3002: '«{name}» ya está declarada en este bloque.',
  E3003: '«{name}» se usa aquí, antes de declararse más abajo: mueve la declaración arriba.',
  E3004: 'Ya hay un subprograma llamado «{name}»: usa otro nombre para la variable.',
  E3005: '«{name}» es un subprograma, no una variable.',
  E3006: '«{name}» no es un subprograma: no se puede llamar.',
  E3007: '«{name}» es una constante: su valor no se puede cambiar.',
  E3008: '«{name}» es el contador de este bucle: no se puede cambiar dentro del bucle.',
  E3009: '«{name}» es un arreglo completo, y aquí hace falta un valor.',
  E3010: 'No se puede guardar un {found} donde se espera un {expected}.',
  E3011: 'Un {type:char} guarda una sola letra, y este texto tiene {length}.',
  E3012: '«{op}» no puede operar con {found}: aquí espera {expected}.',
  E3013:
    'No se puede cambiar una letra suelta de un texto; arma el texto nuevo con «{builtin:substring}» y «{builtin:concat}».',
  E3014: 'La condición tiene que ser {type:boolean}, y esta es {found}.',
  E3015: 'No puedo deducir el tipo de «{name}».',
  E3016: 'Este arreglo necesita {expected} índices y le diste {found}.',
  E3017: 'Un índice tiene que ser {type:integer}, y este es {found}.',
  E3020: '«{name}» es un subprograma sin valor de retorno: no se puede usar como valor.',
  E3021: '«{name}» no está declarada: declárala antes de dimensionarla.',
  E3022: '«{name}» no se puede dimensionar.',
  E3023: 'El tamaño de un arreglo tiene que ser un número entero positivo conocido de antemano.',
  E3024: 'El valor de la constante «{name}» tiene que poder calcularse antes de ejecutar.',
  E3025: 'Esto divide entre cero: «{op}» necesita un divisor distinto de 0.',
  E3026: 'El contador «{name}» tiene que ser {type:integer}, y es {found}.',
  E3027: 'El paso no puede ser 0: el bucle nunca terminaría.',
  E3028:
    'No se puede elegir según un valor {found}: usa {type:integer}, {type:char} o {type:string}.',
  E3029: 'Este valor tiene que poder calcularse antes de ejecutar.',
  E3030: 'El valor {value} ya aparece en otra opción de este «{kw:switch}».',
  E3031: '«{kw:$kw}» solo puede usarse dentro de un bucle.',
  E3032:
    'El parámetro «{param}» es {kw:byRef}: aquí hay que pasar una variable, no un valor calculado.',
  E3033: 'Solo una {kw:function} puede devolver un valor.',
  E3034: '«{name}» necesita {expected} argumentos y le diste {found}.',
  E3035: 'El argumento {position} de «{name}» es {found} y se espera {expected}.',
  E3036: '«{builtin:$builtin}» necesita {expected} argumentos y le diste {found}.',
  E3037: 'El argumento {position} de «{builtin:$builtin}» es {found} y se espera {expected}.',
  W3001: 'Este código nunca se ejecuta.',
  W3002: '«{name}» se declara pero nunca se lee.',
  W3003: '«{name}» se lee pero nunca recibe un valor.',
  W3004: '«{name}» nunca recibe un valor: la función no devuelve nada.',
}

const variants: Record<string, string> = {
  'E1001.indexBase':
    'No entiendo «{text}» aquí. Si querías que los arreglos empiecen en 0, se hace con la opción «indexBase» del perfil, no con una línea en el programa.',
  'E2002.builtin':
    'No esperaba «{found}» aquí: «{builtin:$builtin}» es una función del lenguaje, elige otro nombre.',
  'E3001.suggest': '«{name}» no está declarada. ¿Querías decir «{suggestion}»?',
  'E3001.declare': '«{name}» no está declarada: declárala con «{kw:define}» antes de usarla.',
  'E3002.result':
    '«{name}» ya es el resultado de esta función: quita este «{kw:define}», la cabecera ya la declara.',
  'E3002.parameter': '«{name}» ya es un parámetro de este subprograma.',
  'E3009.array': '«{name}» es un arreglo completo, y aquí hace falta un valor.',
  'E3009.scalar': '«{name}» no es un arreglo: no se puede indexar.',
  'E3010.trunc':
    'No se puede guardar un {found} donde se espera un {expected}: usa «{builtin:trunc}» o «{builtin:round}».',
  'E3010.div':
    'No se puede guardar un {found} donde se espera un {expected}: «{kw:div}» da la división entera.',
  'E3010.index':
    'No se puede guardar un {found} donde se espera un {expected}: toma una letra con «texto[i]».',
  'E3010.toNumber':
    'No se puede guardar un {found} donde se espera un {expected}: conviértelo con «{builtin:toNumber}».',
  'E3010.toText':
    'No se puede guardar un {found} donde se espera un {expected}: conviértelo con «{builtin:toText}».',
  'E3010.rank':
    'Este arreglo es {found} y se espera {expected}: no coincide el número de dimensiones.',
  'E3010.element':
    'Este arreglo es {found} y se espera {expected}: no coincide el tipo de sus elementos.',
  'E3012.divide': '«{op}» solo divide enteros: para dividir con decimales usa «{op:divide}».',
  'E3012.trunc':
    '«{op}» solo opera con {type:integer}: convierte antes con «{builtin:trunc}» o «{builtin:round}».',
  'E3012.toText': '«{op}» no mezcla texto y números: convierte el número con «{builtin:toText}».',
  'E3014.compare':
    'La condición tiene que ser {type:boolean}, y esta es {found}: compara explícitamente, por ejemplo «… <> 0».',
  'E3015.parameter':
    'No puedo deducir el tipo del parámetro «{name}»: escribe «{name} {kw:as} {type:integer}», por ejemplo.',
  'E3015.result':
    'No puedo deducir el tipo del resultado «{name}»: declara el tipo de la función con «{kw:as}».',
  'E3022.again': '«{name}» ya es un arreglo dimensionado: solo se puede dimensionar una vez.',
  'E3022.kind': '«{name}» no es una variable de este bloque: solo se dimensionan variables.',
  'E3022.rank':
    '«{name}» se declaró con otro número de dimensiones: usa {expected} en lugar de {found}.',
  'E3035.trunc':
    'El argumento {position} de «{name}» es {found} y se espera {expected}: usa «{builtin:trunc}» o «{builtin:round}».',
  'E3035.div':
    'El argumento {position} de «{name}» es {found} y se espera {expected}: «{kw:div}» da la división entera.',
  'E3035.index':
    'El argumento {position} de «{name}» es {found} y se espera {expected}: toma una letra con «texto[i]».',
  'E3035.toNumber':
    'El argumento {position} de «{name}» es {found} y se espera {expected}: conviértelo con «{builtin:toNumber}».',
  'E3035.toText':
    'El argumento {position} de «{name}» es {found} y se espera {expected}: conviértelo con «{builtin:toText}».',
  'E3035.rank':
    'El argumento {position} de «{name}» es {found} y se espera {expected}: no coincide el número de dimensiones.',
  'E3035.element':
    'El argumento {position} de «{name}» es {found} y se espera {expected}: no coincide el tipo de sus elementos.',
}

export const es: Catalog = { templates, variants }
