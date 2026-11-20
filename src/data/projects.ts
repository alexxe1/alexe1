import type { Lang } from '../store';

export type IconId = 'krypto' | 'tnp' | 'noisepad' | 'waka' | 'assetly' | 'bda' | 'elifest' | 'life' | 'maze' | 'chip8';
export type Status = 'live' | 'wip' | 'offline' | 'academic';
type L = Record<Lang, string>;

export interface Project {
  id: string;
  title: string;
  icon: IconId;
  /** Fecha de "guardado". Vacío => se muestra ----/--/-- (completalo cuando quieras). */
  date: string;
  /** Tamaño decorativo en KB, como en una Memory Card real. */
  sizeKB: number;
  status: Status;
  tags: string[];
  platforms?: string[];
  short: L;
  long: L;
  /** Si no hay `demo`, la opción "Ver Demo" queda deshabilitada. */
  demo?: { url: string };
  /** Si no hay `repo`, "Código Fuente (GitHub)" queda deshabilitado. */
  repo?: string;
  links?: { label: string; url: string }[];
  /** Capturas (en /public/img). */
  shots?: string[];
}

export const GITHUB_USER = 'alexxe1';

export const projects: Project[] = [
  {
    id: 'krypto',
    title: 'Krypto',
    icon: 'krypto',
    date: '2022/09/17', // fecha de vigencia de la política de privacidad
    sizeKB: 512,
    status: 'live',
    tags: ['C#', 'Unity', 'AdMob'],
    platforms: ['Windows', 'macOS', 'Linux', 'Android'],
    short: {
      es: 'Juego de lógica: combiná tus 4 cartas con +, −, × y ÷ para llegar al resultado.',
      en: 'Logic game: combine your 4 cards with +, −, × and ÷ to reach the target number.',
    },
    long: {
      es: 'Juego de lógica basado en combinatoria de cartas y operaciones matemáticas. Disponible en cuatro plataformas, con optimización de rendimiento y controles táctiles para Android.',
      en: 'Logic game built around card combinatorics and math operations. Available on four platforms, with performance optimization and touch controls for Android.',
    },
    demo: { url: 'https://alexe1.itch.io/krypto' },
    links: [
      { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.alexe1dev.Krypto&hl=es_AR&gl=US' },
      { label: 'itch.io', url: 'https://alexe1.itch.io/krypto' },
      { label: 'Privacy Policy', url: './krypto/privacy/' },
    ],
    shots: [0, 1, 2, 3, 4, 5, 6].map((i) => `./img/krypto-${i}.webp`),
  },
  {
    id: 'tnp',
    title: 'The Noris Project',
    icon: 'tnp',
    date: '', // TODO: completar fecha
    sizeKB: 1024,
    status: 'live',
    tags: ['C#', 'Unity'],
    platforms: ['Windows', 'macOS', 'Linux'],
    short: {
      es: 'Survival/horror: vigilá las cámaras, escondete bajo el escritorio y sobreviví.',
      en: 'Survival/horror: watch the cameras, hide under your desk and survive.',
    },
    long: {
      es: 'Videojuego survival/horror con sistema de cámaras de seguridad como mecánica central, IA de NPCs y gestión de recursos de supervivencia. Completá tus tareas, escondete bajo el escritorio y vigilá las cámaras mientras intentás sobrevivir a aterradoras criaturas humanoides. Publicado en tres plataformas.',
      en: 'Survival/horror game with a security-camera system as its core mechanic, NPC AI and survival resource management. Complete your tasks, hide under your desk and watch the cameras while trying to survive frightening humanoid creatures. Published on three platforms.',
    },
    demo: { url: 'https://alexe1.itch.io/the-noris-project' },
    links: [
      { label: 'itch.io', url: 'https://alexe1.itch.io/the-noris-project' },
      { label: 'GameJolt', url: 'https://gamejolt.com/games/thenorisproject/787238' },
    ],
    shots: [0, 1, 2, 3, 4].map((i) => `./img/tnp-${i}.webp`),
  },
  {
    id: 'noisepad',
    title: 'Noisepad',
    icon: 'noisepad',
    date: '', // TODO: completar fecha
    sizeKB: 768,
    status: 'live',
    tags: ['C#', 'Avalonia', 'Audio en tiempo real'],
    platforms: ['Windows'],
    short: {
      es: 'Soundpad open-source: pitch, grabación de voz y reversa en tiempo real.',
      en: 'Open-source soundpad: real-time pitch shifting, voice recording and reverse.',
    },
    long: {
      es: 'Aplicación open-source de soundboard con pipeline de procesamiento de audio en tiempo real: manipulación de pitch, grabación de voz, reversa de audio y latencia mínima. Orientada a streamers, músicos y trabajadores remotos.',
      en: 'Open-source soundboard app with a real-time audio processing pipeline: pitch shifting, voice recording, audio reversal and minimal latency. Aimed at streamers, musicians and remote workers.',
    },
    repo: `https://github.com/${GITHUB_USER}/Noisepad`,
  },
  {
    id: 'chip8',
    title: 'CHIP-8',
    icon: 'chip8',
    date: '2026/11',
    sizeKB: 288,
    status: 'live',
    tags: ['C11', 'SDL2', 'Make'],
    short: {
      es: 'Intérprete/emulador de CHIP-8 en C puro: gráficos, entrada y audio con SDL2.',
      en: 'CHIP-8 interpreter/emulator in pure C: graphics, input and audio with SDL2.',
    },
    long: {
      es: 'Intérprete de CHIP-8 escrito en C11 con SDL2 para gráficos, entrada y audio. Implementa el set original completo de 35 opcodes, con 4 KB de memoria, 16 registros de 8 bits, pila y timers de delay y de sonido. La pantalla monocromática de 64×32 se escala con texturas streaming de SDL2, el teclado hexadecimal de 16 teclas se mapea al lado izquierdo del QWERTY y el timer de sonido dispara un zumbador de onda cuadrada de 440 Hz. Se compila con gcc y make y se usa con ./chip8 roms/pong.ch8.',
      en: 'CHIP-8 interpreter written in C11 using SDL2 for graphics, input and audio. It implements the full original 35-opcode instruction set, with 4 KB of memory, 16 8-bit registers, a stack and delay and sound timers. The 64×32 monochrome display is scaled through SDL2 streaming textures, the 16-key hexadecimal keypad is mapped to the left side of a QWERTY keyboard and the sound timer drives a 440 Hz square-wave buzzer. Built with gcc and make, run with ./chip8 roms/pong.ch8.',
    },
    repo: `https://github.com/${GITHUB_USER}/Chip-8`,
  },
  {
    id: 'waka',
    title: 'Waka Waka Reloaded',
    icon: 'waka',
    date: '2026/10',
    sizeKB: 896,
    status: 'wip',
    tags: ['TypeScript', 'JavaScript', 'CSS', 'Cloudflare Workers'],
    platforms: ['Web'],
    short: {
      es: 'Restauración de un juego Flash de 2010 con cliente web y backend propios.',
      en: 'Restoration of a 2010 Flash game with a custom web client and backend.',
    },
    long: {
      es: 'Ingeniería inversa y migración. Proyecto en desarrollo para la restauración de un juego Flash legado (2010), reestructurando el cliente web para interactuar con un backend y una API propios (el servidor corre en Cloudflare Workers + D1). El repositorio del servidor es privado.',
      en: 'Reverse engineering and migration. Work in progress to restore a legacy Flash game (2010), restructuring the web client to talk to a custom backend and API (the server runs on Cloudflare Workers + D1). The server repository is private.',
    },
    demo: { url: 'https://waka-waka.alexe1.workers.dev/' },
  },
  {
    id: 'assetly',
    title: 'Assetly',
    icon: 'assetly',
    date: '2026/07',
    sizeKB: 640,
    status: 'offline',
    tags: ['Web', 'Supabase'],
    platforms: ['Web'],
    short: {
      es: 'Biblioteca web de assets para videojuegos: sprites, modelos 3D, audio, fuentes, shaders…',
      en: 'Web library of game assets: sprites, 3D models, audio, fonts, shaders…',
    },
    long: {
      es: 'Biblioteca web de assets para videojuegos. Permite explorar, descargar y subir recursos como sprites 2D, modelos 3D, audio, fuentes, shaders y más. La demo en línea depende de Supabase y está fuera de servicio por el momento; el código está completo en GitHub.',
      en: 'Web library of video game assets. Browse, download and upload resources such as 2D sprites, 3D models, audio, fonts, shaders and more. The live demo depends on Supabase and is currently offline; the full code is on GitHub.',
    },
    repo: `https://github.com/${GITHUB_USER}/Assetly`,
  },
  {
    id: 'bda',
    title: 'BDA · Sistema Mundial de Fútbol',
    icon: 'bda',
    date: '2026',
    sizeKB: 384,
    status: 'wip',
    tags: ['SQL Server', 'T-SQL'],
    short: {
      es: 'TP de Bases de Datos Aplicadas: gestión del Mundial de Fútbol en SQL Server.',
      en: 'Applied Databases coursework: a World Cup management system in SQL Server.',
    },
    long: {
      es: 'Trabajo práctico de Bases de Datos Aplicadas: diseño e implementación en SQL Server y T-SQL de un sistema de registro y gestión del Mundial de Fútbol. En proceso. (Repositorio del equipo.)',
      en: 'Applied Databases coursework: design and implementation in SQL Server and T-SQL of a registration and management system for the Football World Cup. Work in progress. (Team repository.)',
    },
    repo: 'https://github.com/yamilscc/bda-sistema-mundial-futbol',
  },
  {
    id: 'elifest',
    title: 'elifest22',
    icon: 'elifest',
    date: '2026/11',
    sizeKB: 448,
    status: 'live',
    tags: ['Web', 'Template público'],
    platforms: ['Mobile', 'TV'],
    short: {
      es: 'Sistema digital para un cumpleaños: fichas, torneos, apuestas, QRs y foto-retos.',
      en: 'Digital system for a birthday party: chips, tournaments, bets, QR hunt and photo challenges.',
    },
    long: {
      es: 'Sistema digital para mi cumpleaños 22 con fichas, ranking en vivo, torneos con brackets, apuestas, búsqueda del tesoro con QRs y foto-retos con votación. Pensado para usarse una sola noche desde los celulares de los invitados y con pantalla de TV. Es un template público.',
      en: 'Digital system for my 22nd birthday with chips, live ranking, bracket tournaments, bets, a QR treasure hunt and photo challenges with voting. Built for a single night, used from guests’ phones with a TV screen. Public template.',
    },
    repo: `https://github.com/${GITHUB_USER}/elifest22`,
  },
  {
    id: 'life',
    title: 'TP · Juego de la Vida',
    icon: 'life',
    date: '2025 · 1C',
    sizeKB: 192,
    status: 'academic',
    tags: ['UNLaM', 'Tópicos de Programación'],
    short: {
      es: 'Trabajo práctico de Tópicos de Programación (1.º cuatrimestre 2025).',
      en: 'Programming Topics coursework (first semester 2025).',
    },
    long: {
      es: 'Trabajo práctico para la materia Tópicos de Programación, 1.º cuatrimestre de 2025 (UNLaM): el autómata celular del Juego de la Vida de Conway.',
      en: 'Coursework for Programming Topics, first semester of 2025 (UNLaM): Conway’s Game of Life cellular automaton.',
    },
    repo: `https://github.com/${GITHUB_USER}/TP-JuegoDeLaVida`,
  },
  {
    id: 'maze',
    title: 'TP · Laberintos y Fantasmas',
    icon: 'maze',
    date: '2025 · 2C',
    sizeKB: 256,
    status: 'academic',
    tags: ['UNLaM', 'Algoritmos y Estructuras de Datos'],
    short: {
      es: 'Trabajo práctico de Algoritmos y Estructuras de Datos (2.º cuatrimestre 2025).',
      en: 'Algorithms and Data Structures coursework (second semester 2025).',
    },
    long: {
      es: 'Trabajo práctico para la cursada de Algoritmos y Estructuras de Datos, 2.º cuatrimestre de 2025 (UNLaM): laberintos y fantasmas.',
      en: 'Coursework for Algorithms and Data Structures, second semester of 2025 (UNLaM): mazes and ghosts.',
    },
    repo: `https://github.com/${GITHUB_USER}/TP-Laberintos-y-Fantasmas`,
  },
];
