/**
 * CV integrado en la página, a partir del PDF (versión Web / Full Stack).
 * Para actualizarlo: editá este archivo y reemplazá el PDF en /public/cv.
 */
export interface CvProject { name: string; meta: string; text: string }

export const cv = {
  pdf: './cv/CV-Elias-Torczuk-Web.pdf',
  name: 'Elías Alexei Torczuk',
  headline: 'Estudiante de Ingeniería en Informática · Desarrollo de Software',
  location: 'San Justo, Buenos Aires',
  about:
    'Estudiante avanzado de Ingeniería en Informática orientado al desarrollo de software, aplicaciones web y sistemas multiplataforma. Experiencia práctica construyendo proyectos de principio a fin, optimización de algoritmos y gestión de bases de datos. Interesado en aplicar nuevas tecnologías y herramientas de IA para resolver problemas reales.',
  interests: 'Desarrollo Web y Full Stack · Software Multiplataforma / Desktop · Bases de Datos · Herramientas de IA para desarrollo',
  education: {
    title: 'Ingeniería en Informática',
    school: 'Universidad Nacional de La Matanza',
    period: '2023 – actualidad',
    text: 'Llevo el 51% de la carrera. Algunas de las materias aprobadas incluyen Paradigmas de Programación, Bases de Datos, Arquitectura de Computadoras, entre otras.',
  },
  projects: [
    { name: 'Waka Waka Reloaded', meta: 'TypeScript, JavaScript, CSS · Web', text: 'Ingeniería inversa y migración. Proyecto en desarrollo para la restauración de un juego Flash legado (2010), reestructurando el cliente web para interactuar con un backend y API propios.' },
    { name: 'Noisepad', meta: 'C#, Avalonia · Windows', text: 'Aplicación open-source de soundboard con pipeline de procesamiento de audio en tiempo real: manipulación de pitch, grabación de voz y latencia mínima. Orientada a streamers, músicos y trabajadores remotos.' },
    { name: 'Home Server', meta: 'Ubuntu Server, Linux, Docker, Bash', text: 'Administración de servidor Linux auto hospedado con despliegue de servicios mediante Docker, gestión de redes, usuarios, accesos remotos y políticas de copias de seguridad.' },
    { name: 'Krypto', meta: 'C#, Unity · Windows, Mac, Linux, Android', text: 'Juego de lógica basado en combinatoria de cartas y operaciones matemáticas. Disponible en cuatro plataformas, con optimización de rendimiento y controles táctiles para Android.' },
  ] as CvProject[],
  tech: {
    languages: 'C# · C · Java · SQL · JavaScript · TypeScript · Python',
    frameworks: 'Unity · MonoGame · SDL2 · Avalonia',
    tools: 'Git · JUnit · Docker · Linux (Ubuntu Server) · SSH',
  },
  languages: [
    { name: 'Inglés', level: 'Cambridge English First (C1)' },
    { name: 'Español', level: 'Nativo' },
  ],
};
