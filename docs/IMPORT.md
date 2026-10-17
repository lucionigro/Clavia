# Importar una partitura y generar la guía

1. Abrí **Repertorio → Importar partitura**.
2. Elegí MusicXML, MXL o MIDI. Hay una partitura de ejemplo original para probar el recorrido sin conseguir otro archivo.
3. Revisá título, compositor y cada pentagrama/pista. MusicXML sugiere derecha para el pentagrama 1 e izquierda para el 2; verificá cruces o partes adicionales.
4. Elegí un pasaje de hasta 128 compases. En MIDI podés cuantizar a corcheas o semicorcheas. MusicXML conserva las duraciones escritas compatibles.
5. **Revisar la guía** muestra la notación antes de guardarla. Si sale de tu registro, seleccioná otros compases o elegí explícitamente transportar una octava.
6. **Guardar y practicar** crea la partitura y el teclado animado: escuchar, una mano, la otra y después ambas. Ajustá tempo y ayudas en el entrenador.

## MusicXML y MXL

Se admite `score-partwise` con voces, acordes, silencios, backup/forward, pentagramas, ligaduras, alturas y digitaciones numéricas escritas. El lector conserva sostenidos/bemoles, puntillos, semicorcheas y tresillos 3:2. La notación usa una rejilla de 1/24 de negra. Se admiten compases constantes 2/4, 3/4, 4/4, 6/8, 9/8 y 12/8; el tempo del entrenador se expresa en negras, también en los compases compuestos.

Se rechazan cambios de compás, transposición de instrumento no resuelta, duraciones incompatibles, partes sin altura y datos que exceden los límites. Las repeticiones y saltos se leen una sola vez, en orden escrito; para una guía completa exportá una versión desplegada. Las notas de adorno se omiten con aviso. El pedal, dinámica y grabado original no se reproducen en todos sus detalles. La anacrusa se ubica al final del primer compás, con silencios de preparación al inicio; revisá esa entrada.

Desde MuseScore: **Archivo → Exportar → MusicXML**. [Documentación de MuseScore](https://handbook.musescore.org/file-management/working-with-musicxml-files). El formato está documentado por el [W3C MusicXML Community Group](https://www.w3.org/2021/06/musicxml40/).

## PDF y fotos

El reconocimiento óptico de música puede confundir voces, alteraciones o ritmos. Clavia no inventa notas desde una página. Convertí con [Audiveris](https://audiveris.github.io/audiveris/_pages/handbook/), revisá y corregí el resultado en un editor y exportá MusicXML. Ese proceso es independiente; Clavia no envía el PDF a un servicio.

## MIDI

Se admite SMF tipo 0/1, PPQ y los mismos compases constantes. Se excluye el canal de percusión. Elegí solo las pistas del piano; notas iguales superpuestas o archivos sin liberaciones se rechazan. El archivo puede tener varios instrumentos: la aplicación no sabe por el nombre cuál querés tocar. La división por Do4 es solo una ayuda por altura y no identifica las manos físicas.

La práctica usa tempo fijo. Pedal, expresión y variaciones de tempo no se evalúan como parte de una edición completa; los cambios de tempo se advierten. La cuantización puede modificar un MIDI interpretado libremente. Para una guía fiel a lo escrito, preferí MusicXML y revisá siempre el resultado.

## Límites y guardado

MusicXML/MXL: 8 MB de entrada; el archivo comprimido tiene límites previos de tamaño/entradas descomprimidas. MIDI: 2 MB. Cada arreglo: hasta 128 compases y 5.000 notas dentro del rango MIDI 21–108. Copias JSON: 20 MB y hasta 100 arreglos por restauración. Se rechazan entidades XML y no se resuelven DTD externos.

Los arreglos se guardan localmente en IndexedDB. La copia de repertorio conserva las adaptaciones de Clavia; la copia completa agrega avances, perfil y diario. Importá y compartí únicamente archivos que tengas derecho a usar. El catálogo comercial no contiene las partituras de esos temas.
