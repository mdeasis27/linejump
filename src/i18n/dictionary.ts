import type { Flag } from "../engine/types";

export const LOCALES = ["en", "es"] as const;
export type Lang = (typeof LOCALES)[number];

export const isLang = (s: string): s is Lang => (LOCALES as readonly string[]).includes(s);

export type FlagContext = { hours: number; count: number; domain: string; other: string };

export type Dictionary = {
  meta: { title: string; oneLiner: string };
  allProjects: string;
  language: string;
  hero: { chips: string[] };
  analogy: {
    title: string;
    body: string;
    glossaryTitle: string;
    terms: { term: string; def: string }[];
  };
  tryIt: {
    title: string;
    intro: string;
    replay: string;
    play: string;
    pause: string;
    stepBack: string;
    stepForward: string;
    reset: string;
    speed: string;
    progress: (done: number, total: number) => string;
    queue: string;
    position: string;
    person: string;
    code: string;
    link: string;
    copy: string;
    copied: string;
    yourPosition: (p: number) => string;
    selectPerson: string;
    noPosition: string;
    tabQueue: string;
    tabAdmin: string;
    tabOutbox: string;
    addTitle: string;
    email: string;
    refCode: string;
    ip: string;
    add: string;
    burst: string;
    clearMine: string;
    errEmail: string;
    validRefs: string;
    rank: string;
    flags: string;
    none: string;
    outboxEmpty: string;
    outboxSubject: string;
    movedUp: (from: number, to: number) => string;
    outboxDemo: string;
    liveSent: string;
    log: string;
    duplicateOf: (email: string) => string;
  };
  flagName: Record<Flag, string>;
  flagWhy: Record<Flag, (c: FlagContext) => string>;
  compare: {
    title: string;
    intro: string;
    naive: string;
    linejump: string;
    signups: string;
    duplicates: string;
    flagged: string;
    byType: string;
    jump: (n: number) => string;
    jumpNone: string;
    evalScore: string;
    evalDetail: (cases: number, f1: string, pos: string) => string;
    rowTopPositionNaive: string;
  };
  fits: {
    title: string;
    worth: string;
    worthItems: string[];
    notNeeded: string;
    notNeededItems: string[];
  };
  proves: { title: string; body: string };
  engineers: {
    summary: string;
    mechanism: string;
    mechanismItems: (r: {
      bonus: number;
      ipHours: number;
      burstMin: number;
      burstCount: number;
      code: number;
    }) => string[];
    testing: string;
    testingItems: string[];
    stack: string;
    repo: string;
  };
};

