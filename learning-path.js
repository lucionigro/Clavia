// Un único orden para el curso, el inicio, el plan diario y la continuación.
// Los IDs se conservan para mantener el progreso de versiones anteriores.
export const courseChapters = [
  {
    title: "Ubicate y tocá tus primeras notas",
    level: 0,
    description:
      "Encontrá Do, acomodá las manos y tocá cinco notas con un pulso simple.",
    ids: ["mapa", "postura", "cinco", "pulso", "figuras"],
  },
  {
    title: "De una melodía a las dos manos",
    level: 0,
    description:
      "Terminá una melodía, sumá la izquierda y reconocé lo que escuchás.",
    ids: [
      "primera-melodia",
      "izquierda",
      "am-cinco-dedos-dos-manos",
      "am-cantar-encontrar",
      "semitonos",
    ],
  },
  {
    title: "Leé notas y duraciones",
    level: 1,
    description:
      "Pasá de las teclas al pentagrama y aprendé a dividir y sostener el pulso.",
    ids: [
      "sol",
      "fa",
      "am-lectura-intervalica",
      "corcheas",
      "am-silencios-puntillos-ligaduras",
      "am-eco-ritmico",
    ],
  },
  {
    title: "Conectá escalas, oído y pequeñas ideas",
    level: 1,
    description:
      "Construí desde Do mayor; escuchá distancias y respondé con pocas notas.",
    ids: [
      "escala-do",
      "am-familias-escalas-mayores",
      "am-armaduras-alteraciones",
      "intervalos",
      "am-intervalos-direcciones",
      "am-eco-melodico",
      "am-impro-dos-notas",
      "am-pregunta-respuesta-impro",
    ],
  },
  {
    title: "Acompañá tu primera pieza",
    level: 1,
    description:
      "Uní acordes, manos y frases. Cerrá las bases con un pequeño concierto.",
    ids: [
      "triadas",
      "manos",
      "am-armonizar-i-iv-v",
      "am-dos-voces-escucha",
      "am-frases-cadencias",
      "am-analizar-antes",
      "estudio-inicial",
    ],
  },
  {
    title: "Ampliá tus escalas y acordes",
    level: 2,
    description:
      "Explorá otras tonalidades y enlazá acordes antes de extender los arpegios.",
    ids: [
      "tonalidades",
      "menores",
      "am-tres-formas-menor",
      "am-movimiento-contrario",
      "funciones",
      "inversiones",
      "am-inversiones-conduccion",
      "arpegios",
      "am-arpegios-dos-octavas",
    ],
  },
  {
    title: "Sostené el ritmo y desarrollá motivos",
    level: 2,
    description:
      "Trabajá compases y síncopas; usá ese pulso para leer e imitar una idea.",
    ids: [
      "am-agrupacion-compases",
      "sincopa",
      "am-sincopas-reales",
      "am-primera-vista-continua",
      "am-imitacion-motivo",
      "am-secuencias-motivo",
      "am-articulaciones-independientes",
    ],
  },
  {
    title: "Dale forma a una interpretación",
    level: 2,
    description:
      "Separá melodía y acompañamiento, reconocé la forma y estudiá sus enlaces.",
    ids: [
      "am-bajo-alberti",
      "am-melodia-acompanamiento",
      "expresion",
      "am-forma-aba-sonatina",
      "am-digitacion-secciones",
      "am-enlaces-compases",
      "am-tempo-recuperacion",
    ],
  },
  {
    title: "Del oído a tu propio acompañamiento",
    level: 2,
    description:
      "Escuchá cadencias, transportá melodías y creá sobre acordes que ya conocés.",
    ids: [
      "am-acordes-cadencias-oido",
      "am-melodia-transportada",
      "pentatonica",
      "am-variacion-motivo",
      "am-pentatonica-armonia",
      "septimas",
      "am-cifrado-lead-sheets",
      "am-patrones-estilo",
    ],
  },
  {
    title: "Ganá independencia y expresión",
    level: 3,
    description:
      "Prepará saltos, voces independientes y recursos expresivos con control.",
    ids: [
      "tecnica-avanzada",
      "am-saltos-posicion",
      "am-ornamentos-preparacion",
      "polirritmia",
      "am-invencion-dos-voces",
      "am-cantabile-balance",
      "am-pedal-rubato",
    ],
  },
  {
    title: "Construí tu lenguaje armónico",
    level: 3,
    description:
      "Conectá séptimas y dominantes; aplicá esos enlaces a solos y blues.",
    ids: [
      "ii-v-i",
      "am-septimas-dominantes",
      "dominantes",
      "extensiones",
      "modos",
      "am-notas-acorde-llegadas",
      "blues",
      "am-blues-forma-solo",
    ],
  },
  {
    title: "Prepará y compartí tu proyecto",
    level: 3,
    description:
      "Elegí una obra, diseñá el arreglo y prepará una interpretación completa.",
    ids: [
      "analisis",
      "am-arreglo-tres-texturas",
      "proyecto",
      "am-memoria-concierto",
      "am-proyecto-integrador",
    ],
  },
];
export const chapterForLesson = (id) =>
  courseChapters.find((c) => c.ids.includes(id));
export const nextPathLesson = (state, lessons) =>
  lessons.find((l) => !state.completed.includes(l.id));
