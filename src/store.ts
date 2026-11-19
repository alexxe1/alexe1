import { create } from 'zustand';

export type Screen = 'power' | 'boot' | 'menu' | 'projects' | 'about' | 'cv' | 'contact';
export type Lang = 'es' | 'en';
export type ProjView = 'grid' | 'menu' | 'details';

const read = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* modo privado / storage bloqueado */
  }
};

interface State {
  screen: Screen;
  lang: Lang;
  crt: boolean;
  muted: boolean;
  powering: boolean; // ya se apretó POWER (la PS2 está arrancando)
  focus: number; // proyecto enfocado en la Memory Card
  menuIndex: number;
  projView: ProjView;
  curtain: boolean; // telón negro que se desvanece al pasar de la intro al menú
  go: (s: Screen) => void;
  setLang: (l: Lang) => void;
  toggleCrt: () => void;
  toggleMute: () => void;
  setPowering: (v: boolean) => void;
  setFocus: (i: number) => void;
  setMenuIndex: (i: number) => void;
  setProjView: (v: ProjView) => void;
  setCurtain: (v: boolean) => void;
}

const browserLang = (): Lang => (navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es');

export const useStore = create<State>((set, get) => ({
  screen: 'power',
  lang: read<Lang>('alexe1.lang', browserLang()),
  crt: read('alexe1.crt', true),
  muted: read('alexe1.muted', false),
  powering: false,
  focus: 0,
  menuIndex: 0,
  projView: 'grid',
  curtain: false,
  go: (screen) => set({ screen }),
  setLang: (lang) => {
    write('alexe1.lang', lang);
    set({ lang });
  },
  toggleCrt: () => {
    const crt = !get().crt;
    write('alexe1.crt', crt);
    set({ crt });
  },
  toggleMute: () => {
    const muted = !get().muted;
    write('alexe1.muted', muted);
    set({ muted });
  },
  setPowering: (powering) => set({ powering }),
  setFocus: (focus) => set({ focus }),
  setMenuIndex: (menuIndex) => set({ menuIndex }),
  setProjView: (projView) => set({ projView }),
  setCurtain: (curtain) => set({ curtain }),
}));