export const en: Dictionary = {
  meta: {
    title: "Linejump",
    oneLiner: "A launch waitlist where referrals move you up, and cheaters don't.",
  },
  allProjects: "← All projects",
  language: "Language",
  hero: { chips: ["Waitlist", "Referral fraud checks", "Runs with no setup", "EN / ES"] },
  analogy: {
    title: "Think of a queue for concert tickets",
    body: "Imagine a line outside a venue. If you bring friends, the staff lets you step forward. That is fair, until someone brings the same friend five times, or ten friends who all arrived in one van. I check every friend you bring, and only the real ones count.",
    glossaryTitle: "Four words I use",
    terms: [
      {
        term: "Referral code",
        def: "A short code that is yours alone. Friends type it to say you sent them.",
      },
      {
        term: "Valid referral",
        def: "A friend who passed every check. Each one moves you up five places.",
      },
      { term: "Flag", def: "A reason I did not trust a referral, like a throwaway email." },
      { term: "Position", def: "Your place in line right now, starting at 1." },
    ],
  },
  tryIt: {
    title: "Try it",
    intro:
      "Replay a small made-up signup log, or add your own people. Try signing up twice with a dotted or plus address and watch it get caught.",
    replay: "Replay",
    play: "Play",
    pause: "Pause",
    stepBack: "Step back",
    stepForward: "Step forward",
    reset: "Reset replay",
    speed: "Speed",
    progress: (d, t) => `${d} of ${t} signups processed`,
    queue: "Queue",
    position: "Position",
    person: "Person",
    code: "Code",
    link: "Share link",
    copy: "Copy link",
    copied: "Copied",
    yourPosition: (p) => `Position ${p}`,
    selectPerson: "Pick someone in the queue to see their code and link.",
    noPosition: "Rejected as a duplicate, so no place in the queue.",
    tabQueue: "Queue",
    tabAdmin: "Admin view",
    tabOutbox: "Outbox",
    addTitle: "Add a signup",
    email: "Email",
    refCode: "Referral code (optional)",
    ip: "IP address",
    add: "Add signup",
    burst: "Simulate a burst of six",
    clearMine: "Remove my signups",
    errEmail: "Enter an email address.",
    validRefs: "Valid referrals",
    rank: "Rank",
    flags: "Flags",
    none: "none",
    outboxEmpty: "Nothing sent yet. Someone has to refer a real friend first.",
    outboxSubject: "You moved up",
    movedUp: (f, t) =>
      `Good news, a friend you referred counted. You moved from place ${f} to place ${t}.`,
    outboxDemo: "Demo mode: messages stay on this screen and no email is sent.",
    liveSent: "Sent by email",
    log: "Signup log",
    duplicateOf: (e) => `Same person as ${e}`,
  },
  flagName: {
    duplicate: "duplicate",
    unknown_ref: "unknown_ref",
    disposable: "disposable",
    same_ip: "same_ip",
    burst: "burst",
  },
  flagWhy: {
    duplicate: (c) => `This email is the same person as ${c.other} once aliases are removed.`,
    unknown_ref: () => "No one who joined earlier has this referral code.",
    disposable: (c) => `The domain ${c.domain} is on the throwaway list.`,
    same_ip: (c) =>
      `Same IP address as the referrer, ${c.hours.toFixed(1)} hours after they joined (the limit is 24).`,
    burst: (c) => `${c.count} signups used this code within 10 minutes (the limit is 5).`,
  },
  compare: {
    title: "Compare",
    intro: "Both queues below are built from the same committed log, computed live by the product.",
    naive: "Counting every referral",
    linejump: "Linejump",
    signups: "Accepted signups",
    duplicates: "Duplicates caught",
    flagged: "Referrals not counted",
    byType: "By reason",
    jump: (n) => `The biggest cheat would jump ${n} places ahead.`,
    jumpNone: "No one gains extra places from cheating in this log.",
    evalScore: "Score on the test cases",
    evalDetail: (c, f, p) => `${c} cases, flag F1 ${f}, exact positions ${p}`,
    rowTopPositionNaive: "Best place reached by a flagged referral",
  },
  fits: {
    title: "Where it fits",
    worth: "Worth it when",
    worthItems: [
      "A prize or early access depends on your place in line.",
      "Signups are free, so fake ones cost nothing.",
      "You want to explain every decision to the people affected.",
    ],
    notNeeded: "Not needed when",
    notNeededItems: [
      "The list is invite only or paid.",
      "No one gains anything from a better place.",
      "You already verify every email before it counts.",
    ],
  },
  proves: {
    title: "What it proves",
    body: "I can turn a rulebook with exact thresholds into one small piece of logic, check it against fixtures, and put the same logic behind a command line and a web page without the two ever disagreeing. I also show my work: every flag has a reason a person can read.",
  },
  engineers: {
    summary: "For engineers",
    mechanism: "Mechanism",
    mechanismItems: (r) => [
      "One pure function turns the whole log into the queue. The command line, the page and the numbers above all call it.",
      `Emails are lowercased, plus tags are removed, and Gmail dots are removed. The code is the first ${r.code} hex characters of SHA-256.`,
      `rank = join index minus ${r.bonus} per valid referral, ties by join index.`,
      `same_ip: same IP and under ${r.ipHours} hours after the referrer. burst: ${r.burstCount} or more signups with one code in ${r.burstMin} minutes, flagged ones included.`,
    ],
    testing: "How it is tested",
    testingItems: [
      "Seven fixture cases must match exactly, run through the same engine.",
      "Targeted tests for window edges, code collisions and bad input.",
      "The command line is tested as a subprocess, stdout must be pure JSON.",
    ],
    stack:
      "Stack: Bun, Next.js App Router, React, TypeScript strict, Biome, bun test, @noble/hashes",
    repo: "Source on GitHub",
  },
};

