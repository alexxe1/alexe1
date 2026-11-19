export const profile = {
  name: 'Elías Alexei Torczuk',
  alias: 'alexe1',
  location: 'San Justo, Buenos Aires',
  devSince: 2016,
  site: 'https://alexe1.vercel.app',
  email: 'eliastorczuk@outlook.com',
  originalPageBy: 'MrDadoxx',
};

export type ContactId = 'email' | 'linkedin' | 'github' | 'youtube' | 'tiktok' | 'x' | 'play';
export interface ContactLink { id: ContactId; label: string; value: string; url: string }

export const contacts: ContactLink[] = [
  { id: 'email', label: 'Email', value: profile.email, url: `mailto:${profile.email}` },
  { id: 'linkedin', label: 'LinkedIn', value: 'in/eliastorczuk', url: 'https://www.linkedin.com/in/eliastorczuk' },
  { id: 'github', label: 'GitHub', value: '@alexxe1', url: 'https://github.com/alexxe1' },
  { id: 'youtube', label: 'YouTube', value: '@alexe1dev', url: 'https://www.youtube.com/@alexe1dev' },
  { id: 'tiktok', label: 'TikTok', value: '@alexe1dev', url: 'https://www.tiktok.com/@alexe1dev' },
  { id: 'x', label: 'X', value: '@alexe1dev', url: 'https://twitter.com/alexe1dev' },
  { id: 'play', label: 'Google Play', value: 'alexe1dev', url: 'https://play.google.com/store/apps/dev?id=6894155375945307231' },
];

export const stack = {
  languages: ['C#', 'C', 'Java', 'SQL', 'JavaScript', 'TypeScript', 'Python'],
  frameworks: ['Unity', 'MonoGame', 'SDL2', 'Avalonia'],
  tools: ['Git', 'JUnit', 'Docker', 'Linux (Ubuntu Server)', 'SSH'],
};

/** Atribución obligatoria de los modelos 3D con licencia Creative Commons (CC BY 4.0). */
export const modelCredits = [
  {
    title: 'PS2 Slim low poly',
    author: 'alexdperdomo',
    url: 'https://skfb.ly/6X6RH',
    license: 'CC BY 4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
    changes: { es: 'se agregó el botón de encendido y su LED', en: 'power button and LED added' },
  },
  {
    title: 'doll',
    author: 'lucq22',
    url: 'https://sketchfab.com/3d-models/doll-51b4dafa7fa745c0af8e3772d0ac8a33',
    license: 'CC BY 4.0',
    licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
    changes: { es: 'solo la cabeza; texturas optimizadas', en: 'head only; textures optimized' },
  },
];
