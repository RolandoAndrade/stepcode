export const additionProgram = `SubProceso Ordenar(n1 Por Referencia, n2 Por Referencia)
\tDefinir aux como Cadena;
\tSi Longitud(n1) < Longitud(n2) Entonces
\t\taux ← n1;
\t\tn1 ← n2;
\t\tn2 ← aux;
\tFinSi
FinSubProceso

Funcion strInvertida ← InvertirCadena(str)
    Definir strInvertida Como Cadena;
    Definir i Como Entero;
    strInvertida ← "";
    Para i ← 1 Hasta Longitud(str) Con Paso 1 Hacer
        strInvertida ← str[i] + strInvertida;
    FinPara
FinFuncion

Proceso SumarComoPrimaria
\tDefinir n1, n2, resultado como Cadena;
\tDefinir i, suma, acarreo como Entero;
\tEscribir 'n1';
\tLeer n1;
\tEscribir 'n2';
\tLeer n2;
\tOrdenar(n1, n2);
    n1 ← InvertirCadena(n1);
\tn2 ← InvertirCadena(n2);
\tresultado ← '';
    acarreo ← 0;
\tsuma ← 0;
\tPara i ← 1 Hasta Longitud(n2) Con Paso 1 Hacer
\t    suma ← ConvertirANumero(n1[i]) + ConvertirANumero(n2[i]) + acarreo;
        acarreo ← suma div 10;
        suma ← suma mod 10;
        resultado ← ConvertirATexto(suma) + resultado;
\tFinPara
    Para i ← Longitud(n2) + 1 Hasta Longitud(n1) Con Paso 1 Hacer
\t    suma ← ConvertirANumero(n1[i]) + acarreo;
        acarreo ← suma div 10;
        suma ← suma mod 10;
        resultado ← ConvertirATexto(suma) + resultado;
    FinPara
    Si acarreo > 0 Entonces
        resultado ← ConvertirATexto(acarreo) + resultado;
    FinSi
    Escribir resultado;
FinProceso
`