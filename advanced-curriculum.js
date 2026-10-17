// Contenido pedagógico y ejemplos musicales originales para Clavia.
// Los objetivos de dominio son sugerencias de práctica propias, no equivalencias
// con titulaciones ni una afirmación de que MIDI mida interpretación o postura.
const abrsm = {
  title: "ABRSM · Piano",
  url: "https://www.abrsm.org/en-ag/piano",
};
const rcm = {
  title: "RCM · Programas y actualizaciones",
  url: "https://www.rcmusic.com/learning/examinations/academic-resources-and-policies/syllabi-and-syllabi-errata",
};
const omt = {
  title: "Open Music Theory · Fundamentos",
  url: "https://viva.pressbooks.pub/openmusictheory/part/fundamentals/",
};
const jazz = {
  title: "ABRSM · Jazz Piano",
  url: "https://www.abrsm.org/en-eg/instruments/jazz/jazz-piano",
};
const chordScale = {
  title: "Open Music Theory · Escalas y acordes",
  url: "https://viva.pressbooks.pub/openmusictheory/chapter/chord-scale-theory/",
};

export const studyDomains = [
  {
    id: "technique",
    name: "Técnica y control",
    description:
      "Escalas, arpegios, movimiento y coordinación en distintas tonalidades, con objetivos de comodidad y continuidad.",
    sourceLinks: [abrsm, rcm],
  },
  {
    id: "reading",
    name: "Lectura y ritmo",
    description:
      "Leer alturas, duraciones, silencios y patrones nuevos; retirar ayudas para ganar autonomía.",
    sourceLinks: [abrsm, rcm, omt],
  },
  {
    id: "baroque",
    name: "Barroco y contrapunto",
    description:
      "Escuchar voces independientes, seguir motivos y estudiar articulación y forma en texturas contrapuntísticas originales.",
    sourceLinks: [rcm, omt],
  },
  {
    id: "classical",
    name: "Clásico y romántico",
    description:
      "Fraseo, acompañamiento, balance y pedal. Los estudios preparatorios no sustituyen obras completas ni devolución docente.",
    sourceLinks: [abrsm, rcm],
  },
  {
    id: "ear",
    name: "Oído y memoria musical",
    description:
      "Relacionar lo que escuchás, lo que imaginás y lo que tocás. Separar la preparación visible del reto auditivo sin guía.",
    sourceLinks: [rcm, abrsm],
  },
  {
    id: "improvisation",
    name: "Improvisación",
    description:
      "Motivos, silencios, respuestas, armonía y forma. Las restricciones ayudan a explorar; no definen una única improvisación correcta.",
    sourceLinks: [jazz, chordScale],
  },
  {
    id: "harmony",
    name: "Armonía y arreglos",
    description:
      "Entender funciones, leer cifrado, conducir voces y crear acompañamientos para melodías propias.",
    sourceLinks: [omt, chordScale, jazz],
  },
  {
    id: "study",
    name: "Interpretación y autonomía",
    description:
      "Planificar el estudio, resolver enlaces, preparar una interpretación completa y escuchar el resultado con criterio.",
    sourceLinks: [abrsm, rcm],
  },
];

const score = (title, bars, description, compose) => {
  const notes = [];
  const put = (pitch, start, duration = 1, hand = "right") => {
    notes.push({ id: `n${notes.length + 1}`, pitch, start, duration, hand });
  };
  const line = (
    pitches,
    start = 0,
    step = 1,
    hand = "right",
    duration = step,
  ) => {
    pitches.forEach((pitch, index) => {
      if (pitch !== null) put(pitch, start + index * step, duration, hand);
    });
  };
  const chord = (pitches, start, duration = 4, hand = "right") => {
    pitches.forEach((pitch) => put(pitch, start, duration, hand));
  };
  compose({ put, line, chord });
  notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  return { title, description, meter: 4, bars, notes };
};

const five = [60, 62, 64, 65, 67, 65, 64, 62];
const major = [60, 62, 64, 65, 67, 69, 71, 72, 71, 69, 67, 65, 64, 62, 60];
const progression = [
  { bass: 48, chord: [60, 64, 67] },
  { bass: 45, chord: [60, 64, 69] },
  { bass: 53, chord: [60, 65, 69] },
  { bass: 43, chord: [59, 62, 67] },
];

const mastery = (
  statement,
  kind = "midi",
  limitation = "MIDI verifica alturas y tiempos. La comodidad, digitación y calidad musical se revisan escuchando y observando.",
) => ({
  kind,
  statement,
  pitchAccuracy: 95,
  timingAccuracy: 90,
  successfulTakes: 3,
  days: 2,
  limitation,
  origin:
    "Objetivo sugerido por Clavia; no constituye una certificación ni una evaluación docente.",
});