export const es: Dictionary = {
  meta: {
    title: "Linejump",
    oneLiner: "Una lista de espera donde los referidos te suben, y los tramposos no.",
  },
  allProjects: "← Todos los proyectos",
  language: "Idioma",
  hero: {
    chips: ["Lista de espera", "Control de referidos falsos", "Funciona sin configurar", "EN / ES"],
  },
  analogy: {
    title: "Piensa en la fila para entradas de un concierto",
    body: "Imagina la fila frente a una sala. Si traes amigos, el personal te deja avanzar. Es justo, hasta que alguien trae cinco veces al mismo amigo, o diez amigos que llegaron en una sola camioneta. Reviso a cada amigo que traes, y solo cuentan los reales.",
    glossaryTitle: "Cuatro palabras que uso",
    terms: [
      {
        term: "Código de referido",
        def: "Un código corto que es solo tuyo. Tus amigos lo escriben para decir que los enviaste.",
      },
      {
        term: "Referido válido",
        def: "Un amigo que pasó todos los controles. Cada uno te sube cinco lugares.",
      },
      {
        term: "Marca",
        def: "Un motivo por el que no confié en un referido, como un correo desechable.",
      },
      { term: "Posición", def: "Tu lugar en la fila ahora, empezando en 1." },
    ],
  },
  tryIt: {
    title: "Pruébalo",
    intro:
      "Repite un registro inventado de inscripciones, o agrega a tu gente. Intenta inscribirte dos veces con un correo con puntos o con plus y mira cómo lo detecto.",
    replay: "Repetición",
    play: "Reproducir",
    pause: "Pausar",
    stepBack: "Paso atrás",
    stepForward: "Paso adelante",
    reset: "Reiniciar repetición",
    speed: "Velocidad",
    progress: (d, t) => `${d} de ${t} inscripciones procesadas`,
    queue: "Fila",
    position: "Posición",
    person: "Persona",
    code: "Código",
    link: "Enlace para compartir",
    copy: "Copiar enlace",
    copied: "Copiado",
    yourPosition: (p) => `Posición ${p}`,
    selectPerson: "Elige a alguien de la fila para ver su código y enlace.",
    noPosition: "Rechazado por duplicado, así que no tiene lugar en la fila.",
    tabQueue: "Fila",
    tabAdmin: "Vista de administración",
    tabOutbox: "Bandeja de salida",
    addTitle: "Agregar una inscripción",
    email: "Correo",
    refCode: "Código de referido (opcional)",
    ip: "Dirección IP",
    add: "Agregar inscripción",
    burst: "Simular una ráfaga de seis",
    clearMine: "Quitar mis inscripciones",
    errEmail: "Escribe un correo.",
    validRefs: "Referidos válidos",
    rank: "Rango",
    flags: "Marcas",
    none: "ninguna",
    outboxEmpty: "Todavía no se envió nada. Primero alguien tiene que referir a un amigo real.",
    outboxSubject: "Subiste en la fila",
    movedUp: (f, t) =>
      `Buenas noticias, un amigo que referiste contó. Pasaste del lugar ${f} al lugar ${t}.`,
    outboxDemo: "Modo demo: los mensajes se quedan en esta pantalla y no se envía ningún correo.",
    liveSent: "Enviado por correo",
    log: "Registro de inscripciones",
    duplicateOf: (e) => `Es la misma persona que ${e}`,
  },
  flagName: {
    duplicate: "duplicado",
    unknown_ref: "referido_desconocido",
    disposable: "desechable",
    same_ip: "misma_ip",
    burst: "ráfaga",
  },
  flagWhy: {
    duplicate: (c) => `Este correo es la misma persona que ${c.other} al quitar los alias.`,
    unknown_ref: () => "Nadie que se haya unido antes tiene este código de referido.",
    disposable: (c) => `El dominio ${c.domain} está en la lista de correos desechables.`,
    same_ip: (c) =>
      `Misma IP que quien lo refirió, ${c.hours.toFixed(1)} horas después de que se unió (el límite es 24).`,
    burst: (c) => `${c.count} inscripciones usaron este código en 10 minutos (el límite es 5).`,
  },
  compare: {
    title: "Comparar",
    intro:
      "Las dos filas de abajo salen del mismo registro incluido, calculadas en vivo por el producto.",
    naive: "Contando todos los referidos",
    linejump: "Linejump",
    signups: "Inscripciones aceptadas",
    duplicates: "Duplicados detectados",
    flagged: "Referidos que no cuentan",
    byType: "Por motivo",
    jump: (n) => `La peor trampa se adelantaría ${n} lugares.`,
    jumpNone: "En este registro nadie gana lugares haciendo trampa.",
    evalScore: "Puntaje en los casos de prueba",
    evalDetail: (c, f, p) => `${c} casos, F1 de marcas ${f}, posiciones exactas ${p}`,
    rowTopPositionNaive: "Mejor lugar alcanzado con un referido marcado",
  },
  fits: {
    title: "Dónde encaja",
    worth: "Vale la pena cuando",
    worthItems: [
      "Un premio o el acceso anticipado depende de tu lugar en la fila.",
      "Inscribirse es gratis, así que las inscripciones falsas no cuestan nada.",
      "Quieres explicar cada decisión a las personas afectadas.",
    ],
    notNeeded: "No hace falta cuando",
    notNeededItems: [
      "La lista es solo por invitación o de pago.",
      "Nadie gana nada con un mejor lugar.",
      "Ya verificas cada correo antes de que cuente.",
    ],
  },
  proves: {
    title: "Qué demuestra",
    body: "Puedo convertir un reglamento con umbrales exactos en una pieza pequeña de lógica, comprobarla con casos de prueba, y poner la misma lógica detrás de una línea de comandos y de una página web sin que nunca se contradigan. También muestro mi trabajo: cada marca tiene un motivo que una persona puede leer.",
  },
  engineers: {
    summary: "Para ingenieros",
    mechanism: "Mecanismo",
    mechanismItems: (r) => [
      "Una función pura convierte todo el registro en la fila. La línea de comandos, la página y los números de arriba la usan.",
      `Los correos se pasan a minúsculas, se quitan las etiquetas con plus y los puntos de Gmail. El código son los primeros ${r.code} caracteres hex de SHA-256.`,
      `rango = índice de ingreso menos ${r.bonus} por referido válido, y los empates se resuelven por índice de ingreso.`,
      `misma_ip: misma IP y menos de ${r.ipHours} horas después de quien refirió. ráfaga: ${r.burstCount} o más inscripciones con un código en ${r.burstMin} minutos, contando las marcadas.`,
    ],
    testing: "Cómo se prueba",
    testingItems: [
      "Siete casos de prueba deben coincidir exactamente, ejecutados por el mismo motor.",
      "Pruebas dirigidas para bordes de ventanas, colisiones de códigos y entradas malas.",
      "La línea de comandos se prueba como subproceso, y la salida debe ser JSON puro.",
    ],
    stack:
      "Stack: Bun, Next.js App Router, React, TypeScript strict, Biome, bun test, @noble/hashes",
    repo: "Código en GitHub",
  },
};

export const dictionaries: Record<Lang, Dictionary> = { en, es };
