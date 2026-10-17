import { advancedLessons } from "./advanced-curriculum.js";
import { pieces } from "./repertoire.js";
// Contenido original en español. MIDI 60 = Do4 central.
export const levels = [
  {
    name: "Primeros pasos",
    tag: "PRINCIPIANTE",
    description: "Conocé tu instrumento y empezá a hacer música.",
    color: "sage",
  },
  {
    name: "Las bases musicales",
    tag: "INICIAL",
    description: "Leé, escuchá y conectá las dos manos.",
    color: "sand",
  },
  {
    name: "Tu lenguaje musical",
    tag: "INTERMEDIO",
    description: "Construí acordes, acompañamientos y expresión.",
    color: "lavender",
  },
  {
    name: "Tocá con libertad",
    tag: "AVANZADO",
    description: "Armonía, improvisación e interpretación consciente.",
    color: "rose",
  },
];
const lesson = (
  id,
  level,
  title,
  subtitle,
  minutes,
  topics,
  steps,
  practice,
  question,
  options,
  answer,
  challenge,
) => ({
  id,
  level,
  title,
  subtitle,
  minutes,
  topics,
  steps,
  practice,
  question,
  options,
  answer,
  challenge,
});
export const lessons = [
  lesson(
    "postura",
    0,
    "Tu primer encuentro con el teclado",
    "Un buen comienzo se siente cómodo.",
    8,
    ["Postura", "Digitación"],
    [
      [
        "Prepará tu espacio",
        "Ubicá el asiento frente al centro del teclado. Los pies tienen apoyo y los antebrazos quedan aproximadamente a la altura de las teclas. Acercate lo suficiente para no estirar los brazos.",
      ],
      [
        "Manos listas",
        "Dejá caer los brazos y recuperá esa curva natural de los dedos sobre las teclas. Evitá hundir las muñecas o levantar los hombros. Usá el peso del brazo sin golpear. Practicá suave y hacé pausas.",
      ],
      [
        "Tus dedos tienen un número",
        "En ambas manos: pulgar 1, índice 2, medio 3, anular 4 y meñique 5. Poné la derecha sobre Do–Re–Mi–Fa–Sol con dedos 1–2–3–4–5. No hace falta mantener tensos los dedos que no tocan.",
      ],
    ],
    {
      type: "sequence",
      notes: [60, 62, 64, 65, 67],
      fingers: "MD: 1 · 2 · 3 · 4 · 5",
    },
    "¿Qué número corresponde al pulgar?",
    ["1 en ambas manos", "5 en la izquierda", "2 en ambas manos"],
    0,
    "En tu instrumento: tocá cinco notas suaves, soltando la tensión entre cada una. La app no evalúa postura; observá tus hombros y muñecas.",
  ),
  lesson(
    "mapa",
    0,
    "Encontrá tu Do",
    "El mapa se repite en todo el teclado.",
    10,
    ["Notas", "Orientación"],
    [
      [
        "Grupos de dos y tres",
        "Las teclas negras forman grupos de dos y tres. Do es la tecla blanca inmediatamente a la izquierda de cada grupo de dos negras. Fa está a la izquierda del grupo de tres.",
      ],
      [
        "Siete nombres",
        "De izquierda a derecha las blancas se llaman Do, Re, Mi, Fa, Sol, La y Si. Después de Si vuelve Do, una octava más aguda. Hacia la derecha el sonido sube; hacia la izquierda baja.",
      ],
      [
        "Do central",
        "Acá usamos la convención Do4 = MIDI 60 para el Do central. Algunos fabricantes numeran las octavas de otra manera: guiáte por la altura y los grupos de negras. C D E F G A B equivalen a Do Re Mi Fa Sol La Si.",
      ],
    ],
    { type: "sequence", notes: [60, 65, 60, 67, 60, 72] },
    "¿Dónde encontrás Do?",
    [
      "A la izquierda de dos negras",
      "A la derecha de tres negras",
      "Entre dos teclas negras",
    ],
    0,
    "Buscá todos los Do de tu teclado real sin contar desde un extremo.",
  ),
  lesson(
    "pulso",
    0,
    "El pulso de la música",
    "Encontrá un latido y sostenelo.",
    10,
    ["Pulso", "Ritmo"],
    [
      [
        "Pulso y ritmo",
        "El pulso es la referencia regular que podés marcar con el pie. El ritmo combina sonidos y silencios alrededor de ese pulso. No aceleres cuando algo se vuelve fácil.",
      ],
      [
        "Qué significa BPM",
        "60 BPM son 60 pulsos por minuto: uno por segundo. Empezá a 60. Escuchá cuatro clics antes de tocar y contá 1, 2, 3, 4.",
      ],
      [
        "Primero una nota",
        "Tocá Do una vez por clic. Soltá antes del próximo ataque. Después hacé un compás tocando y otro contando en silencio. El pulso sigue aunque no haya notas.",
      ],
    ],
    { type: "rhythm", beats: 8 },
    "A 60 BPM, ¿cuánto dura un pulso?",
    ["Un segundo", "Medio segundo", "Dos segundos"],
    0,
    "Mantené ocho pulsos parejos. La práctica mide la regularidad de tus ataques, después de una cuenta de entrada.",
  ),
  lesson(
    "cinco",
    0,
    "Tus primeras cinco notas",
    "Una pequeña melodía, una gran primera vez.",
    12,
    ["Coordinación", "Melodía"],
    [
      [
        "Una posición estable",
        "Apoyá 1–2–3–4–5 de la derecha sobre Do–Re–Mi–Fa–Sol. Mirá la próxima nota antes de tocarla. Mové un dedo por vez sin inmovilizar rígidamente la mano.",
      ],
      [
        "Subí y bajá",
        "Tocá Do Re Mi Fa Sol y regresá Fa Mi Re Do. Empezá lento. Escuchá que cada nota tenga un volumen parecido.",
      ],
      [
        "Conectá los sonidos",
        "Para un legato básico soltá una tecla cuando entra la siguiente. Contrastá con notas separadas y cortas. El teclado virtual verifica orden; el sonido y la continuidad se trabajan escuchando.",
      ],
    ],
    {
      type: "sequence",
      notes: [60, 62, 64, 65, 67, 65, 64, 62, 60],
      fingers: "MD: 1–2–3–4–5–4–3–2–1",
    },
    "Al subir Do–Re–Mi–Fa–Sol con la derecha, ¿qué dedo toca Sol?",
    ["5", "1", "3"],
    0,
    "Hacé tres repeticiones lentas, parejas y sin mirar constantemente tus manos.",
  ),
  lesson(
    "izquierda",
    0,
    "Dale lugar a la mano izquierda",
    "La otra mitad de tu sonido.",
    12,
    ["Mano izquierda", "Independencia"],
    [
      [
        "La numeración no cambia",
        "El pulgar izquierdo sigue siendo 1. En Do–Re–Mi–Fa–Sol ascendentes la izquierda usa 5–4–3–2–1. Es el espejo de la posición de la derecha.",
      ],
      [
        "Tocá y escuchá",
        "Practicá una mano por vez. Después alterná: izquierda Do–Re–Mi; derecha Do–Re–Mi una octava arriba. No busques velocidad.",
      ],
      [
        "Uní las manos",
        "En tu instrumento, tocá Do grave con la izquierda mientras la derecha toca Mi y después Sol. Contá en voz alta y mantené el bajo sin apretarlo más de lo necesario.",
      ],
    ],
    {
      type: "sequence",
      notes: [48, 50, 52, 53, 55, 53, 52, 50, 48],
      fingers: "MI: 5–4–3–2–1–2–3–4–5",
    },
    "¿Qué dedo usa la izquierda en Do en esta posición?",
    ["5", "1", "2"],
    0,
    "En el teclado físico, sostené Do con la izquierda durante cuatro pulsos y tocá Do–Re–Mi–Re con la derecha.",
  ),
  lesson(
    "figuras",
    0,
    "Negras, blancas y silencios",
    "La duración también cuenta.",
    12,
    ["Duración", "Compás"],
    [
      [
        "Unidades de tiempo",
        "Cuando la negra vale un pulso, la blanca dura dos y la redonda cuatro. Dos corcheas ocupan el tiempo de una negra. El tempo determina la duración en segundos.",
      ],
      [
        "El compás de 4/4",
        "El número de arriba indica cuatro tiempos por compás; el de abajo toma la negra como unidad. Contá 1 2 3 4 y destacá suavemente el primer tiempo.",
      ],
      [
        "El silencio tiene valor",
        "Durante un silencio no se toca, pero se sigue contando. Probá: Do dos pulsos, silencio de un pulso, Sol un pulso. Repetí sin detenerte entre compases.",
      ],
    ],
    { type: "rhythm", beats: 8 },
    "Si la negra vale un pulso, ¿cuánto dura la blanca?",
    ["2 pulsos", "4 pulsos", "Medio pulso"],
    0,
    "Tocá en tu teclado dos blancas y luego cuatro negras, en dos compases de 4/4.",
  ),
  lesson(
    "primera-melodia",
    0,
    "Una melodía de principio a fin",
    "Pequeño estudio original en Do.",
    15,
    ["Repertorio", "Fraseo"],
    [
      [
        "Leé antes de tocar",
        "Este estudio usa Do Re Mi y Sol. Dividilo en dos frases: Do–Re–Mi–Sol / Mi–Re–Do. Cantá los nombres antes de usar el teclado.",
      ],
      [
        "Armá cada frase",
        "Tocá la primera frase tres veces a tempo lento. Hacé lo mismo con la segunda. Después unilas dejando respirar la última nota.",
      ],
      [
        "Dale una intención",
        "Empezá suave, crecé hacia Sol y terminá con calma. En tu instrumento, hacé las seis primeras notas como negras y el Do final como blanca.",
      ],
    ],
    { type: "sequence", notes: [60, 62, 64, 67, 64, 62, 60] },
    "¿Qué conviene hacer frente a una frase difícil?",
    [
      "Separarla y practicarla lento",
      "Repetir todo cada vez más rápido",
      "Saltar las notas difíciles",
    ],
    0,
    "Tocá el estudio tres veces sin interrupciones a 60 BPM. La práctica automática evalúa las alturas en orden.",
  ),
  lesson(
    "semitonos",
    0,
    "Las teclas negras también son tuyas",
    "Sostenidos, bemoles y distancias.",
    12,
    ["Alteraciones", "Intervalos"],
    [
      [
        "La distancia más pequeña",
        "Un semitono es la distancia entre dos teclas contiguas, sean blancas o negras. Mi–Fa y Si–Do ya están a un semitono. Un tono equivale a dos semitonos.",
      ],
      [
        "Sostenido y bemol",
        "♯ sube una nota un semitono; ♭ la baja. Do♯ y Re♭ pueden sonar igual en el teclado de afinación temperada aunque se escriban distinto según el contexto. El becuadro ♮ anula una alteración.",
      ],
      [
        "Escala cromática",
        "Recorré todas las teclas entre Do y el siguiente Do. Usá lentamente 1 y 3 para empezar y buscá una digitación cromática completa más adelante; no confundas esto con la escala mayor.",
      ],
    ],
    {
      type: "sequence",
      notes: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72],
    },
    "¿Qué distancia hay entre Mi y Fa?",
    ["Un semitono", "Un tono", "Una tercera"],
    0,
    "Encontrá Fa♯, Si♭ y Mi♭ en varias zonas del teclado.",
  ),
  lesson(
    "sol",
    1,
    "Leé la clave de Sol",
    "La música también se puede ver.",
    15,
    ["Lectura", "Pentagrama"],
    [
      [
        "Cinco líneas, cuatro espacios",
        "El pentagrama se lee de abajo hacia arriba. En clave de Sol las líneas son Mi4, Sol4, Si4, Re5, Fa5; los espacios son Fa4, La4, Do5, Mi5.",
      ],
      [
        "La referencia de Sol",
        "La clave rodea la segunda línea: ahí está Sol4. El Do central se escribe debajo del pentagrama con una pequeña línea adicional.",
      ],
      [
        "Leé relaciones",
        "En vez de nombrar cada nota aislada, observá si la melodía sube, baja, repite o salta. Practicá pocas notas y conservá el pulso. En el ejercicio tocá la nota dibujada.",
      ],
    ],
    { type: "reading", notes: [64, 67, 71, 65, 69, 72, 60] },
    "¿Qué nota está en la segunda línea en clave de Sol?",
    ["Sol4", "Do4", "Fa4"],
    0,
    "Dibujá un pentagrama y escribí Do4–Re4–Mi4–Fa4–Sol4 con sus líneas y espacios.",
  ),
  lesson(
    "fa",
    1,
    "Leé la clave de Fa",
    "Un mapa para los sonidos graves.",
    15,
    ["Lectura", "Bajos"],
    [
      [
        "La referencia de Fa",
        "Los dos puntos de la clave de Fa enmarcan la cuarta línea: Fa3. Las líneas de abajo hacia arriba son Sol2, Si2, Re3, Fa3, La3.",
      ],
      [
        "Los espacios",
        "Los espacios son La2, Do3, Mi3 y Sol3. El Do central queda por encima del pentagrama, sobre una línea adicional.",
      ],
      [
        "Dos pentagramas",
        "La partitura de piano suele unir clave de Sol y clave de Fa. Es una distribución frecuente para derecha e izquierda, pero la clave indica registro, no obliga a usar una mano específica.",
      ],
    ],
    { type: "reading", clef: "bass", notes: [43, 47, 50, 53, 57, 48, 52, 55] },
    "¿Qué línea señala la clave de Fa?",
    ["La cuarta", "La segunda", "La primera"],
    0,
    "En tu instrumento, tocá Do3–Mi3–Sol3 con la izquierda sin perder la posición.",
  ),
  lesson(
    "escala-do",
    1,
    "La escala de Do mayor",
    "Ocho notas, un recorrido completo.",
    18,
    ["Escalas", "Paso del pulgar"],
    [
      [
        "El patrón mayor",
        "La escala mayor sigue tono–tono–semitono–tono–tono–tono–semitono. En Do: Do Re Mi Fa Sol La Si Do.",
      ],
      [
        "Derecha e izquierda",
        "Derecha ascendente: 1–2–3–1–2–3–4–5. Izquierda ascendente: 5–4–3–2–1–3–2–1. En el descenso se invierte cada secuencia. Prepará el cambio con un movimiento pequeño y libre.",
      ],
      [
        "Trabajá la unión",
        "Aislá Mi–Fa en la derecha: 3–1. En la izquierda, Sol–La: 1–3. No gires bruscamente el codo. Hacé una octava con cada mano antes de juntarlas.",
      ],
    ],
    {
      type: "sequence",
      notes: [60, 62, 64, 65, 67, 69, 71, 72, 71, 69, 67, 65, 64, 62, 60],
      fingers: "MD sube: 1 2 3 1 2 3 4 5",
    },
    "¿Entre qué grados de una escala mayor están los semitonos?",
    ["3–4 y 7–8", "1–2 y 5–6", "2–3 y 6–7"],
    0,
    "Practicá cada mano a 60 BPM, una nota por pulso; después juntalas a distancia de una octava.",
  ),
  lesson(
    "intervalos",
    1,
    "Escuchá las distancias",
    "El oído se entrena de a poco.",
    15,
    ["Oído", "Intervalos"],
    [
      [
        "Nombrá la distancia",
        "Un intervalo se cuenta incluyendo las dos notas: Do–Mi es una tercera; Do–Sol una quinta. La calidad depende de los semitonos: tercera mayor 4, menor 3; quinta justa 7.",
      ],
      [
        "Melódico y armónico",
        "Cuando las notas suenan una después de otra el intervalo es melódico; al mismo tiempo es armónico. Cantá la primera nota y tratá de anticipar la segunda.",
      ],
      [
        "Compará antes de adivinar",
        "Escuchá varias veces sin mirar el teclado. En el laboratorio de oído podés practicar segundas mayores, terceras mayores, quintas justas y octavas.",
      ],
    ],
    { type: "ear" },
    "¿Cuántos semitonos tiene una quinta justa?",
    ["7", "5", "4"],
    0,
    "Escuchá, cantá y después comprobá cada intervalo en tu teclado.",
  ),
  lesson(
    "triadas",
    1,
    "Tus primeros acordes",
    "Tres notas que suenan juntas.",
    18,
    ["Armonía", "Tríadas"],
    [
      [
        "Apilá terceras",
        "Una tríada tiene fundamental, tercera y quinta. Do mayor es Do–Mi–Sol. En estado fundamental, la fundamental es la nota más grave.",
      ],
      [
        "Mayor y menor",
        "Una tríada mayor tiene 4 y 7 semitonos desde la fundamental; una menor tiene 3 y 7. Do menor es Do–Mi♭–Sol. Cambiar la tercera cambia su cualidad.",
      ],
      [
        "Sonido equilibrado",
        "Probá 1–3–5 en la derecha. Presioná las tres teclas juntas sin endurecer la mano. En la práctica visual sostené las tres notas a la vez con tu teclado MIDI, la computadora o una pantalla multitáctil. Con mouse podés escuchar y estudiar el acorde.",
      ],
    ],
    { type: "chord", notes: [60, 64, 67] },
    "¿Qué nota cambia entre Do mayor y Do menor?",
    [
      "La tercera: Mi pasa a Mi♭",
      "La quinta: Sol pasa a Fa",
      "La fundamental: Do pasa a Re",
    ],
    0,
    "Alterná Do mayor y Do menor; escuchá el color de cada uno.",
  ),
  lesson(
    "manos",
    1,
    "Dos manos, una sola música",
    "Bajo estable y melodía libre.",
    20,
    ["Coordinación", "Práctica"],
    [
      [
        "Dividí el trabajo",
        "Izquierda: Do3 sostenido cuatro tiempos. Derecha: Do4–Re4–Mi4–Sol4, una negra por tiempo. Aprendé cada parte antes de combinarlas.",
      ],
      [
        "Puntos de encuentro",
        "Marcá dónde atacan juntas las manos: al comienzo de cada compás. Después la izquierda sostiene mientras la derecha se mueve. Contá lentamente en voz alta.",
      ],
      [
        "Reducí la dificultad",
        "Si perdés el pulso, hacé solo el primer tiempo de cada compás. Sumá después la segunda nota y así hasta completar. Dos compases fluidos enseñan más que diez trabados.",
      ],
    ],
    { type: "sequence", notes: [48, 60, 62, 64, 67, 53, 65, 64, 62, 60] },
    "¿Cómo conviene comenzar una coordinación nueva?",
    [
      "Aprendiendo cada mano por separado",
      "Tocando lo más rápido posible",
      "Agregando pedal desde el principio",
    ],
    0,
    "La secuencia guiada alterna las partes para aprenderlas; completá luego el ejercicio simultáneo en tu instrumento, 4 compases a 50 BPM.",
  ),
  lesson(
    "corcheas",
    1,
    "Dividí el pulso",
    "Corcheas, acentos y compases.",
    15,
    ["Subdivisión", "6/8"],
    [
      [
        "Dos por pulso",
        "En 4/4 contá 1 y 2 y 3 y 4 y. Cada sílaba es una corchea. Mantené iguales las dos mitades y acentuá el número sin apurar la “y”.",
      ],
      [
        "Otros compases",
        "En 3/4 hay tres pulsos de negra. En 6/8 se suelen sentir dos pulsos de negra con puntillo, cada uno dividido en tres corcheas: 1-la-li 2-la-li. No es lo mismo que 3/4.",
      ],
      [
        "Puntillo y ligadura",
        "El puntillo agrega la mitad del valor original: una negra con puntillo equivale a tres corcheas. La ligadura de prolongación suma valores de notas de la misma altura.",
      ],
    ],
    { type: "rhythm", beats: 12 },
    "¿Cuántas corcheas equivalen a una negra con puntillo?",
    ["3", "2", "4"],
    0,
    "El entrenador trabaja pulsos regulares. En tu instrumento alterná un compás con negras y otro con dos corcheas por pulso.",
  ),
  lesson(
    "estudio-inicial",
    1,
    "Tu primer pequeño concierto",
    "Un estudio original con acompañamiento.",
    20,
    ["Repertorio", "Integración"],
    [
      [
        "La estructura",
        "Cuatro compases de 4/4: C | Am | F | G. Las letras representan Do mayor, La menor, Fa mayor y Sol mayor. Izquierda toca la fundamental al inicio de cada compás.",
      ],
      [
        "La melodía",
        "Derecha: Mi–Sol–Mi–Do | Mi–La–Sol–Mi | Fa–La–Fa–Do | Re–Sol–Si–Sol. Cada nota dura una negra. Aprendé de a un compás.",
      ],
      [
        "Prepará la interpretación",
        "A 50 BPM uní dos compases, luego cuatro. Grabate y escuchá si el pulso se sostiene. Al terminar volvé a Do para sentir el reposo.",
      ],
    ],
    {
      type: "sequence",
      notes: [64, 67, 64, 60, 64, 69, 67, 64, 65, 69, 65, 60, 62, 67, 71, 67],
    },
    "¿Qué acorde representa Am?",
    ["La menor", "La mayor", "Mi menor"],
    0,
    "Combiná la melodía con los bajos Do3–La2–Fa2–Sol2 en tu instrumento. Buscá tres vueltas fluidas.",
  ),
  lesson(
    "tonalidades",
    2,
    "Más allá de Do mayor",
    "Escalas, armaduras y transposición.",
    20,
    ["Tonalidad", "Escalas"],
    [
      [
        "Conservá el patrón",
        "La escala mayor mantiene T–T–S–T–T–T–S desde cualquier nota. Sol mayor necesita Fa♯; Fa mayor necesita Si♭. No alcanza con empezar en otra blanca.",
      ],
      [
        "Armaduras",
        "Los sostenidos se agregan en orden Fa Do Sol Re La Mi Si; los bemoles en orden Si Mi La Re Sol Do Fa. La armadura afecta esas notas en todas las octavas salvo alteración local.",
      ],
      [
        "Transportá una frase",
        "Do–Re–Mi en Do se vuelve Sol–La–Si en Sol. Conservá las distancias y la función de cada grado. Trabajá una tonalidad a la vez y anotá sus alteraciones.",
      ],
    ],
    { type: "sequence", notes: [67, 69, 71, 72, 74, 76, 78, 79] },
    "¿Qué alteración tiene Sol mayor?",
    ["Fa♯", "Si♭", "Do♯"],
    0,
    "En tu teclado tocá escalas de Do, Sol y Fa, y transportá la primera melodía a Sol.",
  ),
  lesson(
    "menores",
    2,
    "El mundo de las escalas menores",
    "Tres formas, distintos colores.",
    20,
    ["Escalas menores", "Tonalidad"],
    [
      [
        "Menor natural",
        "La menor natural usa La Si Do Re Mi Fa Sol La. Comparte notas con Do mayor: son tonalidades relativas. Su patrón es T–S–T–T–S–T–T.",
      ],
      [
        "Menor armónica",
        "Elevá el séptimo grado: Sol♯ en La menor. Eso crea una sensible que tiende a La y permite un acorde de Mi mayor como dominante.",
      ],
      [
        "Menor melódica",
        "En el enfoque clásico asciende con sexto y séptimo elevados, y suele descender natural. En jazz se usa frecuentemente la misma forma elevada en ambos sentidos. El contexto decide.",
      ],
    ],
    { type: "sequence", notes: [57, 59, 60, 62, 64, 65, 68, 69] },
    "¿Qué nota distingue La menor armónica de La menor natural?",
    ["Sol♯", "Fa♯", "Do♯"],
    0,
    "Compará las tres formas de La menor cantando los grados que cambian.",
  ),
  lesson(
    "inversiones",
    2,
    "Acordes que se mueven menos",
    "Inversiones y conducción de voces.",
    18,
    ["Inversiones", "Armonía"],
    [
      [
        "Cambiá el bajo",
        "Do–Mi–Sol es estado fundamental; Mi–Sol–Do es primera inversión; Sol–Do–Mi es segunda inversión. Las notas del acorde son las mismas, cambia la más grave.",
      ],
      [
        "Conectá voces cercanas",
        "Para ir de C a F podés mover Do–Mi–Sol hacia Do–Fa–La. Do se queda, Mi sube a Fa y Sol sube a La. No hace falta saltar con toda la mano.",
      ],
      [
        "Escuchá cada línea",
        "Probá C–Am–F–G en posiciones cercanas. Tocá despacio y seguí una voz con el oído. Las inversiones sirven al sonido y al movimiento de la música.",
      ],
    ],
    { type: "chord", notes: [64, 67, 72] },
    "Mi–Sol–Do es Do mayor en…",
    ["Primera inversión", "Segunda inversión", "Estado fundamental"],
    0,
    "Tocá C–F–G–C buscando el mínimo movimiento de cada dedo.",
  ),
  lesson(
    "funciones",
    2,
    "Entendé hacia dónde va la música",
    "Tónica, preparación y dominante.",
    20,
    ["Funciones", "Cadencias"],
    [
      [
        "El centro tonal",
        "La tónica (I en mayor) se siente como llegada. En Do, C es I. La función predominante prepara el movimiento: F (IV) o Dm (ii) son ejemplos frecuentes.",
      ],
      [
        "La dominante",
        "G o G7 (V o V7) genera una tendencia hacia C. En G7 las notas Si y Fa tienden respectivamente a Do y Mi en una resolución habitual.",
      ],
      [
        "Reconocé cadencias",
        "V–I es una llegada auténtica; IV–I es plagal. Terminar en V deja una semicadencia abierta. Escuchá tensión y reposo antes de memorizar etiquetas.",
      ],
    ],
    {
      type: "sequence",
      notes: [60, 64, 67, 65, 69, 72, 67, 71, 74, 60, 64, 67],
    },
    "En Do mayor, ¿cuál es la dominante?",
    ["Sol (G)", "Fa (F)", "La menor (Am)"],
    0,
    "Tocá I–IV–V–I en Do y Sol; cantá la fundamental de cada acorde.",
  ),
  lesson(
    "arpegios",
    2,
    "Hacé fluir los acordes",
    "Patrones de acompañamiento.",
    20,
    ["Arpegios", "Acompañamiento"],
    [
      [
        "Acorde desplegado",
        "Un arpegio presenta las notas de un acorde una después de otra. En C: Do Mi Sol Do. Conservá la mano flexible y prepará el desplazamiento.",
      ],
      [
        "Patrones útiles",
        "Probá fundamental–quinta–tercera–quinta con la izquierda. Un bajo Alberti usa grave–agudo–medio–agudo, por ejemplo Do–Sol–Mi–Sol.",
      ],
      [
        "Elegí la textura",
        "No llenes todos los espacios. Si la melodía se mueve mucho, simplificá el acompañamiento. Mantené el bajo más suave para que se entienda la melodía.",
      ],
    ],
    {
      type: "sequence",
      notes: [48, 55, 52, 55, 45, 52, 48, 52, 41, 48, 45, 48, 43, 50, 47, 50],
    },
    "¿Cuál es un bajo Alberti sobre Do mayor?",
    ["Do–Sol–Mi–Sol", "Do–Re–Mi–Fa", "Do–Do–Do–Do"],
    0,
    "Usá este patrón en C–Am–F–G a 50 BPM y sumá una melodía sencilla con la derecha.",
  ),
  lesson(
    "expresion",
    2,
    "Dale intención a cada frase",
    "Dinámica, articulación y pedal.",
    18,
    ["Expresión", "Pedal"],
    [
      [
        "El volumen dibuja la frase",
        "p indica suave y f fuerte; crescendo crece y diminuendo disminuye. Pensá un punto de llegada por frase y graduá el peso hacia él.",
      ],
      [
        "Articulación",
        "Legato conecta, staccato separa. Una ligadura de expresión agrupa notas diferentes en una frase; no se confunde con la ligadura de prolongación entre alturas iguales.",
      ],
      [
        "Pedal con oído",
        "Primero aprendé sin pedal. Para cambiar de armonía, tocá el nuevo acorde, levantá el pedal anterior y bajalo de nuevo. Escuchá que no se mezclen armonías. En instrumentos sin pedal practicá la conexión con los dedos.",
      ],
    ],
    { type: "sequence", notes: [60, 64, 67, 72, 71, 67, 64, 60] },
    "¿Qué indica un crescendo?",
    [
      "Aumentar gradualmente la intensidad",
      "Acelerar siempre",
      "Tocar todas las notas cortas",
    ],
    0,
    "Tocá una frase dos veces: primero legato y suave; después staccato. El evaluador de notas no mide dinámica ni pedal.",
  ),
  lesson(
    "sincopa",
    2,
    "Jugá con los acentos",
    "Síncopa, contratiempo y groove.",
    20,
    ["Ritmo", "Síncopa"],
    [
      [
        "Acentos que sorprenden",
        "Una síncopa desplaza el acento hacia una parte débil y puede prolongarla sobre una fuerte. El contratiempo suele dejar silencio en la parte fuerte y sonar en la débil.",
      ],
      [
        "Contá subdivisiones",
        "Decí 1 y 2 y 3 y 4 y. Marcá el pulso con el pie y aplaudí solo las “y”. Después tocá Do en esas posiciones mientras mantenés el pulso interno.",
      ],
      [
        "Volvé a lo simple",
        "Grabá cuatro compases y escuchá si el tempo se mueve. Trabajá a velocidad baja. El entrenador de esta lección mide el pulso; la síncopa se aplica en tu instrumento.",
      ],
    ],
    { type: "rhythm", beats: 12 },
    "Para tocar un contratiempo de corcheas en 4/4, podés atacar…",
    [
      "En las “y” entre los pulsos",
      "Solo en el primer tiempo",
      "Sin referencia de pulso",
    ],
    0,
    "Tocá bajos en 1 y 3 y acordes en las “y” de 2 y 4; empezá con una mano por vez.",
  ),
  lesson(
    "pentatonica",
    2,
    "Empezá a improvisar",
    "Cinco notas y una idea propia.",
    20,
    ["Improvisación", "Pentatónica"],
    [
      [
        "Menos notas, más intención",
        "Do pentatónica mayor: Do Re Mi Sol La. La pentatónica menor: La Do Re Mi Sol. Comparten notas pero tienen centros y funciones diferentes.",
      ],
      [
        "Una pregunta y una respuesta",
        "Sobre un acorde de C, tocá una idea de dos o tres notas, dejá un silencio y respondé variándola. Repetir con intención da unidad.",
      ],
      [
        "Escuchá el acompañamiento",
        "En C–Am–F–G podés empezar con la pentatónica de Do, atendiendo a las notas de cada acorde. No todas las notas tienen la misma estabilidad en cada momento.",
      ],
    ],
    { type: "sequence", notes: [60, 62, 64, 67, 69, 67, 64, 62, 60] },
    "¿Qué notas tiene Do pentatónica mayor?",
    ["Do Re Mi Sol La", "Do Re Mi Fa Sol", "Do Mi♭ Fa Sol Si♭"],
    0,
    "Improvisá ocho compases con tres notas y silencios. Grabate y conservá una frase que te guste.",
  ),
  lesson(
    "septimas",
    2,
    "El color de las séptimas",
    "Más profundidad en cuatro notas.",
    22,
    ["Acordes de séptima", "Cifrado"],
    [
      [
        "Una tercera más",
        "Agregá otra tercera sobre la tríada. Cmaj7: Do Mi Sol Si; C7: Do Mi Sol Si♭; Cm7: Do Mi♭ Sol Si♭. La séptima mayor y la menor no son intercambiables.",
      ],
      [
        "Leé el cifrado",
        "maj7 indica tríada mayor y séptima mayor; 7 indica tríada mayor y séptima menor; m7 indica tríada menor y séptima menor. m7♭5 es semidisminuido.",
      ],
      [
        "Resolvé la tensión",
        "En G7–C, escuchá la resolución de Si hacia Do y Fa hacia Mi. Aislá esas dos voces antes de tocar acordes completos.",
      ],
    ],
    { type: "chord", notes: [60, 64, 67, 71] },
    "¿Qué notas forman Cmaj7?",
    ["Do Mi Sol Si", "Do Mi Sol Si♭", "Do Mi♭ Sol Si♭"],
    0,
    "Compará Cmaj7, C7 y Cm7. Después tocá Dm7–G7–Cmaj7 lentamente.",
  ),
  lesson(
    "tecnica-avanzada",
    3,
    "Técnica al servicio de la música",
    "Escalas largas, arpegios y control.",
    25,
    ["Técnica", "Digitación"],
    [
      [
        "Dos octavas de Do mayor",
        "Derecha ascendente: 1–2–3–1–2–3–4–1–2–3–1–2–3–4–5. En el Do intermedio usá 1 para seguir. Izquierda: 5–4–3–2–1–3–2–1–4–3–2–1–3–2–1. Memorizá la lógica y no solo la lista.",
      ],
      [
        "Arpegios más amplios",
        "En Do mayor, derecha ascendente de dos octavas: Do Mi Sol Do Mi Sol Do con 1–2–3–1–2–3–5. Aislá la unión Sol–Do y trasladá el brazo hacia la nueva posición; evitá estirar los dedos para alcanzar todo desde un punto fijo.",
      ],
      [
        "De precisión a velocidad",
        "Elegí un tempo cómodo, tres repeticiones con control y después un aumento pequeño. Variá ritmos y acentos sin tensión. Las digitaciones cambian con tonalidad, mano y contexto; definí una antes de aumentar velocidad. Trabajá octavas y notas dobles de forma gradual en tu instrumento, sin forzar la apertura.",
      ],
    ],
    {
      type: "sequence",
      notes: [60, 64, 67, 72, 76, 79, 84, 79, 76, 72, 67, 64, 60],
      fingers: "MD sube: 1–2–3–1–2–3–5",
    },
    "En la escala de Do mayor de dos octavas con la derecha, ¿qué dedo usa el Do intermedio al subir?",
    ["1 para continuar", "5 para terminar siempre", "4 por obligación"],
    0,
    "Tocá una escala y un arpegio de dos octavas con cada mano. Evaluá continuidad y relajación antes de subir el tempo.",
  ),
  lesson(
    "ii-v-i",
    3,
    "El camino ii–V–I",
    "Conectá la armonía con naturalidad.",
    25,
    ["Jazz", "Conducción"],
    [
      [
        "La progresión",
        "En Do mayor: Dm7–G7–Cmaj7. ii prepara, V genera tensión e I resuelve. Transportala por cuartas cuando puedas tocarla con comodidad.",
      ],
      [
        "Terceras y séptimas",
        "Sobre un bajo Re, tocá Fa–Do; sobre Sol, Fa–Si; sobre Do, Mi–Si. Estas voces guía definen gran parte de la cualidad y función de los acordes.",
      ],
      [
        "Construí de a capas",
        "Primero bajos, después voces guía, finalmente una melodía. Evitá agregar extensiones antes de poder escuchar la resolución de cada voz.",
      ],
    ],
    { type: "sequence", notes: [65, 72, 65, 71, 64, 71] },
    "¿Cuál es ii–V–I en Do mayor?",
    ["Dm7–G7–Cmaj7", "Cmaj7–Fmaj7–Am7", "Em7–Am7–Dm7"],
    0,
    "En el teclado real tocá bajos Re3–Sol2–Do3 y voces guía arriba; transportá luego a Fa.",
  ),
  lesson(
    "modos",
    3,
    "Explorá los modos",
    "El centro tonal cambia la escucha.",
    25,
    ["Modos", "Improvisación"],
    [
      [
        "Más que empezar en otra nota",
        "Los modos de la escala mayor son jónico, dórico, frigio, lidio, mixolidio, eólico y locrio. Para oírlos necesitás afirmar su centro, por ejemplo con un bajo sostenido.",
      ],
      [
        "Colores característicos",
        "Re dórico usa las notas de Do mayor sobre centro Re y tiene sexta mayor (Si). Sol mixolidio tiene séptima menor (Fa). Fa lidio tiene cuarta aumentada (Si).",
      ],
      [
        "Compará sobre el mismo centro",
        "Do jónico usa Fa; Do lidio usa Fa♯. Sostené Do y alterná ambas notas para oír la diferencia. Aplicá cada color según acorde, estilo y frase.",
      ],
    ],
    { type: "sequence", notes: [62, 64, 65, 67, 69, 71, 72, 74] },
    "¿Qué nota distingue Re dórico de Re menor natural?",
    ["Si natural en lugar de Si♭", "Fa♯ en lugar de Fa", "Do♯ en lugar de Do"],
    0,
    "Sostené Re en el bajo e improvisá con Re dórico. Hacé descansar las frases en Re.",
  ),
  lesson(
    "extensiones",
    3,
    "Acordes con más colores",
    "Novenas, oncenas y trecenas.",
    25,
    ["Extensiones", "Voicings"],
    [
      [
        "Notas por encima de la octava",
        "9, 11 y 13 corresponden a 2, 4 y 6 una octava arriba. En el cifrado extendido se entiende una estructura con séptima: C9 incluye Si♭; Cmaj9 incluye Si. Cadd9 no exige séptima.",
      ],
      [
        "Elegí qué voces tocar",
        "No necesitás tocar todas las notas. En conjunto, el bajo puede cubrir la fundamental; tercera y séptima suelen ser esenciales para definir el acorde. La quinta justa suele poder omitirse.",
      ],
      [
        "Evitá amontonar el grave",
        "Separá las voces bajas y usá las tensiones en un registro más claro. Escuchá los choques como decisiones de color, no como permisos automáticos de una escala.",
      ],
    ],
    { type: "chord", notes: [60, 64, 71, 74] },
    "¿Qué diferencia a C9 de Cadd9?",
    [
      "C9 incluye séptima menor; Cadd9 no la exige",
      "Son siempre iguales",
      "Cadd9 es menor",
    ],
    0,
    "Probá Do3 en el bajo y Mi4–Si4–Re5 arriba: un voicing de Cmaj9 sin quinta.",
  ),
  lesson(
    "dominantes",
    3,
    "Prepará nuevas llegadas",
    "Dominantes secundarios y modulación.",
    25,
    ["Armonía aplicada", "Modulación"],
    [
      [
        "Una dominante temporal",
        "En Do mayor, A7 puede ir a Dm. A7 funciona como V7/ii: dominante del segundo grado. Su Do♯ no pertenece a Do mayor, pero conduce hacia Re.",
      ],
      [
        "Tonicización y modulación",
        "Una tonicización destaca brevemente otro acorde. Una modulación establece un nuevo centro tonal durante un pasaje. Una sola alteración no confirma un cambio de tonalidad.",
      ],
      [
        "Probá una ruta",
        "C–A7–Dm–G7–C vuelve al centro original. Para modular, buscá acordes compartidos y confirmá la nueva tonalidad con una cadencia. Escuchá dónde se siente el reposo.",
      ],
    ],
    {
      type: "sequence",
      notes: [60, 64, 67, 57, 61, 64, 67, 62, 65, 69, 67, 71, 74, 60],
    },
    "En Do mayor, A7 que resuelve a Dm es…",
    ["V7/ii", "IVmaj7", "La tónica"],
    0,
    "Tocá C–A7–Dm–G7–C y escuchá cómo Do♯ tiende a Re.",
  ),
  lesson(
    "blues",
    3,
    "Un blues de doce compases",
    "Forma, swing y conversación.",
    25,
    ["Blues", "Swing"],
    [
      [
        "La forma básica",
        "En Do, una forma frecuente es C7 | C7 | C7 | C7 / F7 | F7 | C7 | C7 / G7 | F7 | C7 | G7. Hay muchas variantes: usá esta como punto de partida.",
      ],
      [
        "La escala de blues",
        "Do Mi♭ Fa Sol♭ Sol Si♭ Do. La tercera menor puede convivir expresivamente con el acorde mayor de séptima dominante. Resolvé y escuchá, no recorras solo la escala.",
      ],
      [
        "Swing y fraseo",
        "En swing las corcheas suelen ser desiguales, con relación flexible según tempo y estilo. Escuchá ejemplos y cantá antes de tocar. Probá una frase de dos compases y su respuesta.",
      ],
    ],
    {
      type: "sequence",
      notes: [60, 63, 65, 66, 67, 70, 72, 70, 67, 65, 63, 60],
    },
    "¿Cuántos compases tiene la forma de blues de esta lección?",
    ["12", "8", "16"],
    0,
    "Tocá la forma completa con acordes en la izquierda e ideas cortas en la derecha. Contá los compases.",
  ),
  lesson(
    "polirritmia",
    3,
    "Independencia de verdad",
    "Dos contra tres y control de voces.",
    25,
    ["Polirritmia", "Independencia"],
    [
      [
        "Una rejilla común",
        "Para 3 contra 2 dividí un ciclo en seis partes iguales. La mano que hace tres ataca en 1, 3 y 5; la que hace dos en 1 y 4. Coinciden al inicio del ciclo.",
      ],
      [
        "Primero fuera del teclado",
        "Golpeá suavemente sobre una mesa y contá seis subdivisiones. Aislá cada patrón y después juntalos a velocidad muy baja. Volvé a una mano si se pierde la referencia.",
      ],
      [
        "Voces independientes",
        "En el instrumento usá una sola nota por mano. Más adelante añadí dinámica diferente: derecha más presente, izquierda suave. El entrenador de pulso no evalúa automáticamente dos manos.",
      ],
    ],
    { type: "rhythm", beats: 12 },
    "En una rejilla de seis, ¿dónde ataca la parte de dos?",
    ["1 y 4", "1, 3 y 5", "2 y 6"],
    0,
    "Lográ ocho ciclos de 3 contra 2 con una nota por mano. Invertí después los roles.",
  ),
  lesson(
    "analisis",
    3,
    "Aprendé a estudiar cualquier obra",
    "De la primera lectura a la interpretación.",
    25,
    ["Análisis", "Lectura a primera vista"],
    [
      [
        "Una mirada antes de tocar",
        "Observá tonalidad, compás, tempo, forma, repeticiones y cambios de textura. Localizá patrones: escalas, arpegios, acordes y secuencias. Anotá una digitación consistente.",
      ],
      [
        "Lectura y estudio son prácticas distintas",
        "En primera vista elegí material fácil y mantené el pulso, simplificando si hace falta. En estudio aislá errores, bajá el tempo y corregí las transiciones. No repitas el error diez veces.",
      ],
      [
        "Memoria con varias pistas",
        "Aprendé por sonido, armonía, forma y movimiento. Empezá desde varios puntos de la obra. Grabate una vez por semana y fijá una meta concreta para la próxima sesión.",
      ],
    ],
    { type: "reading", notes: [67, 71, 74, 72, 69, 65, 64, 60] },
    "¿Qué conviene priorizar al leer a primera vista material fácil?",
    [
      "Un pulso estable y anticipar la lectura",
      "Detenerse a corregir cada nota",
      "La máxima velocidad",
    ],
    0,
    "Elegí una obra a tu alcance, analizá la forma y prepará dos compases con una digitación que puedas repetir.",
  ),
  lesson(
    "proyecto",
    3,
    "Tu proyecto final",
    "Convertí lo aprendido en música propia.",
    30,
    ["Composición", "Interpretación"],
    [
      [
        "Diseñá una pieza",
        "Escribí 16 compases con dos secciones de ocho. Elegí tonalidad, compás y carácter. Usá un motivo breve y desarrollalo por repetición, variación o secuencia.",
      ],
      [
        "Construí el arreglo",
        "Elegí una progresión funcional, inversiones cercanas y un acompañamiento que deje oír la melodía. Reservá un cambio de registro o dinámica para la segunda sección.",
      ],
      [
        "Prepará una toma completa",
        "Ensayá entradas, enlaces y final. Grabá una versión sin detenerte y evaluá pulso, claridad de melodía, equilibrio y fraseo. El avance real se mide por cómo tocás, no por completar pantallas.",
      ],
    ],
    {
      type: "sequence",
      notes: [60, 64, 67, 71, 72, 69, 65, 62, 67, 71, 74, 65, 64, 62, 60],
    },
    "¿Qué ayuda a dar unidad a una composición?",
    [
      "Desarrollar un motivo reconocible",
      "Cambiar todo en cada compás",
      "Evitar silencios siempre",
    ],
    0,
    "Componé e interpretá 16 compases. Guardá una grabación externa y escribí qué mejorarías. Esta es una autoevaluación artística.",
  ),
];
// Las preparaciones antiguas se alinean con la habilidad que explican.
const replacePractice = (id, score) => {
  const l = lessons.find((l) => l.id === id);
  l.practice = {
    type: "sequence",
    score: { ...score, title: l.title },
    title: l.title,
  };
};
replacePractice("manos", pieces[0].score);
replacePractice("estudio-inicial", pieces[1].score);
replacePractice(
  "sincopa",
  advancedLessons.find((l) => l.id === "am-sincopas-reales").practice.score,
);
replacePractice("blues", pieces.find((p) => p.id === "azul").score);
replacePractice("polirritmia", {
  title: "Tres contra dos",
  description:
    "Derecha: tres ataques iguales por compás; izquierda: dos. Preparación 3:2 sin evaluar digitación.",
  meter: 4,
  bars: 2,
  notes: Array.from({ length: 2 }, (_, b) => [
    ...[60, 64, 67].map((pitch, i) => ({
      id: `poly-r-${b}-${i}`,
      pitch,
      start: b * 4 + (i * 4) / 3,
      duration: 4 / 3,
      hand: "right",
      tuplet: 3,
    })),
    ...[48, 55].map((pitch, i) => ({
      id: `poly-l-${b}-${i}`,
      pitch,
      start: b * 4 + i * 2,
      duration: 2,
      hand: "left",
    })),
  ]).flat(),
});
lessons.find((l) => l.id === "fa").practice.clef = "bass";
lessons.push(...advancedLessons);
lessons.sort((a, b) => a.level - b.level);
export { pieces };