const lesson = (
  domain,
  slug,
  level,
  title,
  subtitle,
  minutes,
  topics,
  steps,
  practiceScore,
  question,
  options,
  answer,
  challenge,
  goal,
  kind = "midi",
) => {
  // Distribución reproducible: la respuesta no ocupa siempre el primer lugar.
  const offset =
    [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    options.length;
  return {
    id: `am-${slug}`,
    domain,
    level,
    title,
    subtitle,
    minutes,
    topics,
    steps,
    practice: { type: "sequence", score: practiceScore, title },
    question,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    answer: (answer - offset + options.length) % options.length,
    challenge,
    mastery: mastery(goal, kind),
  };
};

export const advancedLessons = [
  lesson(
    "technique",
    "cinco-dedos-dos-manos",
    0,
    "Cinco dedos con ambas manos",
    "Coordinación desde una posición cómoda.",
    14,
    ["Coordinación", "Igualdad", "Dos manos"],
    [
      [
        "Dos posiciones equivalentes",
        "Poné la derecha en Do4–Sol4 y la izquierda una octava abajo. En el movimiento ascendente, la derecha usa 1–2–3–4–5 y la izquierda 5–4–3–2–1. No inmovilices los dedos que descansan.",
      ],
      [
        "Un mismo ataque",
        "Tocá una pareja de notas por pulso. Escuchá si una mano llega antes. La meta inicial es juntar los ataques y soltar ambas teclas sin apretar de más.",
      ],
      [
        "Separar para volver a juntar",
        "Si una pareja falla, repetí dos notas con cada mano y después unilas. Conservá un tempo que te permita anticipar la próxima posición.",
      ],
    ],
    score(
      "Cinco dedos en paralelo",
      4,
      "Dos manos a una octava; negras y un final sostenido.",
      ({ line, put }) => {
        line([...five, ...five.slice(0, 6)], 0, 1);
        line(
          [...five, ...five.slice(0, 6)].map((n) => n - 12),
          0,
          1,
          "left",
        );
        put(60, 14, 2);
        put(48, 14, 2, "left");
      },
    ),
    "Si una mano llega antes, ¿qué conviene hacer?",
    [
      "Bajar el tempo y coordinar dos ataques",
      "Apretar con más fuerza",
      "Ignorar esa mano hasta el final",
    ],
    0,
    "Hacé una toma con manos separadas y otra juntas. Repetí en Re mayor usando Fa♯; elegí antes la posición de cada dedo.",
    "Juntar tres tomas sin desfase perceptible y repetir el patrón desde otra tónica.",
  ),

  lesson(
    "technique",
    "familias-escalas-mayores",
    1,
    "Escalas mayores por familias",
    "Una digitación se aprende en contexto.",
    18,
    ["Escalas", "Digitación", "Tonalidad"],
    [
      [
        "Orden de estudio",
        "Empezá por Do y compará Sol, Re y La: las alteraciones cambian, pero muchas decisiones de digitación se relacionan. No deduzcas todas las escalas a partir de una única fórmula de dedos.",
      ],
      [
        "Preparar el pulgar",
        "En la derecha de Do mayor, el pulgar pasa después de Mi. Prepará el desplazamiento con la mano y el antebrazo; evitá torcer la muñeca para alcanzar Fa.",
      ],
      [
        "El regreso también se estudia",
        "Practicá ascenso y descenso al mismo tempo. En esta guía las manos suben juntas una octava. Después transportá lentamente y comprobá las alteraciones antes de empezar.",
      ],
    ],
    score(
      "Escala de Do con ambas manos",
      4,
      "Una octava en negras; la última tónica dura dos pulsos.",
      ({ line, put }) => {
        line(major.slice(0, 14));
        line(
          major.slice(0, 14).map((n) => n - 12),
          0,
          1,
          "left",
        );
        put(60, 14, 2);
        put(48, 14, 2, "left");
      },
    ),
    "¿Qué conviene preparar antes de tocar Sol mayor?",
    [
      "Dónde aparece Fa♯ y qué dedos usar",
      "Solo la primera nota",
      "Tocar todas las blancas",
    ],
    0,
    "Usá el generador de escalas para Do, Sol y Re. Anotá tu tempo cómodo por tonalidad, sin comparar velocidad con otras personas.",
    "Tocar ascenso y descenso con ambas manos, y transferir el patrón a dos tonalidades nuevas.",
  ),

  lesson(
    "technique",
    "tres-formas-menor",
    2,
    "Tres formas de la escala menor",
    "Oír la diferencia antes de acelerar.",
    18,
    ["Menor natural", "Menor armónica", "Menor melódica"],
    [
      [
        "El punto de comparación",
        "En La menor natural aparecen La Si Do Re Mi Fa Sol. En la armónica, Sol sube a Sol♯; escuchá cómo esa sensible conduce a La.",
      ],
      [
        "La menor melódica clásica",
        "Al subir se elevan sexto y séptimo grados: Fa♯ y Sol♯. Al bajar suele usarse la forma natural. En otros estilos podés encontrar la forma elevada en ambos sentidos.",
      ],
      [
        "Comparar fragmentos",
        "La guía contrasta el tramo Mi–Fa–Sol–La con Mi–Fa–Sol♯–La y Mi–Fa♯–Sol♯–La. Tocá la izquierda como referencia tonal y cantá el cambio que escuchás.",
      ],
    ],
    score(
      "Tres llegadas a La",
      4,
      "Comparación natural, armónica y melódica sobre un pedal de La.",
      ({ line, put }) => {
        line([64, 65, 67, 69], 0);
        line([64, 65, 68, 69], 4);
        line([64, 66, 68, 69], 8);
        line([69, 67, 65, 64], 12);
        [0, 4, 8, 12].forEach((t) => put(45, t, 4, "left"));
      },
    ),
    "En La menor armónica, ¿qué grado se eleva?",
    [
      "El séptimo: Sol pasa a Sol♯",
      "El tercero: Do pasa a Do♯",
      "El quinto: Mi pasa a Fa",
    ],
    0,
    "Tocá y cantá las tres formas de La menor. Después repetí el contraste en Re menor, identificando cada cambio sin mirar nombres.",
    "Distinguir y ejecutar las tres formas en dos tonalidades, con una explicación audible de sus diferencias.",
  ),

  lesson(
    "technique",
    "movimiento-contrario",
    2,
    "Movimiento paralelo y contrario",
    "Las manos pueden alejarse sin perder el pulso.",
    18,
    ["Independencia", "Escalas", "Movimiento contrario"],
    [
      [
        "El punto de partida",
        "Comenzá con la derecha en Do4 y la izquierda en Do3, en registros separados. La derecha asciende mientras la izquierda desciende; no fuerces la distancia entre los brazos.",
      ],
      [
        "Escuchar el encuentro",
        "En el regreso, prepará la llegada conjunta a Do. Practicá primero hasta Sol y después ampliá a una octava, manteniendo una digitación consistente.",
      ],
      [
        "No confundir direcciones",
        "En paralelo, ambas alturas suben o bajan. En contrario, una sube y la otra baja. Mirá la forma del pentagrama y anticipá la dirección antes de tocar.",
      ],
    ],
    score(
      "Escalas que se abren y vuelven",
      4,
      "Derecha asciende, izquierda desciende; cada mano vuelve al Do de su registro.",
      ({ line, put }) => {
        line(major.slice(0, 14));
        line(
          [48, 47, 45, 43, 41, 40, 38, 36, 38, 40, 41, 43, 45, 47],
          0,
          1,
          "left",
        );
        put(60, 14, 2);
        put(48, 14, 2, "left");
      },
    ),
    "¿Qué describe el movimiento contrario?",
    [
      "Una voz sube mientras la otra baja",
      "Las dos voces tocan más fuerte",
      "Una mano toca siempre después",
    ],
    0,
    "Compará una escala paralela con esta contraria. Escuchá la apertura del registro y el regreso simultáneo a los dos Do de partida.",
    "Mantener dirección y coincidencia en los cambios, sin confundir el ejercicio con una prueba de digitación.",
  ),

  lesson(
    "technique",
    "arpegios-dos-octavas",
    2,
    "Arpegios e inversiones en dos octavas",
    "Preparar un desplazamiento amplio sin saltar a ciegas.",
    20,
    ["Arpegios", "Inversiones", "Desplazamiento"],
    [
      [
        "Reconocé el acorde",
        "Antes del arpegio, encontrá Do–Mi–Sol como bloque. La sucesión no agrega notas nuevas: distribuye el mismo acorde en el tiempo y en el registro.",
      ],
      [
        "Dos octavas con control",
        "Prepará cada paso del pulgar sin endurecer la mano. La guía alterna las manos para que puedas escuchar la igualdad de los ataques; la simultaneidad se agrega después.",
      ],
      [
        "Cambiar la nota inicial",
        "Desde Mi aparece la primera inversión y desde Sol la segunda. Nombrá el bajo de cada forma y elegí digitación según dirección, registro y tamaño de tu mano.",
      ],
    ],
    score(
      "Arpegios en diálogo",
      4,
      "Derecha en dos octavas; respuesta izquierda y final conjunto.",
      ({ line, chord }) => {
        line([60, 64, 67, 72, 76, 79, 84, 79], 0, 0.5);
        line([48, 52, 55, 60, 64, 67, 72, 67], 4, 0.5, "left");
        line([64, 67, 72, 76, 72, 67, 64, 60], 8, 0.5);
        line([55, 60, 64, 67], 12, 0.5, "left");
        chord([48, 52, 55], 14, 2, "left");
        chord([60, 64, 67], 14, 2);
      },
    ),
    "¿Qué cambia en una inversión de Do mayor?",
    [
      "La nota que queda en el bajo",
      "El acorde se vuelve menor",
      "Se agrega necesariamente una séptima",
    ],
    0,
    "Hacé el mismo trabajo en Fa y Sol. Si un desplazamiento genera tensión, reducí el registro y pedí devolución sobre el movimiento.",
    "Completar las dos octavas al tempo cómodo y reconocer las tres posiciones del acorde.",
  ),

  lesson(
    "technique",
    "saltos-posicion",
    3,
    "Saltos y cambios de posición",
    "Mirar el destino antes del ataque.",
    20,
    ["Saltos", "Bajos", "Anticipación"],
    [
      [
        "Preparación silenciosa",
        "Elegí dos posiciones de bajo y mové la mano sin tocar. Mirá el destino antes de aterrizar. El movimiento debe ser sencillo, sin mantener los dedos rígidos.",
      ],
      [
        "Despegar sin apuro",
        "Soltá el bajo a tiempo para llegar al acorde siguiente. Una nota corta puede darte espacio; no extiendas cada bajo si la textura pide separación.",
      ],
      [
        "La derecha conserva el hilo",
        "Tocá primero la melodía sola. Al sumar los saltos, conservá el pulso de esa línea: no esperes a que la izquierda encuentre el destino.",
      ],
    ],
    score(
      "Bajos que cambian de registro",
      4,
      "La izquierda alterna bajo y acorde mientras la melodía continúa.",
      ({ line, put, chord }) => {
        progression.forEach((p, i) => {
          const t = i * 4;
          put(p.bass < 48 ? p.bass : p.bass - 12, t, 1, "left");
          chord(
            p.chord.map((n) => n - 12),
            t + 1,
            1,
            "left",
          );
          put(p.bass, t + 2, 1, "left");
          chord(
            p.chord.map((n) => n - 12),
            t + 3,
            1,
            "left",
          );
        });
        line([72, 71, 69, 67, 69, 72, 74, 72], 0, 2);
      },
    ),
    "¿Cuándo conviene mirar el lugar al que vas a saltar?",
    [
      "Antes de que la mano llegue",
      "Solo después de fallar",
      "Nunca, incluso al estudiar",
    ],
    0,
    "Aislá el salto más difícil y unilo con la nota anterior y la siguiente. Después ejecutá los cuatro compases sin detener la melodía.",
    "Resolver los cambios de posición en contexto y sostener una toma completa sin pausas añadidas.",
  ),

  lesson(
    "reading",
    "lectura-intervalica",
    1,
    "Leé distancias y posiciones",
    "Ver un patrón en lugar de descifrar cada letra.",
    15,
    ["Lectura", "Intervalos", "Claves"],
    [
      [
        "Puntos de referencia",
        "Ubicá Do central, Sol en su clave y Fa en la suya. Desde un punto conocido leé si la siguiente nota repite, avanza por grado conjunto o salta.",
      ],
      [
        "Dibujos que se repiten",
        "En una sucesión de terceras, las notas pasan de línea a línea o de espacio a espacio. Relacioná ese dibujo con la distancia de tus dedos.",
      ],
      [
        "Retirá una ayuda",
        "Ensayá con nombres y después usá solo la partitura. No hace falta retirar todas las ayudas a la vez; conservá un tempo que te permita mirar hacia adelante.",
      ],
    ],
    score(
      "Pasos y saltos en dos claves",
      4,
      "Alternancia entre grados conjuntos, terceras y notas repetidas.",
      ({ line, put }) => {
        line([60, 62, 64, 64, 60, 64, 67, 64], 0);
        line([48, 50, 52, 52, 48, 52, 55, 48], 8, 1, "left");
        put(48, 0, 4, "left");
        put(43, 4, 4, "left");
        put(67, 8, 4);
        put(60, 12, 4);
      },
    ),
    "Si ves que una nota pasa de una línea a la siguiente línea, ¿qué salto diatónico aparece?",
    ["Una tercera", "Una segunda", "Siempre una octava"],
    0,
    "Leé otro fragmento fácil sin escribir nombres. Decí en voz alta solamente las direcciones: repite, sube, baja o salta.",
    "Reconocer los patrones sin nombres sobre cada nota y transferirlos a un fragmento nuevo.",
  ),

  lesson(
    "reading",
    "armaduras-alteraciones",
    1,
    "Armaduras y alteraciones accidentales",
    "Una nota escrita necesita su contexto.",
    17,
    ["Armaduras", "Sostenidos", "Becuadros"],
    [
      [
        "La armadura actúa de fondo",
        "En Sol mayor, Fa se toca sostenido salvo que una alteración lo cambie. Localizá las notas afectadas antes de iniciar la lectura.",
      ],
      [
        "La alteración dentro del compás",
        "Una alteración accidental suele afectar la misma nota y octava durante ese compás. El becuadro cancela una alteración; una nueva barra restablece la armadura.",
      ],
      [
        "Mirar y escuchar",
        "La guía compara Fa♯ y Fa natural en un entorno de Sol. Su notación puede mostrar alteraciones explícitas: usá el sonido para comprobar que tocaste la altura indicada.",
      ],
    ],
    score(
      "Fa♯, Fa y llegada a Sol",
      4,
      "Ejemplo cromático con alteraciones explícitas y bajos de Sol/Re.",
      ({ line, put }) => {
        line([67, 69, 71, 72, 74, 72, 71, 66], 0);
        line([65, 64, 62, 65, 66, 69, 67], 8);
        put(67, 15, 1);
        [43, 50, 43, 43].forEach((n, i) => put(n, i * 4, 4, "left"));
      },
    ),
    "¿Para qué sirve el becuadro?",
    [
      "Para cancelar una alteración",
      "Para repetir la nota anterior",
      "Para tocar más fuerte",
    ],
    0,
    "En una partitura importada, identificá armadura y becuadros antes de tocar. Comprobá si la edición usa una convención especial para alteraciones de cortesía.",
    "Leer los cambios de altura sin omitir alteraciones y explicar cuándo se restablece la armadura.",
  ),

  lesson(
    "reading",
    "silencios-puntillos-ligaduras",
    1,
    "Silencios, puntillos y ligaduras",
    "La música continúa cuando no atacás una tecla.",
    17,
    ["Duración", "Silencios", "Ligaduras"],
    [
      [
        "Contar durante el silencio",
        "Un silencio ocupa tiempo real. Mantené la cuenta aunque tus manos no toquen; la entrada siguiente no debe adelantarse para llenar el espacio.",
      ],
      [
        "El punto suma la mitad",
        "Una negra con puntillo dura un pulso y medio cuando la negra vale uno. Podés contar subdivisiones de corchea para encontrar su final.",
      ],
      [
        "Una ligadura no agrega un ataque",
        "Dos notas de la misma altura ligadas suman sus duraciones. En el ejercicio la duración ya está sumada en el evento: mantené la tecla y no la vuelvas a atacar.",
      ],
    ],
    score(
      "Sostener y dejar espacio",
      4,
      "Duraciones de 1,5 pulsos y silencios reales; las notas largas representan duraciones sumadas.",
      ({ put, line }) => {
        put(60, 0, 1.5);
        put(62, 1.5, 0.5);
        put(64, 3, 1);
        put(65, 4, 3);
        put(64, 7.5, 0.5);
        line([67, null, 65, 64], 8);
        put(60, 12, 3);
        [0, 4, 8, 12].forEach((t) => put(48, t, 2, "left"));
      },
    ),
    "Dos notas de la misma altura unidas por ligadura se ejecutan…",
    [
      "Con un ataque y la duración total",
      "Con dos ataques cortos",
      "Siempre con pedal",
    ],
    0,
    "Contá ocho subdivisiones por compás antes de tocar. Grabá una toma y verificá si tus silencios duran tanto como los sonidos escritos.",
    "Conservar la duración de las notas largas y entrar después de cada silencio sin anticiparse.",
  ),

  lesson(
    "reading",
    "agrupacion-compases",
    2,
    "Compases simples y compuestos",
    "La agrupación cambia la sensación del movimiento.",
    18,
    ["Compás", "Subdivisión", "6/8"],
    [
      [
        "Dividir en dos o en tres",
        "Un pulso simple se divide normalmente en dos partes; uno compuesto, en tres. En 6/8 suelen sentirse dos pulsos grandes de negra con puntillo, cada uno con tres corcheas.",
      ],
      [
        "Número escrito y pulso sentido",
        "No asumas que el número superior siempre indica cuántos pulsos grandes tenés que marcar. Contar seis corcheas puede ayudarte al principio, pero el agrupamiento aporta dirección.",
      ],
      [
        "Preparación en la guía",
        "Este estudio está escrito en 4/4: compara grupos de corcheas y deja un espacio después de seis. No lo llama 6/8 ni cambia de compás automáticamente. Aplicá la diferencia a una partitura real de 6/8 en el reto.",
      ],
    ],
    score(
      "Agrupar antes de cambiar el compás",
      4,
      "Preparación en 4/4; seis corcheas y un pulso de silencio no equivalen a un compás de 6/8.",
      ({ line, put }) => {
        line([60, 62, 64, 65, 67, 65, 64, 62], 0, 0.5);
        line([60, 64, 67, 62, 65, 69], 4, 0.5);
        line([64, 65, 67, 69, 67, 65, 64, 62], 8, 0.5);
        line([60, 64, 67, 62, 65, 69], 12, 0.5);
        [0, 4, 8, 12].forEach((t) => put(48, t, 3, "left"));
      },
    ),
    "En un 6/8 habitual, ¿cuántos pulsos grandes se sienten?",
    ["Dos, subdivididos en tres", "Seis negras", "Cuatro, subdivididos en dos"],
    0,
    "Abrí una partitura de 6/8 que reconozcas. Marcá los dos pulsos grandes y cantá sus tres subdivisiones antes de tocar. Esta preparación no acredita por sí sola lectura en 6/8.",
    "Distinguir agrupación binaria y ternaria y aplicarla a un ejemplo auténtico de 6/8.",
    "reflection",
  ),

  lesson(
    "reading",
    "sincopas-reales",
    2,
    "Síncopas y contratiempos reales",
    "La referencia estable puede estar en la otra mano.",
    18,
    ["Síncopa", "Contratiempo", "Independencia"],
    [
      [
        "Primero el lugar del pulso",
        "La izquierda toca las negras y sirve de referencia. Contá 1 y 2 y 3 y 4 y para ubicar los ataques de la derecha entre los pulsos.",
      ],
      [
        "Contratiempo y prolongación",
        "Tocar después del pulso dejando un silencio delante produce un contratiempo. Si la nota se sostiene sobre un punto fuerte siguiente, aparece una síncopa.",
      ],
      [
        "No corregir el desplazamiento",
        "No lleves las notas de la derecha al clic más cercano. El ejercicio espera entradas a medio pulso y algunas duraciones que atraviesan una negra de la izquierda.",
      ],
    ],
    score(
      "Derecha fuera del clic",
      4,
      "La izquierda marca negras; la derecha entra a contratiempo y sostiene síncopas.",
      ({ line, put }) => {
        line(Array(16).fill(48), 0, 1, "left", 0.5);
        [0.5, 1.5, 2.5, 3.5].forEach((t, i) =>
          put([64, 67, 69, 67][i], t, 0.5),
        );
        put(65, 4.5, 1);
        put(64, 5.5, 1);
        put(62, 7, 1);
        put(64, 8, 1.5);
        put(67, 9.5, 1);
        put(69, 11, 1);
        put(67, 12.5, 1);
        put(64, 13.5, 1);
        put(60, 15, 1);
      },
    ),
    "En este ejercicio, ¿qué mano conserva la referencia de negras?",
    ["La izquierda", "La derecha siempre", "Ninguna; el pulso desaparece"],
    0,
    "Tocá primero la izquierda mientras cantás la derecha. Después invertí el trabajo: tocá la derecha y marcá el pulso con el pie.",
    "Ubicar los ataques entre pulsos sin desplazar la referencia de la mano izquierda.",
  ),

  lesson(
    "reading",
    "primera-vista-continua",
    2,
    "Primera vista sin detener el pulso",
    "Leer algo nuevo exige otra estrategia que estudiar.",
    18,
    ["Primera vista", "Anticipación", "Continuidad"],
    [
      [
        "Exploración breve",
        "Antes de tocar mirá tonalidad, compás, rango, silencios y el lugar más difícil. Elegí un tempo que te permita atravesar ese punto, no solo el primer compás.",
      ],
      [
        "Una toma es una toma",
        "En primera vista priorizá continuidad. Si perdés una nota, buscá el siguiente pulso o compás. Después de la toma podés aislar el error y estudiarlo.",
      ],
      [
        "Lo nuevo importa",
        "Este fragmento sirve de ensayo del procedimiento. Una vez repetido, ya es material estudiado: para medir lectura nueva elegí otro fragmento de dificultad semejante.",
      ],
    ],
    score(
      "Ensayo de primera lectura",
      4,
      "Un fragmento breve para planificar y atravesar sin detenerse.",
      ({ line, put }) => {
        line([64, 65, 67, null, 69, 67, 64, 62, 65, 64, 62, null], 0);
        put(60, 12, 4);
        [48, 45, 53, 48].forEach((n, i) => put(n, i * 4, 4, "left"));
      },
    ),
    "Después de repetir cinco veces el mismo fragmento, ¿qué estás midiendo principalmente?",
    [
      "El estudio de ese fragmento",
      "Una primera lectura nueva",
      "El oído absoluto",
    ],
    0,
    "Buscá tres fragmentos nuevos fáciles, de cuatro compases. Permitite una exploración breve y una sola toma por fragmento; guardá por separado los resultados.",
    "Leer tres fragmentos nuevos con continuidad y reconocer qué ayudas utilizaste.",
    "reflection",
  ),

  lesson(
    "baroque",
    "dos-voces-escucha",
    1,
    "Dos voces que se escuchan",
    "Cada mano tiene una línea con sentido.",
    18,
    ["Contrapunto", "Voces", "Independencia"],
    [
      [
        "Seguí una voz",
        "Cantá solo la línea superior mientras escuchás las dos. Repetí siguiendo el bajo. No confundas acompañar con dejar de escuchar una de las líneas.",
      ],
      [
        "Duraciones diferentes",
        "La derecha camina en negras mientras la izquierda sostiene blancas. La entrada de una mano no exige soltar la nota de la otra.",
      ],
      [
        "Unir después de comprender",
        "Estudiá cada voz como una melodía. Cuando las juntes, conservá los finales de las notas largas y la dirección de cada frase.",
      ],
    ],
    score(
      "Dos líneas independientes",
      4,
      "Derecha en negras e izquierda en blancas, con direcciones distintas.",
      ({ line }) => {
        line([67, 69, 71, 72, 71, 69, 67, 65, 64, 65, 67, 69, 67, 65, 64, 60]);
        line([48, 47, 45, 43, 41, 43, 47, 48], 0, 2, "left");
      },
    ),
    "Cuando la derecha ataca una nota nueva, el bajo largo debe…",
    [
      "Continuar hasta su final escrito",
      "Soltarse siempre",
      "Repetirse más fuerte",
    ],
    0,
    "Grabá las voces juntas y escuchá una sola por vez. Marcá en qué compás perdiste el hilo del bajo y repetí desde el anterior.",
    "Mantener ambas líneas completas, sin cortar las notas largas al mover la otra mano.",
  ),

  lesson(
    "baroque",
    "imitacion-motivo",
    2,
    "Un motivo responde por imitación",
    "La misma idea puede aparecer en otra voz.",
    18,
    ["Imitación", "Motivo", "Memoria"],
    [
      [
        "Identificá la idea",
        "Un motivo es una unidad breve reconocible por ritmo, intervalos o ambos. Acá aparece una subida y un regreso antes de pasar a la otra mano.",
      ],
      [
        "Escuchá la entrada",
        "La izquierda responde una octava más abajo mientras la derecha sostiene. Prepará la entrada con la cuenta y no con un gesto brusco de la otra mano.",
      ],
      [
        "El acompañamiento también canta",
        "Cuando una voz deja de llevar el motivo, su nota sostenida todavía forma parte de la textura. Conservá su duración mientras escuchás la respuesta.",
      ],
    ],
    score(
      "Una idea, dos voces",
      4,
      "Imitación por compases con notas sostenidas de la otra voz.",
      ({ line, put }) => {
        line([60, 62, 64, 60], 0);
        put(48, 0, 4, "left");
        line([48, 50, 52, 48], 4, 1, "left");
        put(67, 4, 4);
        line([62, 64, 65, 62], 8);
        put(43, 8, 4, "left");
        line([50, 52, 53, 50], 12, 1, "left");
        put(71, 12, 4);
      },
    ),
    "¿Qué permite reconocer la imitación?",
    [
      "La reaparición del ritmo y del dibujo melódico",
      "Que todo esté al mismo volumen",
      "Que las manos nunca se alternen",
    ],
    0,
    "Inventá un motivo de cuatro notas y respondelo una octava abajo. Conservá primero su ritmo; después cambiá solo el final.",
    "Reconocer las entradas y sostener la otra voz durante cada respuesta.",
  ),

  lesson(
    "baroque",
    "secuencias-motivo",
    2,
    "Secuencias y transporte del motivo",
    "Un patrón puede organizar varios compases.",
    20,
    ["Secuencia", "Tonalidad", "Análisis"],
    [
      [
        "Mismo dibujo, otra altura",
        "Una secuencia desplaza una idea a otras alturas. Reconocé qué parte se conserva y qué notas cambian para permanecer en la tonalidad.",
      ],
      [
        "Prepará el nuevo punto de partida",
        "En vez de leer ocho notas aisladas, pensá el motivo de dos pulsos y su siguiente posición. La izquierda señala el cambio armónico.",
      ],
      [
        "No copiar dedos sin pensar",
        "Un patrón desplazado puede necesitar otra digitación. Probala lentamente y mantené la dirección de la frase por encima de la repetición mecánica.",
      ],
    ],
    score(
      "Motivos por grados",
      4,
      "Secuencia de corcheas sobre bajos que cambian cada dos pulsos.",
      ({ line, put }) => {
        [
          [60, 64, 62, 60],
          [62, 65, 64, 62],
          [64, 67, 65, 64],
          [65, 69, 67, 65],
          [67, 71, 69, 67],
          [65, 69, 67, 65],
          [64, 67, 65, 64],
          [62, 65, 64, 60],
        ].forEach((p, i) => line(p, i * 2, 0.5));
        [48, 50, 52, 53, 55, 53, 52, 48].forEach((n, i) =>
          put(n, i * 2, 2, "left"),
        );
      },
    ),
    "Al transportar un motivo diatónicamente, ¿qué conviene conservar?",
    [
      "Su dibujo y función dentro de la tonalidad",
      "Siempre las mismas teclas negras",
      "Solo el volumen",
    ],
    0,
    "Nombrá los puntos de partida del motivo. Tocá la secuencia desde otro grado y revisá si todas las alturas pertenecen al contexto que elegiste.",
    "Anticipar cada desplazamiento y transportar una secuencia breve sin perder el patrón rítmico.",
  ),

  lesson(
    "baroque",
    "articulaciones-independientes",
    2,
    "Una voz ligada y otra separada",
    "La articulación puede diferir entre manos.",
    20,
    ["Legato", "Staccato", "Independencia"],
    [
      [
        "Separar no es golpear",
        "Una nota separada termina antes de la siguiente. No necesita más fuerza ni una muñeca rígida; probá un movimiento pequeño y escuchá el espacio.",
      ],
      [
        "Sostener contra separar",
        "En el estudio, la derecha mantiene blancas mientras la izquierda toca negras cortas. La duración de una voz no debe copiar el gesto de la otra.",
      ],
      [
        "Intercambiar la tarea",
        "Cuando se estabilice, invertí las articulaciones en tu instrumento. El resultado cambia de carácter aunque las alturas sean iguales.",
      ],
    ],
    score(
      "Blancas sobre pasos cortos",
      4,
      "Notas largas arriba y ataques de medio pulso separados abajo.",
      ({ line }) => {
        line([72, 71, 69, 67, 65, 67, 71, 72], 0, 2);
        line(
          [48, 52, 55, 52, 47, 50, 55, 50, 45, 48, 53, 48, 43, 47, 50, 48],
          0,
          1,
          "left",
          0.5,
        );
      },
    ),
    "¿Cómo se reconoce la articulación separada en este estudio?",
    [
      "Por el espacio entre sus sonidos",
      "Porque siempre es más fuerte",
      "Porque usa pedal continuo",
    ],
    0,
    "Hacé una toma sin pedal, escuchando los finales. Intercambiá las articulaciones fuera de la guía y compará ambas versiones.",
    "Sostener una voz completa mientras la otra conserva espacios regulares entre ataques.",
  ),

  lesson(
    "baroque",
    "ornamentos-preparacion",
    3,
    "Ornamentos: preparar y resolver",
    "Un adorno pertenece a una frase y a un estilo.",
    20,
    ["Ornamentos", "Estilo", "Resolución"],
    [
      [
        "Mirar el contexto",
        "Trinos, mordentes y apoyaturas no tienen una única realización universal. La época, el compositor, la edición y la armonía ayudan a decidir cómo tocarlos.",
      ],
      [
        "Descomponer el gesto",
        "Este ejemplo escribe todas las notas de una alternancia breve en semicorcheas. No pretende establecer una regla para cada símbolo barroco.",
      ],
      [
        "Llegar con claridad",
        "Prepará la resolución y escuchá el bajo durante el adorno. Si acelerás solo el grupo rápido, ampliá la subdivisión y recuperá un pulso estable.",
      ],
    ],
    score(
      "Alternancia escrita y resolución",
      4,
      "Grupos rápidos escritos por completo; no es una transcripción de un ornamento histórico.",
      ({ line, put }) => {
        line([67, 69, 67, 69], 0, 0.25);
        put(67, 1, 1);
        put(64, 2, 2);
        line([65, 67, 65, 67], 4, 0.25);
        put(65, 5, 1);
        put(62, 6, 2);
        line([71, 72, 71, 72], 8, 0.25);
        put(71, 9, 1);
        put(67, 10, 2);
        put(72, 12, 4);
        [48, 53, 43, 48].forEach((n, i) => put(n, i * 4, 4, "left"));
      },
    ),
    "¿Qué decide la realización de un ornamento?",
    [
      "El estilo, el contexto y las fuentes de la obra",
      "Una fórmula idéntica para todas las épocas",
      "Siempre la mayor velocidad posible",
    ],
    0,
    "En una obra clásica autorizada, buscá un ornamento y contrastá la explicación de la edición. Practicá sus notas lentamente antes de integrarlo.",
    "Resolver grupos rápidos al pulso elegido y justificar una realización con su contexto.",
    "reflection",
  ),

  lesson(
    "baroque",
    "invencion-dos-voces",
    3,
    "Pequeña invención a dos voces",
    "Sostener un diálogo de principio a fin.",
    25,
    ["Contrapunto", "Forma", "Integración"],
    [
      [
        "Reconocé las entradas",
        "Buscá el motivo inicial y señalá cuándo pasa al bajo. Estudiá las entradas con una nota de contexto antes y después, no como bloques aislados sin enlace.",
      ],
      [
        "Escuchá el recorrido armónico",
        "Aunque ambas voces se muevan, aparecen puntos de tensión y llegada. Cantá el bajo y ubicá dónde la frase necesita descansar.",
      ],
      [
        "Prepará una toma completa",
        "Elegí un tempo con el que puedas tocar los ocho compases. Después de la toma, corregí el enlace más débil y volvé a escuchar la relación entre las voces.",
      ],
    ],
    score(
      "Invención breve original",
      8,
      "Ocho compases con entradas imitativas y actividad alternada.",
      ({ line, put }) => {
        const motifs = [
          [60, 62, 64, 67],
          [62, 64, 65, 69],
          [64, 65, 67, 71],
          [65, 64, 62, 60],
        ];
        motifs.forEach((m, i) => {
          const t = i * 8;
          line(m, t, 0.5);
          put(m[3], t + 2, 2);
          line(
            m.map((n) => n - 12),
            t + 2,
            0.5,
            "left",
          );
          put([48, 50, 52, 53][i], t, 2, "left");
          line([m[3], m[2], m[1], m[0]], t + 4);
          line(
            [43, 47, 50, 48].map((n) => n + (i === 1 ? 2 : 0)),
            t + 4,
            1,
            "left",
          );
        });
      },
    ),
    "Antes de juntar dos voces contrapuntísticas, conviene…",
    [
      "Comprender y poder cantar cada línea",
      "Memorizar solo la mano derecha",
      "Agregar pedal para unir cualquier corte",
    ],
    0,
    "Presentá una toma completa y otra en la que cantes una voz mientras tocás la otra. Anotá qué compás necesita más independencia.",
    "Completar las dos voces con continuidad y reconocer al menos cuatro entradas del motivo.",
  ),

  lesson(
    "classical",
    "frases-cadencias",
    1,
    "Frases, respiraciones y cadencias",
    "Dar dirección a cuatro compases.",
    18,
    ["Fraseo", "Cadencias", "Escucha"],
    [
      [
        "Una frase tiene recorrido",
        "Pensá la melodía como una oración: parte de un lugar, avanza y llega a otro. Marcá su punto de mayor tensión antes de decidir dónde tocar más o menos.",
      ],
      [
        "La armonía orienta",
        "El bajo cambia entre Do, Fa y Sol antes de volver a Do. Escuchá la diferencia entre terminar en dominante y terminar en tónica.",
      ],
      [
        "Respirar sin romper la cuenta",
        "Separar una frase puede requerir soltar y preparar la siguiente entrada. En esta práctica el pulso es fijo: la respiración se logra con los finales escritos, sin agregar tiempo.",
      ],
    ],
    score(
      "Pregunta y respuesta tonal",
      4,
      "Dos frases breves: una termina en dominante y la otra vuelve a tónica.",
      ({ line, put }) => {
        line([64, 65, 67], 0, 1);
        put(62, 3, 1);
        line([65, 64, 62], 4, 1);
        put(67, 7, 1);
        line([69, 67, 65, 64], 8);
        put(62, 12, 1);
        put(60, 13, 3);
        [48, 43, 53, 48].forEach((n, i) => put(n, i * 4, 4, "left"));
      },
    ),
    "¿Qué ayuda a reconocer una llegada tonal?",
    [
      "Escuchar la melodía junto con el bajo y la armonía",
      "Solo contar cuántas notas hay",
      "Tocar siempre más lento al azar",
    ],
    0,
    "Cantá las dos frases y elegí un punto de dirección en cada una. Grabá dos interpretaciones y compará si esa elección se escucha.",
    "Mantener el pulso y describir la dirección y llegada de cada frase.",
    "reflection",
  ),

  lesson(
    "classical",
    "bajo-alberti",
    2,
    "El bajo de Alberti",
    "Una textura clara para sostener la melodía.",
    20,
    ["Alberti", "Acompañamiento", "Dos manos"],
    [
      [
        "Grave, aguda, media, aguda",
        "Una disposición habitual del bajo de Alberti distribuye el acorde en ese orden. En Do mayor: Do–Sol–Mi–Sol. Reconocé el acorde antes de arpegiarlo.",
      ],
      [
        "Regular y liviano",
        "La izquierda mantiene corcheas regulares. No acentúes cada paso del pulgar ni subas el volumen al cambiar de acorde.",
      ],
      [
        "La melodía se sostiene encima",
        "La derecha tiene notas más largas. No las cortes cada vez que la izquierda se mueve; escuchá la diferencia entre el fondo y la línea que querés destacar.",
      ],
    ],
    score(
      "Melodía sobre Alberti",
      4,
      "Corcheas en la izquierda y melodía en blancas.",
      ({ line }) => {
        progression.forEach((p, i) => {
          const [low, middle, high] = p.chord.map((n) => n - 12);
          line(
            [low, high, middle, high, low, high, middle, high],
            i * 4,
            0.5,
            "left",
          );
        });
        line([72, 71, 69, 72, 74, 72, 71, 67], 0, 2);
      },
    ),
    "En Do–Sol–Mi–Sol, ¿qué nota del acorde vuelve a repetirse?",
    ["La más aguda: Sol", "La más grave: Do", "Siempre la tercera: Mi"],
    0,
    "Practicá el acompañamiento con cada acorde como bloque y luego desplegado. Volvé a unirlo con la melodía a un volumen menor.",
    "Sostener las corcheas mientras la melodía conserva todas sus duraciones.",
  ),

  lesson(
    "classical",
    "melodia-acompanamiento",
    2,
    "Melodía y acompañamiento en planos",
    "Dos manos no tienen que sonar igual de fuertes.",
    20,
    ["Balance", "Dinámica", "Melodía"],
    [
      [
        "Elegí la voz principal",
        "Identificá qué línea necesita escucharse con más claridad. La otra mano puede acompañar con un gesto más ligero sin dejar de sostener sus notas.",
      ],
      [
        "Ensayo por contraste",
        "Tocá la melodía sola y después el acompañamiento solo, más suave. Al juntarlos, conservá esa diferencia en vez de duplicar la fuerza para coordinar.",
      ],
      [
        "Qué puede mostrar el instrumento",
        "Si tu teclado transmite velocidad MIDI, podés comparar la intensidad relativa de los ataques. La guía de notas no certifica balance acústico: escuchá una grabación del resultado.",
      ],
    ],
    score(
      "Cantabile sobre acordes",
      4,
      "Melodía móvil sobre acordes largos de acompañamiento.",
      ({ line, chord }) => {
        line([72, 74, 76, 74, 72, 71, 69, 67, 69, 72, 74, 72], 0);
        line([71, 69], 12);
        chord([67, 72], 14, 2);
        progression.forEach((p, i) =>
          chord(
            p.chord.map((n) => n - 12),
            i * 4,
            4,
            "left",
          ),
        );
      },
    ),
    "¿Qué confirma que la melodía se distingue del acompañamiento?",
    [
      "Escuchar el resultado de ambas juntas",
      "Solo acertar las alturas",
      "Que todos los ataques tengan la misma fuerza",
    ],
    0,
    "Grabá tres versiones: acompañamiento demasiado fuerte, demasiado débil y equilibrado. Describí qué cambia en la frase; evitá aumentar tensión para hacer el contraste.",
    "Ejecutar la textura completa y elegir un balance audible mediante autoescucha.",
    "reflection",
  ),

  lesson(
    "classical",
    "forma-aba-sonatina",
    2,
    "Reconocé la forma antes de estudiar",
    "Los retornos y contrastes organizan la memoria.",
    20,
    ["Forma", "ABA", "Análisis"],
    [
      [
        "Secciones que vuelven",
        "En una forma ABA, una idea inicial reaparece después de una sección contrastante. Escuchá qué cambia: registro, armonía, ritmo o textura.",
      ],
      [
        "Un mapa breve",
        "Dividí la pieza en secciones con nombres que recuerdes. Una sonatina puede utilizar formas más amplias; no toda pieza breve es ABA ni toda sonatina tiene la misma estructura.",
      ],
      [
        "Usá las semejanzas",
        "Estudiá primero el material que regresa y luego las diferencias de la vuelta. En este estudio de ocho compases, A ocupa dos, B cuatro y A vuelve en los últimos dos.",
      ],
    ],
    score(
      "Forma ABA en miniatura",
      8,
      "A de dos compases, B de cuatro y retorno de A.",
      ({ line, put }) => {
        const a = [64, 67, 72, 71, 69, 67, 64, 60];
        line(a, 0);
        line(
          [69, 72, 76, 74, 72, 69, 65, 64, 62, 65, 69, 67, 65, 62, 71, 67],
          8,
        );
        line(a, 24);
        [48, 48, 45, 53, 50, 43, 48, 48].forEach((n, i) =>
          put(n, i * 4, 4, "left"),
        );
      },
    ),
    "En un esquema ABA, la última A indica…",
    [
      "El retorno de la idea inicial",
      "Un aumento obligatorio de velocidad",
      "Un acorde siempre en La",
    ],
    0,
    "Hacé un mapa de secciones de una pieza importada. Marcá qué vuelve igual y qué cambia; empezá a practicar también desde la sección contrastante.",
    "Ubicar las tres secciones y comenzar la ejecución desde cada una sin depender del inicio.",
  ),

  lesson(
    "classical",
    "cantabile-balance",
    3,
    "Cantabile y voz interior",
    "Una línea puede cantar dentro de una textura.",
    22,
    ["Cantabile", "Voz interior", "Fraseo"],
    [
      [
        "Encontrar la línea",
        "No todas las notas agudas son siempre la melodía. En una textura de acordes, seguí la voz que la obra destaca y cantala antes de sumar las otras.",
      ],
      [
        "Conectar sin pedal primero",
        "Probá sostener cada nota principal hasta la entrada de la siguiente. Si un enlace resulta incómodo, revisá digitación y redistribución de notas antes de forzar el alcance.",
      ],
      [
        "La práctica escrita es una preparación",
        "La guía separa una voz superior sostenida y un acompañamiento quebrado. El carácter cantabile requiere escuchar la frase completa: el porcentaje de notas no lo describe por sí solo.",
      ],
    ],
    score(
      "Una línea que permanece",
      4,
      "Melodía en notas largas, con movimiento interno en la izquierda.",
      ({ put, line }) => {
        [76, 74, 72, 71].forEach((n, i) => put(n, i * 4, 4));
        [
          [48, 55, 52, 55],
          [47, 55, 50, 55],
          [45, 52, 48, 52],
          [43, 50, 47, 50],
        ].forEach((p, i) => line([...p, ...p], i * 4, 0.5, "left"));
      },
    ),
    "¿Qué demuestra por sí solo acertar todas las alturas?",
    [
      "Que tocaste esas alturas, no que la frase sea cantabile",
      "Que ya dominás la interpretación",
      "Que la digitación fue necesariamente correcta",
    ],
    0,
    "Cantá la melodía mientras tocás únicamente el acompañamiento. Después tocá todo y comprobá si seguís percibiendo esa línea como una frase.",
    "Conservar la voz principal y evaluar su continuidad mediante una toma escuchada críticamente.",
    "reflection",
  ),

  lesson(
    "classical",
    "pedal-rubato",
    3,
    "Pedal y rubato conscientes",
    "La libertad expresiva necesita una base clara.",
    22,
    ["Pedal", "Rubato", "Interpretación"],
    [
      [
        "Cambiar sin mezclar todo",
        "Aprendé primero la armonía sin pedal. Al cambiar, escuchá si el pedal anterior ensucia el nuevo acorde; la coordinación exacta depende de la textura y del instrumento.",
      ],
      [
        "Pulso y flexibilidad",
        "Rubato no significa perder toda referencia. Decidí qué parte de la frase se expande y cómo conserva su dirección; compará con una versión al pulso.",
      ],
      [
        "Dos tipos de revisión",
        "La guía usa tempo fijo y verifica sus duraciones. Reservá la toma expresiva para escuchar pedal, respiraciones y proporción; un desplazamiento intencional no debe recibir un diagnóstico automático de mal gusto.",
      ],
    ],
    score(
      "Base clara antes de la flexibilidad",
      4,
      "Preparación al pulso, sin evaluación de pedal ni rubato.",
      ({ put, line, chord }) => {
        progression.forEach((p, i) => {
          chord(
            p.chord.map((n) => n - 12),
            i * 4,
            3,
            "left",
          );
          put(p.bass, i * 4 + 3, 1, "left");
        });
        line([72, 71, 69, 67, 69, 72], 0, 2);
        put(71, 12, 1);
        put(72, 13, 3);
      },
    ),
    "¿Qué evalúa esta guía con tempo fijo?",
    [
      "La ejecución al pulso de las notas escritas",
      "La calidad de cualquier rubato",
      "La profundidad acústica del pedal",
    ],
    0,
    "Hacé una toma sin pedal al pulso y otra expresiva. Anotá dónde cambiaste pedal y dónde flexibilizaste el tiempo; elegí por el sonido, no por el porcentaje automático.",
    "Comparar una base rítmica estable con una interpretación expresiva justificada.",
    "reflection",
  ),

  lesson(
    "ear",
    "cantar-encontrar",
    0,
    "Cantá y encontrá una nota",
    "Escuchar por dentro antes de buscar la tecla.",
    12,
    ["Oído", "Voz", "Orientación"],
    [
      [
        "Escuchar y esperar",
        "Tocá una nota cómoda, escuchala y dejá pasar unos segundos. Intentá imaginar su sonido antes de volver a tocarla; no hace falta darle nombre enseguida.",
      ],
      [
        "Usá tu voz sin forzar",
        "Cantá en un registro cómodo. Si queda demasiado alta o baja, trasladá una octava. La app no escucha ni evalúa tu canto: comprobalo de oído o con devolución docente.",
      ],
      [
        "La guía sirve de referencia",
        "El ejemplo presenta notas separadas por silencios. Primero aprendé su sonido; para el reto auditivo apartá la vista y buscá una altura que escuchaste sin mirar dónde se tocó.",
      ],
    ],
    score(
      "Notas con espacio para imaginar",
      4,
      "Referencia visible; el reto de canto y búsqueda no se puntúa automáticamente.",
      ({ put }) => {
        [60, 64, 67, 62, 65, 69, 67, 60].forEach((n, i) => put(n, i * 2, 1));
      },
    ),
    "¿Qué puede evaluar la guía sin usar un micrófono?",
    [
      "Las notas que tocás, no la afinación de tu voz",
      "Si cantás afinado",
      "La postura de tu garganta",
    ],
    0,
    "Pedile a otra persona que toque cinco notas dentro de una quinta sin mostrarte cuáles son. Buscalas después de cantarlas; permitite comparar y corregir.",
    "Relacionar una referencia sonora con una tecla y registrar cuándo necesitaste ayuda visual.",
    "reflection",
  ),

  lesson(
    "ear",
    "intervalos-direcciones",
    1,
    "Intervalos en ambas direcciones",
    "Reconocer la distancia, no memorizar dos teclas.",
    16,
    ["Intervalos", "Oído relativo", "Dirección"],
    [
      [
        "Un mismo intervalo se traslada",
        "Do–Mi y Fa–La son terceras mayores. Comparalas desde distintas alturas para no asociar la respuesta a una sola pareja de teclas.",
      ],
      [
        "Subir y bajar",
        "Reconocé primero si la melodía sube o baja; después su distancia. Una tercera descendente sigue siendo tercera aunque su dirección cambie.",
      ],
      [
        "Alternar ver y escuchar",
        "La partitura es una referencia de estudio. Para comprobar oído, usá después ejemplos ocultos del entrenador y respondé antes de mirar la solución.",
      ],
    ],
    score(
      "Terceras, cuartas y quintas",
      4,
      "Pares ascendentes y descendentes en distintas alturas.",
      ({ line }) => {
        line([60, 64, 69, 65, 62, 67, 72, 67, 60, 65, 69, 64, 67, 71, 65, 60]);
      },
    ),
    "Fa–La y Do–Mi comparten…",
    [
      "Una tercera mayor ascendente",
      "Las mismas teclas",
      "Una quinta justa descendente",
    ],
    0,
    "En Entrenar → Oído, completá una ronda con ejemplos nuevos. Después tocá el intervalo reconocido desde otra tónica.",
    "Reconocer distancias en ejemplos nuevos y reproducirlas desde más de una nota.",
    "reflection",
  ),

  lesson(
    "ear",
    "eco-melodico",
    1,
    "Eco melódico: escuchar y responder",
    "Recordar un motivo antes de tocarlo.",
    16,
    ["Memoria auditiva", "Melodía", "Imitación"],
    [
      [
        "Retené la forma",
        "Escuchá un motivo corto y preguntate si repite, sube, baja o salta. Cantarlo primero suele ayudar a conservar su forma.",
      ],
      [
        "Una tónica como apoyo",
        "Ubicá la tonalidad y la nota inicial antes de buscar el resto. No adivines cada tecla sin relacionarla con el sonido anterior.",
      ],
      [
        "La respuesta visible es preparación",
        "La guía alterna motivos breves con silencio. Para un reto auditivo real, escuchá sin mirar y ocultá la solución durante la búsqueda; una repetición memorizada no prueba un ejemplo nuevo.",
      ],
    ],
    score(
      "Tres motivos y una respuesta",
      4,
      "Motivos de dos pulsos seguidos de espacio para responder fuera de la guía.",
      ({ line }) => {
        line([60, 62, 64, 62], 0, 0.5);
        line([64, 67, 65, 64], 4, 0.5);
        line([67, 69, 67, 64], 8, 0.5);
        line([62, 64, 62, 60], 12, 0.5);
      },
    ),
    "¿Qué ayuda a recordar un motivo que acabás de escuchar?",
    [
      "Cantar su recorrido y ubicar su inicio",
      "Mirar inmediatamente la respuesta",
      "Tocar muchas teclas al azar",
    ],
    0,
    "Escuchá cuatro notas originales que no conozcas y reproducilas sin partitura. Repetí desde otro punto de partida y anotá si reconociste el contorno o todas las alturas.",
    "Reproducir motivos nuevos cortos sin consultar la respuesta visual.",
    "reflection",
  ),

  lesson(
    "ear",
    "eco-ritmico",
    1,
    "Eco rítmico con silencios",
    "Recordar cuándo no tocar también cuenta.",
    16,
    ["Ritmo", "Memoria", "Subdivisión"],
    [
      [
        "Separá altura y ritmo",
        "Usá una única nota para concentrarte en los ataques, duraciones y silencios. Cantá el patrón con una sílaba cómoda antes de tocarlo.",
      ],
      [
        "El pulso no se copia",
        "El pulso continúa durante los huecos; el ritmo selecciona momentos dentro de esa referencia. Marcá cuatro pulsos antes de intentar la respuesta.",
      ],
      [
        "Escuchá antes de leer",
        "Este patrón escrito es una preparación. En el reto apartá la vista, escuchá un patrón nuevo y repetilo: el objetivo es memoria auditiva, no descifrado de figuras.",
      ],
    ],
    score(
      "Ritmos de llamada",
      4,
      "Una altura, silencios y entradas entre pulsos.",
      ({ put }) => {
        [
          [0, 1],
          [1, 0.5],
          [1.5, 0.5],
          [3, 1],
          [4, 0.5],
          [5, 1],
          [6.5, 0.5],
          [7, 1],
          [8, 1.5],
          [9.5, 0.5],
          [11, 0.5],
          [11.5, 0.5],
          [12, 1],
          [14, 2],
        ].forEach(([t, d]) => put(60, t, d));
      },
    ),
    "Si hay un silencio de un pulso, la referencia temporal…",
    [
      "Continúa aunque no suene una nota",
      "Se detiene",
      "Se vuelve siempre más lenta",
    ],
    0,
    "Pedí o grabá tres patrones de dos compases. Escuchá uno, contá una entrada y repetilo en una sola tecla sin ver la notación.",
    "Reproducir patrones nuevos conservando silencios y subdivisiones.",
    "reflection",
  ),

  lesson(
    "ear",
    "acordes-cadencias-oido",
    2,
    "Escuchá acordes y cadencias",
    "La armonía también tiene dirección.",
    18,
    ["Tríadas", "Séptimas", "Cadencias"],
    [
      [
        "Calidad y posición son cosas distintas",
        "Un acorde mayor mantiene su calidad cuando cambia la inversión. Escuchá mayor y menor desde varios registros para distinguir la cualidad de la altura absoluta.",
      ],
      [
        "La séptima agrega una relación",
        "Compará una tríada con el acorde de séptima correspondiente. Escuchá la nota añadida y cómo se relaciona con el bajo, en lugar de usar solo una etiqueta de alegre o triste.",
      ],
      [
        "Llegada y continuación",
        "Escuchá V–I y después una llegada que no resuelve en I. La práctica visible familiariza el oído; la identificación real necesita ejemplos nuevos sin solución a la vista.",
      ],
    ],
    score(
      "Colores y llegadas",
      4,
      "Tríadas mayor/menor, dominante con séptima y resolución.",
      ({ chord, put }) => {
        chord([60, 64, 67], 0, 2);
        chord([60, 63, 67], 2, 2);
        chord([60, 64, 67, 71], 4, 4);
        chord([59, 62, 65, 67], 8, 4);
        chord([60, 64, 67], 12, 4);
        [48, 48, 43, 48].forEach((n, i) => put(n, i * 4, 4, "left"));
      },
    ),
    "Si invertís Do mayor, ¿qué pasa con su calidad mayor?",
    [
      "Se conserva",
      "Se convierte necesariamente en menor",
      "Desaparece la tercera",
    ],
    0,
    "Escuchá una progresión propia de cuatro acordes sin verla. Buscá su bajo, comprobá la llegada y tocá después una posible armonización.",
    "Distinguir calidad y función en ejemplos nuevos y comprobarlos tocando.",
    "reflection",
  ),

  lesson(
    "ear",
    "melodia-transportada",
    2,
    "Sacá una melodía y transportala",
    "Conservar relaciones cuando cambia la tónica.",
    20,
    ["Tocar de oído", "Transporte", "Grados"],
    [
      [
        "Encontrar el centro",
        "Escuchá una melodía corta y buscá una nota que se sienta como llegada. Probá el bajo para confirmar el centro antes de copiar todas las alturas.",
      ],
      [
        "Pensar en grados",
        "Convertí el motivo a relaciones: por ejemplo 1–2–3–5. Si cambia la tónica, esas funciones permanecen aunque cambien las teclas y las alteraciones.",
      ],
      [
        "Comprobar dos versiones",
        "La guía toca un motivo en Do y luego en Sol. Reconocé lo que se mantiene y lo que cambia; para la prueba auditiva elegí después un motivo que no hayas memorizado.",
      ],
    ],
    score(
      "La misma idea en Do y en Sol",
      4,
      "Dos versiones transportadas con sus bajos de referencia.",
      ({ line, put }) => {
        line([60, 62, 64, 67, 65, 64, 62, 60], 0);
        line([67, 69, 71, 74, 72, 71, 69, 67], 8);
        put(48, 0, 4, "left");
        put(48, 4, 4, "left");
        put(43, 8, 4, "left");
        put(43, 12, 4, "left");
      },
    ),
    "Al transportar un motivo 1–2–3–5, ¿qué se conserva?",
    [
      "Su relación con la nueva tónica",
      "Todas las alturas originales",
      "La misma armadura necesariamente",
    ],
    0,
    "Sacá de oído una melodía propia de cuatro compases. Escribí sus grados y tocala en dos tonalidades más sin seguir las teclas originales.",
    "Reproducir una melodía nueva y trasladarla a dos centros tonales.",
    "reflection",
  ),

  lesson(
    "improvisation",
    "impro-dos-notas",
    1,
    "Improvisá con dos notas y silencios",
    "Menos opciones dejan espacio para escuchar.",
    16,
    ["Improvisación", "Silencios", "Frases"],
    [
      [
        "Un marco pequeño",
        "Elegí Do y Sol sobre un bajo de Do. La restricción es un punto de partida, no una regla universal sobre qué notas están bien.",
      ],
      [
        "El ritmo lleva la idea",
        "Con dos alturas todavía podés variar entradas, duración, repetición y silencio. Probá dejar un compás vacío sin perder la referencia.",
      ],
      [
        "De ejemplo a creación",
        "La guía presenta una frase preparatoria concreta, que sí puede comparar nota por nota. Después abrí Improvisar y creá otra: repetir el ejemplo no mide creatividad.",
      ],
    ],
    score(
      "Dos alturas, muchas duraciones",
      4,
      "Ejemplo preparatorio; no representa una respuesta única de improvisación.",
      ({ put }) => {
        [
          [60, 0, 1],
          [67, 1, 2],
          [60, 4.5, 0.5],
          [67, 5.5, 0.5],
          [60, 7, 1],
          [67, 8, 3],
          [60, 12, 1],
          [67, 14, 1],
        ].forEach(([n, t, d]) => put(n, t, d));
        [0, 4, 8, 12].forEach((t) => put(48, t, 4, "left"));
      },
    ),
    "¿Qué puede variar aunque solo uses dos alturas?",
    [
      "El ritmo, las duraciones y los silencios",
      "Nada musical",
      "Solo el volumen",
    ],
    0,
    "En el laboratorio de improvisación, grabá ocho compases con dos alturas. Dejá al menos un espacio para respirar y escuchá si una idea se reconoce.",
    "Crear una toma propia con frases y silencios, y describir una decisión musical.",
    "reflection",
  ),

  lesson(
    "improvisation",
    "pregunta-respuesta-impro",
    1,
    "Pregunta y respuesta improvisada",
    "Dar continuidad sin repetir todo igual.",
    18,
    ["Llamada y respuesta", "Motivo", "Escucha"],
    [
      [
        "Dos funciones distintas",
        "Una pregunta puede dejar sensación de continuación; una respuesta puede completar o contrastar la idea. No hace falta que cada frase tenga exactamente las mismas notas.",
      ],
      [
        "Conservar un rasgo",
        "Probá conservar el ritmo y cambiar el final. Después conservá el contorno y cambiá las duraciones. Una relación audible suele dar más unidad que muchas notas nuevas.",
      ],
      [
        "Responder al tiempo",
        "La guía alterna una idea alta y una respuesta baja. En el laboratorio podés responder vos después del espacio acordado; el objetivo es escuchar la relación entre ambas.",
      ],
    ],
    score(
      "Pregunta arriba, respuesta abajo",
      4,
      "Diálogo preparatorio entre manos con espacio al final de cada frase.",
      ({ line, put }) => {
        line([60, 64, 67], 0, 1);
        line([55, 52, 48], 4, 1, "left");
        line([62, 65, 69], 8, 1);
        line([55, 50, 48], 12, 1, "left");
        put(48, 0, 3, "left");
        put(67, 4, 3);
        put(43, 8, 3, "left");
        put(60, 12, 3);
      },
    ),
    "¿Cómo podés relacionar una respuesta con su pregunta?",
    [
      "Conservando un rasgo y variando otro",
      "Cambiando todo sin escuchar",
      "Usando siempre más notas",
    ],
    0,
    "Improvisá dos compases de pregunta y dos de respuesta. Hacé tres versiones con finales distintos y elegí la que mejor complete la idea.",
    "Crear respuestas reconociblemente relacionadas y respetar el espacio temporal del diálogo.",
    "reflection",
  ),

  lesson(
    "improvisation",
    "variacion-motivo",
    2,
    "Variá un motivo sin perderlo",
    "Desarrollar una idea en vez de empezar de cero.",
    18,
    ["Desarrollo", "Variación", "Ritmo"],
    [
      [
        "Elegí algo recordable",
        "Inventá una célula de tres o cuatro notas. Si podés cantarla de nuevo, tenés un material claro para desarrollar.",
      ],
      [
        "Una variable por vez",
        "Repetí el motivo una altura más arriba, cambiá su último intervalo o desplazá la entrada medio pulso. Escuchá qué cambio conserva mejor la identidad.",
      ],
      [
        "Secuencia y transformación",
        "La guía muestra el motivo, una versión transportada y otra con entrada desplazada. Después compará con tu propia transformación en el laboratorio.",
      ],
    ],
    score(
      "Tres transformaciones de una idea",
      4,
      "Un motivo original se transporta, se desplaza y cambia su final.",
      ({ line, put }) => {
        line([60, 64, 67, 64], 0, 0.5);
        line([62, 65, 69, 65], 4, 0.5);
        line([60, 64, 67, 64], 8.5, 0.5);
        line([60, 64, 62, 60], 12, 0.5);
        [48, 50, 48, 48].forEach((n, i) => put(n, i * 4, 4, "left"));
      },
    ),
    "¿Qué suele ayudar a desarrollar una idea reconocible?",
    [
      "Cambiar un rasgo mientras conservás otros",
      "Evitar toda repetición",
      "Tocar la escala entera en cada compás",
    ],
    0,
    "Grabá un motivo y tres variaciones. Al escucharlos sin mirar, explicá qué relación conecta cada variación con la idea inicial.",
    "Producir y reconocer variaciones propias con una relación musical explícita.",
    "reflection",
  ),

  lesson(
    "improvisation",
    "pentatonica-armonia",
    2,
    "Pentatónica sobre cambios de acorde",
    "Una colección de notas no es todavía una frase.",
    20,
    ["Pentatónica", "Armonía", "Fraseo"],
    [
      [
        "Un conjunto para explorar",
        "La pentatónica mayor de Do usa Do Re Mi Sol La. Podés explorar su relación con Do y La menor, escuchando dónde descansa cada frase.",
      ],
      [
        "Las notas cambian de función",
        "Una misma nota puede ser estable sobre un acorde y crear tensión sobre otro. Escuchá el bajo antes de decidir el final de tu idea.",
      ],
      [
        "No convertir el marco en policía",
        "El laboratorio puede señalar notas del conjunto elegido, pero una nota exterior no es automáticamente un error musical. La guía siguiente es solo una preparación de coordinación.",
      ],
    ],
    score(
      "Pentatónica entre Do y La menor",
      4,
      "Melodía preparatoria sobre dos acordes alternados.",
      ({ line, chord }) => {
        [
          [48, 52, 55],
          [45, 48, 52],
          [48, 52, 55],
          [45, 48, 52],
        ].forEach((p, i) => chord(p, i * 4, 4, "left"));
        line([60, 62, 64, 67, 69, 67, 64, 62], 0, 0.5);
        line([69, 72, 69, 67], 4, 0.5);
        line([64, 67, 69, 67], 8, 0.5);
        line([64, 62, 60, 69], 12, 0.5);
      },
    ),
    "Una nota exterior a la pentatónica elegida es…",
    [
      "Una elección que debe escucharse en contexto",
      "Siempre un error musical",
      "Imposible de tocar",
    ],
    0,
    "Improvisá sobre Do y La menor. Probá terminar una frase en Mi y otra en La; explicá cómo cambia la sensación de llegada.",
    "Relacionar los finales de frase con los cambios armónicos sin depender de una secuencia fija.",
    "reflection",
  ),

  lesson(
    "improvisation",
    "notas-acorde-llegadas",
    3,
    "Llegá a una nota del acorde",
    "Conectar la melodía con la armonía que viene.",
    22,
    ["Notas objetivo", "Conducción", "Improvisación"],
    [
      [
        "Elegí la llegada antes del camino",
        "Sobre una progresión, elegí una nota del próximo acorde como destino. Después inventá una aproximación breve que llegue a tiempo.",
      ],
      [
        "Pocos movimientos, mucha conexión",
        "Las terceras y séptimas de ii–V–I pueden moverse por distancias pequeñas. Cantá esas voces para escuchar continuidad entre acordes.",
      ],
      [
        "Escalas al servicio de la línea",
        "La escala relacionada es una fuente de materiales. No reemplaza la escucha, el ritmo ni la conexión entre notas objetivo; una línea no necesita recorrer todos sus grados.",
      ],
    ],
    score(
      "Preparar las llegadas armónicas",
      4,
      "Dm7–G7–Cmaj7–Cmaj7 con aproximaciones escritas.",
      ({ put, line, chord }) => {
        chord([50, 53, 57], 0, 4, "left");
        chord([43, 47, 53], 4, 4, "left");
        chord([48, 52, 59], 8, 4, "left");
        chord([48, 52, 59], 12, 4, "left");
        put(65, 0, 2);
        line([67, 69, 71, 72], 2, 0.5);
        put(71, 4, 2);
        line([69, 67, 65, 63], 6, 0.5);
        put(64, 8, 2);
        line([67, 69, 71, 74], 10, 0.5);
        put(72, 12, 4);
      },
    ),
    "¿Qué aporta una nota objetivo del próximo acorde?",
    [
      "Un destino para conectar la frase con el cambio",
      "Una obligación de tocar toda la escala",
      "Eliminar toda tensión",
    ],
    0,
    "En Improvisar, elegí una nota de llegada por acorde. Tocá una toma con muchas pausas y otra con aproximaciones; escuchá si ambas comunican los mismos destinos.",
    "Planificar destinos armónicos y construir dos recorridos distintos hacia ellos.",
    "reflection",
  ),

  lesson(
    "improvisation",
    "blues-forma-solo",
    3,
    "Blues de doce compases y primer solo",
    "Sostener la forma mientras inventás.",
    24,
    ["Blues", "Forma", "Improvisación"],
    [
      [
        "La forma completa",
        "Una base habitual en Do tiene cuatro compases de I, dos de IV, dos de I, V, IV, I y V. Hay variantes: conocé la versión del acompañamiento antes de entrar.",
      ],
      [
        "Tres frases de cuatro",
        "Podés pensar una llamada, una repetición o variación y una respuesta. Contar la forma te permite dejar silencios sin perder dónde estás.",
      ],
      [
        "Preparación y aplicación",
        "La guía de ocho compases prepara I–IV y un cierre V–IV–I–V; no pretende ser la forma completa de doce. Armá después los doce en el laboratorio y grabá al menos una vuelta entera.",
      ],
    ],
    score(
      "Preparación para la vuelta de blues",
      8,
      "Ocho compases de coordinación; la forma completa de doce se aplica en el reto.",
      ({ line, chord }) => {
        const roots = [36, 36, 41, 36, 43, 41, 36, 43];
        roots.forEach((r, i) => {
          chord([r, r + 4, r + 10], i * 4, 2, "left");
          chord([r, r + 4, r + 10], i * 4 + 2, 2, "left");
          line(i % 2 ? [67, 66, 65, 63] : [60, 63, 65, 66], i * 4, 0.5);
        });
      },
    ),
    "¿Qué permite dejar silencios sin perder la forma del blues?",
    [
      "Conocer y contar sus cambios de compás",
      "Tocar sin parar",
      "Repetir una escala hasta el final",
    ],
    0,
    "En Improvisar, seleccioná la base de blues de doce compases. Grabá una vuelta completa y señalá sus tres frases; no evalúes creatividad por cantidad de notas.",
    "Completar una vuelta real de doce compases y ubicar I, IV, V y el retorno.",
    "reflection",
  ),

  lesson(
    "harmony",
    "armonizar-i-iv-v",
    1,
    "Armonizá con I, IV y V",
    "Elegir un apoyo para cada fragmento melódico.",
    18,
    ["Funciones", "Armonización", "Tonalidad"],
    [
      [
        "Tres apoyos básicos",
        "En Do mayor, I es Do–Mi–Sol, IV es Fa–La–Do y V es Sol–Si–Re. Tocá y escuchá cada uno antes de combinarlos.",
      ],
      [
        "Relacioná melodía y acorde",
        "Buscá notas compartidas y escuchá cómo funciona la frase. No toda nota melódica tiene que pertenecer al acorde: puede pasar entre notas estables.",
      ],
      [
        "Varias respuestas posibles",
        "El ejemplo propone una armonización concreta para practicar dos manos. Otra solución puede ser válida; el evaluador de esta partitura compara esta versión, no todas las posibilidades musicales.",
      ],
    ],
    score(
      "Una melodía, tres funciones",
      4,
      "Armonización escrita I–IV–V–I.",
      ({ line, chord }) => {
        line([64, 67, 72, 67, 69, 72, 69, 65, 67, 71, 74, 71, 72, 67, 64, 60]);
        [
          [48, 52, 55],
          [53, 57, 60],
          [43, 47, 50],
          [48, 52, 55],
        ].forEach((p, i) => chord(p, i * 4, 4, "left"));
      },
    ),
    "¿Todas las notas de una melodía deben pertenecer al acorde que suena?",
    [
      "No; también puede haber notas de paso y otras relaciones",
      "Sí, sin excepciones",
      "Solo si está en Do mayor",
    ],
    0,
    "Inventá una melodía de cuatro compases y probá dos armonizaciones con I, IV y V. Elegí escuchando la dirección de la frase.",
    "Relacionar una melodía propia con funciones y justificar dos soluciones diferentes.",
    "reflection",
  ),

  lesson(
    "harmony",
    "inversiones-conduccion",
    2,
    "Inversiones que conectan",
    "Mantener notas comunes y mover lo necesario.",
    20,
    ["Inversiones", "Conducción", "Acordes"],
    [
      [
        "Mirá cada voz",
        "Entre dos acordes, seguí cada nota hacia su destino. Algunas pueden quedarse y otras moverse por grado conjunto; eso permite una textura más conectada.",
      ],
      [
        "La inversión no cambia la función por sí sola",
        "Elegir otra nota en el bajo modifica la sonoridad y el movimiento, pero no transforma automáticamente un acorde mayor en menor.",
      ],
      [
        "Una realización, varias opciones",
        "La guía fija disposiciones cercanas para que practiques sus enlaces. Después buscá otras; compará distancia, comodidad y dirección del bajo.",
      ],
    ],
    score(
      "Acordes con pocos desplazamientos",
      4,
      "C–Am–F–G con disposiciones cercanas y bajo independiente.",
      ({ chord, put }) => {
        [
          [60, 64, 67],
          [60, 64, 69],
          [60, 65, 69],
          [59, 62, 67],
        ].forEach((p, i) => chord(p, i * 4, 4));
        [48, 45, 53, 43].forEach((n, i) => put(n, i * 4, 4, "left"));
      },
    ),
    "¿Qué facilita una conducción conectada?",
    [
      "Conservar notas comunes y considerar el destino de cada voz",
      "Llevar todos los acordes a una octava nueva",
      "Eliminar siempre el bajo",
    ],
    0,
    "Escribí o tocá otras inversiones para la misma progresión. Compará cuánto viaja cada voz y cuál versión deja más clara la melodía.",
    "Ejecutar enlaces cercanos y proponer otra disposición con notas comunes identificadas.",
  ),

  lesson(
    "harmony",
    "cifrado-lead-sheets",
    2,
    "Del cifrado al teclado",
    "Un símbolo deja decisiones en tus manos.",
    20,
    ["Cifrado americano", "Lead sheet", "Acompañamiento"],
    [
      [
        "Desarmá el símbolo",
        "En Dm7, D indica Re, m indica menor y 7 agrega la séptima correspondiente. En G7, sin m, aparece un acorde mayor con séptima menor.",
      ],
      [
        "Bajo indicado",
        "En C/E, la barra indica Mi en el bajo. No significa un acorde de Do dividido por Mi; permite distinguir la disposición y el recorrido del bajo.",
      ],
      [
        "El cifrado no escribe toda la textura",
        "Una lead sheet suele mostrar melodía y símbolos. Elegí registro, inversión, ritmo y densidad según el estilo. La guía ofrece una realización preparatoria explícita.",
      ],
    ],
    score(
      "Realización de Dm7–G7–C/E–C",
      4,
      "Ejemplo escrito de un cifrado; otras disposiciones pueden ser musicales.",
      ({ chord, put, line }) => {
        [
          [60, 65, 69],
          [59, 65, 67],
          [60, 64, 67],
          [60, 64, 67],
        ].forEach((p, i) => chord(p, i * 4 + 1, 2));
        [50, 43, 52, 48].forEach((n, i) => put(n, i * 4, 4, "left"));
        line([77, 76, 74, 72], 0, 4, "right", 1);
      },
    ),
    "En C/E, la barra indica…",
    [
      "Mi en el bajo de un acorde de Do",
      "Dos acordes obligatoriamente alternados",
      "Cambiar a Mi mayor",
    ],
    0,
    "Tomá una lead sheet autorizada y realizá primero solo bajos; después agregá acordes cercanos y finalmente melodía. No necesitas copiar una disposición única.",
    "Traducir cifrados y bajos indicados a una realización propia con pulso estable.",
  ),

  lesson(
    "harmony",
    "patrones-estilo",
    2,
    "Un cifrado, tres acompañamientos",
    "La textura cambia el carácter de la canción.",
    22,
    ["Arreglos", "Patrones", "Estilo"],
    [
      [
        "Bloques para escuchar la armonía",
        "Tocá primero un acorde por compás. Así comprobás las funciones y tenés una referencia sencilla antes de repartir las notas.",
      ],
      [
        "Arpegio y pulso",
        "Después desplegá el mismo acorde en corcheas. Conservá la armonía y la duración del compás mientras cambia la textura.",
      ],
      [
        "Bajo y respuesta",
        "Una tercera versión alterna bajo y acordes cortos. La guía combina las tres texturas en una secuencia; el reto consiste en aplicarlas a una misma progresión completa.",
      ],
    ],
    score(
      "Tres texturas de acompañamiento",
      6,
      "Acordes largos, arpegios y bajo con respuesta sobre C–G.",
      ({ chord, line, put }) => {
        chord([48, 52, 55], 0, 4, "left");
        chord([43, 47, 50], 4, 4, "left");
        line([48, 55, 52, 55, 48, 55, 52, 55], 8, 0.5, "left");
        line([43, 50, 47, 50, 43, 50, 47, 50], 12, 0.5, "left");
        [16, 20].forEach((t, i) => {
          put(i ? 43 : 48, t, 1, "left");
          chord(i ? [47, 50, 55] : [48, 52, 55], t + 1, 1, "left");
          put(i ? 43 : 48, t + 2, 1, "left");
          chord(i ? [47, 50, 55] : [48, 52, 55], t + 3, 1, "left");
        });
        line([72, 71, 69, 67, 72, 71, 69, 67, 72, 71, 69, 67], 0, 2);
      },
    ),
    "Si pasás un acorde de bloque a arpegio, ¿qué puede conservarse?",
    [
      "La armonía mientras cambia la textura",
      "Solo el número de dedos",
      "La obligación de tocar más fuerte",
    ],
    0,
    "Acompañá una progresión de cuatro acordes en tres versiones: bloques, arpegios y bajo/acorde. Grabá las tres con el mismo tempo para compararlas.",
    "Mantener armonía y forma al cambiar entre tres patrones de acompañamiento.",
  ),

  lesson(
    "harmony",
    "septimas-dominantes",
    3,
    "Séptimas y dominantes que conducen",
    "Preparar una llegada sin abandonar el hilo.",
    22,
    ["ii–V–I", "Dominante secundario", "Séptimas"],
    [
      [
        "Funciones en cadena",
        "En Do, Dm7–G7–Cmaj7 conecta ii, V e I. Escuchá las terceras y séptimas como líneas que se mueven, no solo como cuatro notas apiladas.",
      ],
      [
        "Una llegada temporal",
        "A7 puede preparar Dm: Do♯ conduce hacia Re. Es un dominante secundario si refuerza esa llegada dentro del contexto, sin exigir por sí solo una modulación completa.",
      ],
      [
        "Separar análisis y realización",
        "Nombrá cada función y después elegí su disposición. La práctica fija una versión a dos manos; la comprensión se muestra al transportarla y crear otra distribución.",
      ],
    ],
    score(
      "A7–Dm7–G7–Cmaj7",
      4,
      "Dominante secundario y cadena ii–V–I en Do.",
      ({ chord, put }) => {
        [
          [61, 64, 67],
          [60, 65, 69],
          [59, 65, 67],
          [59, 64, 67],
        ].forEach((p, i) => chord(p, i * 4, 4));
        [45, 50, 43, 48].forEach((n, i) => put(n, i * 4, 4, "left"));
      },
    ),
    "En Do mayor, A7 puede funcionar como…",
    [
      "Dominante de Re menor",
      "Tónica de Do sin alteraciones",
      "Un acorde que obliga a terminar en La",
    ],
    0,
    "Transportá ii–V–I a Fa y Sol. Después agregá el dominante del ii y cantá la nota que resuelve por semitono.",
    "Reconocer y ejecutar la cadena en varias tonalidades, explicando sus llegadas.",
  ),

  lesson(
    "harmony",
    "arreglo-tres-texturas",
    3,
    "Diseñá tu primer arreglo completo",
    "Elegir una textura según la sección.",
    26,
    ["Arreglo", "Forma", "Textura"],
    [
      [
        "Una idea central",
        "Elegí una melodía propia o una obra que tengas permiso de usar. Anotá su forma, los acordes y el punto de mayor intensidad antes de agregar notas.",
      ],
      [
        "No llenar todos los espacios",
        "Una introducción puede ser escasa, una sección central más móvil y una vuelta más clara. La densidad es una elección; un arreglo no mejora automáticamente por ser más difícil.",
      ],
      [
        "Probar y revisar",
        "La guía integra bajos, arpegios y acordes en ocho compases originales. Usala como modelo de planificación y después creá una distribución distinta para tu proyecto.",
      ],
    ],
    score(
      "Arreglo breve en secciones",
      8,
      "Introducción, textura móvil y cierre con acordes.",
      ({ line, put, chord }) => {
        const melody = [72, 71, 69, 67, 69, 72, 74, 72, 76, 74, 72, 71, 69, 67];
        line(melody, 0, 2);
        put(72, 28, 4);
        [48, 45].forEach((n, i) => put(n, i * 4, 4, "left"));
        [
          progression[2],
          progression[3],
          progression[0],
          progression[1],
        ].forEach((p, i) => {
          const [a, b, c] = p.chord.map((n) => n - 12);
          line([a, c, b, c, a, c, b, c], 8 + i * 4, 0.5, "left");
        });
        chord([43, 47, 53], 24, 4, "left");
        chord([48, 52, 55], 28, 4, "left");
      },
    ),
    "¿Qué conviene decidir antes de aumentar la densidad de un arreglo?",
    [
      "Qué función cumple cada sección y qué voz querés destacar",
      "Cuántas notas máximas admite el teclado",
      "Que ambas manos hagan siempre lo mismo",
    ],
    0,
    "Prepará una versión de al menos tres secciones, con melodía propia o autorizada. Guardá dos tomas y justificá un cambio que mejoró claridad o dirección.",
    "Crear un arreglo con forma, contraste de texturas y decisiones revisadas por autoescucha.",
    "reflection",
  ),

  lesson(
    "study",
    "analizar-antes",
    1,
    "Analizá antes de poner las manos",
    "Un minuto de mapa puede orientar todo el estudio.",
    16,
    ["Planificación", "Análisis", "Lectura"],
    [
      [
        "Inventario rápido",
        "Mirá tonalidad, compás, rango, figuras, silencios y cambios de textura. Comprobá que tu teclado tenga las notas necesarias antes de empezar.",
      ],
      [
        "Elegí un objetivo concreto",
        "En lugar de repetir toda la pieza, decidí si hoy trabajarás un enlace, la lectura de una voz o el ritmo de un compás. Un objetivo observable permite saber cuándo terminaste.",
      ],
      [
        "Una primera toma informativa",
        "Tocá el estudio a un tempo cómodo y anotá dónde cambió tu seguridad. Esa toma sirve para elegir un fragmento de trabajo; no para concluir que toda la obra está dominada.",
      ],
    ],
    score(
      "Un mapa de cuatro compases",
      4,
      "Cambio de textura y silencios para planificar antes de tocar.",
      ({ line, put, chord }) => {
        line([60, 64, 67, 72], 0);
        put(71, 4, 2);
        put(69, 7, 1);
        chord([65, 69, 72], 8, 2);
        chord([62, 67, 71], 10, 2);
        put(72, 12, 4);
        [48, 45, 43, 48].forEach((n, i) => put(n, i * 4, 4, "left"));
      },
    ),
    "¿Cuál es un objetivo de estudio observable?",
    [
      "Unir los compases 2 y 3 sin detener el pulso",
      "Tocar mejor en general",
      "Llegar a avanzado hoy",
    ],
    0,
    "Antes de abrir la práctica de una pieza, escribí un objetivo y comprobá su registro. Al terminar, guardá una toma que muestre qué cambió.",
    "Definir y revisar un objetivo concreto usando evidencia de una toma.",
    "reflection",
  ),

  lesson(
    "study",
    "digitacion-secciones",
    2,
    "Digitación y secciones con sentido",
    "Dividir para resolver, sin perder la frase.",
    18,
    ["Digitación", "Fragmentación", "Práctica"],
    [
      [
        "Elegí una solución repetible",
        "Probá una digitación lenta y observá si permite llegar a la nota siguiente sin tensión. No cambies dedos al azar en cada repetición.",
      ],
      [
        "Fragmentos que se solapan",
        "Trabajá unos pulsos y agregá la transición siguiente. Si siempre detenés la mano en la barra, podés aprender una pausa que la música no tiene.",
      ],
      [
        "Reuní el contexto",
        "Después de resolver el detalle, tocá una sección mayor. La guía contiene cambios de posición entre compases: prepará el destino antes de llegar.",
      ],
    ],
    score(
      "Posiciones y enlaces",
      4,
      "Cambios de posición al comienzo de cada compás.",
      ({ line, put }) => {
        line([60, 62, 64, 67, 69, 71, 72, 76, 74, 72, 71, 67, 65, 64, 62, 60]);
        [48, 45, 43, 48].forEach((n, i) => put(n, i * 4, 4, "left"));
      },
    ),
    "¿Por qué conviene solapar fragmentos al estudiar?",
    [
      "Para aprender también las transiciones",
      "Para evitar tocar los finales",
      "Para cambiar de digitación siempre",
    ],
    0,
    "Elegí una transición difícil. Practicá dos pulsos antes y dos después, conservando la digitación elegida, y luego reintegrala a la frase.",
    "Resolver una transición y conservarla al ampliar el contexto; la digitación se observa, no se infiere por MIDI.",
    "reflection",
  ),

  lesson(
    "study",
    "enlaces-compases",
    2,
    "Practicá el enlace entre compases",
    "El problema a veces está entre dos lugares correctos.",
    18,
    ["Enlaces", "Anticipación", "Continuidad"],
    [
      [
        "Localizá la frontera",
        "Si cada compás sale solo pero la unión falla, no hace falta repetirlos enteros una y otra vez. El objetivo es el movimiento que une final e inicio.",
      ],
      [
        "Construí un pequeño puente",
        "Tocá la última nota del compás anterior y la primera del siguiente. Agregá después una nota a cada lado mientras conservás el mismo pulso.",
      ],
      [
        "Comprobá el resultado real",
        "Volvé a la sección completa después de unas repeticiones buenas. Si reaparece la pausa, revisá la anticipación del destino y elegí un tempo menor.",
      ],
    ],
    score(
      "Puentes de un compás al siguiente",
      4,
      "La derecha cambia de registro; los bajos marcan las fronteras.",
      ({ line, put }) => {
        line([60, 64, 67, 71, 72, 76, 74, 71, 69, 65, 64, 62, 60, 64, 67], 0);
        put(72, 15, 1);
        [48, 52, 53, 48].forEach((n, i) => put(n, i * 4, 4, "left"));
      },
    ),
    "Si dos compases salen por separado pero falla su unión, ¿qué practicás primero?",
    [
      "El último gesto de uno y el primero del siguiente",
      "Toda la pieza más rápido",
      "Solo el primer compás desde el principio",
    ],
    0,
    "Usá la selección de compases para repetir una frontera. Después ejecutá los cuatro compases y comprobá que no agregaste una espera en la barra.",
    "Conservar una transición resuelta dentro de una toma más amplia.",
  ),

  lesson(
    "study",
    "tempo-recuperacion",
    2,
    "Escalera de tempo y recuperación",
    "Aumentar velocidad sin entrenar el error.",
    20,
    ["Tempo", "Práctica deliberada", "Recuperación"],
    [
      [
        "Un escalón razonable",
        "Elegí un tempo con margen para mirar y escuchar. Subí poco después de varias tomas estables, no después de una pasada afortunada.",
      ],
      [
        "Si falla, investigá",
        "Un error repetido pide aislar el movimiento, revisar lectura o bajar el tempo. Repetir con más fuerza o apuro rara vez aclara qué está pasando.",
      ],
      [
        "Ensayo y estudio tienen reglas distintas",
        "En estudio podés parar para corregir. En una toma de concierto ensayá recuperarte en el siguiente pulso o sección; registrá el error y volvé después.",
      ],
    ],
    score(
      "Continuidad con corcheas",
      4,
      "Patrones breves que cambian de posición sin detener el acompañamiento.",
      ({ line, put }) => {
        [
          [60, 62, 64, 65, 67, 65, 64, 62],
          [64, 65, 67, 69, 71, 69, 67, 65],
          [62, 64, 65, 67, 69, 67, 65, 62],
          [60, 64, 67, 72, 71, 67, 64, 60],
        ].forEach((p, i) => line(p, i * 4, 0.5));
        [48, 45, 43, 48].forEach((n, i) => put(n, i * 4, 4, "left"));
      },
    ),
    "¿Cuándo conviene subir un escalón de tempo?",
    [
      "Después de varias tomas cómodas y estables",
      "Después de cualquier toma, aunque tenga pausas",
      "Cuando necesitás más fuerza para llegar",
    ],
    0,
    "Registrá tres tempos: cómodo, de trabajo y objetivo. Hacé una toma completa al de trabajo y anotá cómo recuperaste el pulso si hubo un error.",
    "Mejorar continuidad con incrementos pequeños y distinguir ensayo completo de corrección aislada.",
  ),

  lesson(
    "study",
    "memoria-concierto",
    3,
    "Memoria y ensayo de concierto",
    "Tener más de un camino para recordar.",
    24,
    ["Memoria", "Escenario", "Forma"],
    [
      [
        "Memoria en varias capas",
        "Relacioná lo que recordás por movimiento con el sonido, la armonía y la forma. Depender únicamente de empezar desde la primera nota hace frágil la recuperación.",
      ],
      [
        "Puntos de entrada",
        "Elegí comienzos de secciones y cadencias como lugares desde los que podés retomar. Probá entrar después de una pausa sin recorrer mentalmente toda la pieza.",
      ],
      [
        "Una toma con principio y final",
        "Prepará el espacio, decidí la entrada y ejecutá sin editar. Después escuchá el conjunto antes de anotar detalles: el ensayo de concierto también aprende continuidad y comunicación.",
      ],
    ],
    score(
      "Dos secciones para recordar",
      8,
      "Material contrastante y regreso; elegí puntos de entrada cada dos compases.",
      ({ line, put }) => {
        line(
          [60, 64, 67, 72, 71, 67, 64, 60, 69, 72, 76, 72, 71, 69, 67, 64],
          0,
        );
        line([65, 69, 72, 76, 74, 71, 67, 62, 64, 67, 72, 71, 69, 67], 16);
        put(60, 30, 2);
        [48, 48, 45, 43, 53, 43, 48, 48].forEach((n, i) =>
          put(n, i * 4, 4, "left"),
        );
      },
    ),
    "¿Qué fortalece la recuperación de memoria?",
    [
      "Poder comenzar desde varios puntos y entender la forma",
      "Repetir siempre solo desde la primera nota",
      "Evitar escuchar la armonía",
    ],
    0,
    "Prepará cuatro puntos de entrada y pedile a alguien que elija uno. Después grabá una toma completa, escuchala y elegí un solo objetivo para revisar.",
    "Comenzar desde distintos puntos y completar una toma con una revisión musical concreta.",
    "reflection",
  ),

  lesson(
    "study",
    "proyecto-integrador",
    3,
    "Tu proyecto: interpretar, arreglar e improvisar",
    "Usar las herramientas para hacer música propia.",
    30,
    ["Proyecto", "Autonomía", "Integración"],
    [
      [
        "Tres evidencias diferentes",
        "Prepará una obra leída, un arreglo de una melodía propia o autorizada y una improvisación breve. Cada actividad revela habilidades que una sola canción no demuestra.",
      ],
      [
        "Elegí alcance y medios",
        "Anotá registro del teclado, pedal disponible, duración, tonalidad y dificultad de cada proyecto. Adaptar explícitamente es mejor que ocultar notas que tu instrumento no tiene.",
      ],
      [
        "Presentá y revisá",
        "Grabá versiones completas, guardá el plan de estudio y describí una decisión de fraseo, otra de armonía y otra de forma. La guía integradora es preparación: terminarla no certifica dominio avanzado universal.",
      ],
    ],
    score(
      "Estudio integrador original",
      8,
      "Arpegios, voces largas, síncopas y cierre para preparar tu proyecto propio.",
      ({ line, put, chord }) => {
        line([72, 71, 69, 67], 0, 2);
        [
          [48, 55, 52, 55, 48, 55, 52, 55],
          [45, 52, 48, 52, 45, 52, 48, 52],
        ].forEach((p, i) => line(p, i * 4, 0.5, "left"));
        line([65, 67, 69, 72, 71, 69, 67, 64], 8);
        line([53, 52, 50, 48], 8, 2, "left");
        [
          [16.5, 64],
          [17.5, 67],
          [18.5, 69],
          [19.5, 67],
          [20.5, 65],
          [21.5, 64],
          [22.5, 62],
          [23.5, 67],
        ].forEach(([t, n]) => put(n, t, 0.5));
        put(48, 16, 4, "left");
        put(43, 20, 4, "left");
        line([71, 72, 74, 71], 24);
        chord([60, 64, 67, 72], 28, 4);
        chord([43, 47, 53], 24, 4, "left");
        chord([48, 52, 55], 28, 4, "left");
      },
    ),
    "¿Qué demuestra completar el proyecto de Clavia?",
    [
      "Evidencia concreta de lo trabajado, con nuevas metas por delante",
      "Un título oficial de conservatorio",
      "Que ya no necesitás escuchar ni estudiar",
    ],
    0,
    "Guardá tus tres proyectos y una reflexión breve. Elegí la siguiente meta según la evidencia: lectura nueva, coordinación, estilo, oído o creación; buscá devolución docente para aspectos que MIDI no observa.",
    "Presentar tres proyectos completos con decisiones y próximos objetivos documentados.",
    "reflection",
  ),
];
