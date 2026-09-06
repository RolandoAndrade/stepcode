export const arrayOperationsProgram = `// Consigue el menor de dos numeros
Funcion Menor(a como Entero, b como Entero): Entero
    Si a > b Entonces
        // a es mayor, devuelve b que es menor
        Retornar b;
    FinSi
    // como no devolvio, a es menor
    Retornar a;
FinFuncion

// Intercambia las variables a y b
Procedimiento CambioDeVariables(a como Entero por Referencia, b como Entero por Referencia)
    // a: variable a
    // b: variable b
    Definir aux Como Entero;
    aux ← a;
    a ← b;
    b ← aux;
FinProcedimiento

// Inserta un elemento en un arreglo en determinada posicion.
Procedimiento Insertar(arreglo, elemento como Entero, posicion como Entero, longitud como Entero por Referencia)
    // arreglo: Arreglo en el que se quiere insertar un elemento
    // elemento: Elemento que se quiere insertar
    // posicion: Posicion dentro del arreglo donde se quiere insertar el elemento.
    // longitud: Longitud del arreglo actual. MAX 10
    Para i ← posicion Hasta longitud Hacer
        // por cada elemento desde la posicion donde se quiere insertar
        // hasta la longitud del arreglo, cambia los valores del elemento y el elemento
        // en el arreglo
        CambioDeVariables(elemento, arreglo[i]);
    FinPara
    Si longitud < 10 Entonces
        // Dijimos que el maximo del arreglo es 10, por lo que no puede crecer mas que eso.
        // Si es menor a 10, aumenta la longitud e inserta al final del arreglo
        longitud ← longitud + 1;
        arreglo[longitud] ← elemento;
    FinSi         
    // De lo contrario, el valor que teniamos se pierde al no caber en el arreglo.
FinProcedimiento

// Lee un arreglo y devuelve la longitud
Funcion LeerArreglo(arreglo): Entero
    // arreglo: arreglo a leer
    Definir longitud Como Entero;
    Escribir "Introduce longitud del arreglo (max 10):";
    Leer longitud;
    // asegura la longitud maximo 10
    longitud ← Menor(longitud, 10);
    Para i ← 1 Hasta longitud Hacer
        Leer arreglo[i];
    FinPara
    Retornar longitud;
FinFuncion

// Recibe un arreglo y lo muestra
Procedimiento MostrarArreglo(arreglo, longitud como Entero)
    // arreglo: arreglo a mostrar.
    // longitud: longitud actual del arreglo.
    Para i ← 1 Hasta longitud Hacer
        Escribir 'arr[', i,']: ', arreglo[i];
    FinPara
FinProcedimiento

// Busca un elemento en un arreglo y devuelve la posicion donde se encuentra. -1 si el elemento no esta en el arreglo
Funcion Buscar(arreglo, elemento como Entero, longitud como Entero): Entero
    // arreglo: arreglo con los elementos a buscar
    // elemento: elemento a buscar
    // longitud: longitud actual del arreglo
    Para i ← 1 Hasta longitud Con Paso 1 Hacer
        Si arreglo[i] = elemento Entonces
            // Se encontro el elemento, retorna su posicion
            Retornar i;
        FinSi
    FinPara
    // Al no retornar, no se encontro
    Retornar -1;
FinFuncion


// Elimina un elemento en determinada posicion
Procedimiento Eliminar(arreglo, posicion como Entero, longitud como Entero por Referencia)
    // arreglo: Arreglo en el que se quiere insertar un elemento
    // posicion: Posicion que se quiere eliminar
    // longitud: Longitud del arreglo actual
    Para i ← posicion Hasta longitud - 1 Hacer
        arreglo[i] ← arreglo[i + 1];
    FinPara
    longitud ← longitud - 1;
FinProcedimiento

// Elimina un elemento de un arreglo
Procedimiento EliminarElemento(arreglo, elemento como Entero, longitud como Entero por Referencia)
    // arreglo: Arreglo en el que se quiere insertar un elemento
    // elemento: Elemento a eliminar
    // longitud: Longitud del arreglo actual
    Eliminar(arreglo, Buscar(arreglo, elemento, longitud), longitud)
FinProcedimiento

// Proceso de pruebas
Proceso Pruebas
    Definir arreglo, longitud Como Entero;
    Definir opcion Como Entero;
    Dimension arreglo[10];
    longitud ← LeerArreglo(arreglo);
    Repetir
        Escribir "El arreglo es";
        MostrarArreglo(arreglo, longitud)
        Escribir 'Introduce opcion: ';
        Escribir '    [1]: Insertar elemento';
        Escribir '    [2]: Eliminar elemento';
        Escribir '    [3]: Buscar elemento';
        Escribir '    [0]: Salir';
        Leer opcion;
        Segun opcion Hacer
            1:
                ProgramaInsertar(arreglo, longitud);
            2:
                ProgramaEliminar(arreglo, longitud);
            3:
                ProgramaBuscar(arreglo, longitud)
        FinSegun
    Hasta Que opcion = 0;
FinProceso

Procedimiento ProgramaInsertar(arreglo, longitud como Entero por Referencia)
    Definir elemento, posicion Como Entero;
    Escribir "Introduce elemento a insertar: ";
    Leer elemento;
    Escribir "Introduce posicion a insertar: ";
    Leer posicion;
    Insertar(arreglo, elemento, posicion, longitud);
FinProcedimiento

Procedimiento ProgramaEliminar(arreglo, longitud como Entero por Referencia)
    Definir elemento Como Entero;
    Escribir "Introduce elemento a eliminar: ";
    Leer elemento;
    EliminarElemento(arreglo, elemento, longitud);
FinProcedimiento

Procedimiento ProgramaBuscar(arreglo, longitud como Entero por Referencia)
    Definir elemento Como Entero;
    Escribir "Introduce elemento a buscar: ";
    Leer elemento;
    Escribir "El elemento esta en la posicion: ", Buscar(arreglo, elemento, longitud);;
FinProcedimiento`

export const insertInputs = [
  3, // array length,
  1, // array[1]
  2, // array[2]
  3, // array[3]
  1, // option 1
  4, // element to insert
  1, // position to insert
  0, // option 0
]

export const deleteInputs = [
  4, // array length,
  1, // array[1]
  2, // array[2]
  3, // array[3]
  4, // array[4]
  2, // option 2
  2, // element to delete
  0, // option 0
]

export const searchInputs = [
  4, // array length,
  1, // array[1]
  2, // array[2]
  3, // array[3]
  4, // array[4]
  3, // option 3
  2, // element to search
  0, // option 0
]