import { FileText, Mail, Save, User } from 'lucide-react';
import { useStore, type Screen } from '../store';
import { useT, type Key } from '../i18n';
import { sfx } from '../lib/audio';
import { useInput } from '../lib/input';
import { HintBar } from '../components/HintBar';
import { TopBar } from '../components/Chrome';

const ITEMS: { screen: Screen; label: Key; desc: Key; Icon: typeof Save }[] = [
  { screen: 'projects', label: 'menu.projects', desc: 'menu.projects.desc', Icon: Save },
  { screen: 'about', label: 'menu.about', desc: 'menu.about.desc', Icon: User },
  { screen: 'cv', label: 'menu.cv', desc: 'menu.cv.desc', Icon: FileText },
  { screen: 'contact', label: 'menu.contact', desc: 'menu.contact.desc', Icon: Mail },
];

/** Menú principal estilo BIOS de PS2: íconos en fila, el seleccionado crece y se describe abajo. */
export function MainMenu() {
  const t = useT();
  const index = useStore((s) => s.menuIndex);
  const setIndex = useStore((s) => s.setMenuIndex);
  const go = useStore((s) => s.go);

  const select = (i: number) => {
    if (i !== index) {
      setIndex(i);
      sfx.move();
    }
  };
  const open = (i: number) => {
    sfx.confirm();
    if (ITEMS[i].screen === 'projects') useStore.getState().setFocus(useStore.getState().focus);
    go(ITEMS[i].screen);
  };

  useInput((a) => {
    if (a === 'left') select((index + ITEMS.length - 1) % ITEMS.length);
    else if (a === 'right') select((index + 1) % ITEMS.length);
    else if (a === 'confirm') open(index);
  });

  return (
    <div className="screen-in absolute inset-0 ps-ui">
      <TopBar title="alexe1" sub="Elías Torczuk · Portfolio System" />

      <div className="absolute left-0 right-0 top-[34%] flex -translate-y-1/2 items-end justify-center gap-[2.6rem]">
        {ITEMS.map(({ screen, label, Icon }, i) => {
          const sel = i === index;
          return (
            <button
              key={screen}
              onMouseEnter={() => select(i)}
              onFocus={() => select(i)}
              onClick={() => open(i)}
              className="pointer-events-auto flex w-[9.5rem] flex-col items-center gap-[0.9rem] outline-none transition-transform duration-300"
              style={{ transform: `scale(${sel ? 1.18 : 0.88})`, opacity: sel ? 1 : 0.6 }}
            >
              <div
                className="flex h-[7.2rem] w-[7.2rem] items-center justify-center rounded-[1.2rem] border transition-all duration-300"
                style={{
                  background: 'linear-gradient(160deg, rgba(120,160,255,0.45), rgba(40,60,170,0.35))',
                  borderColor: sel ? 'rgba(220,235,255,0.95)' : 'rgba(150,185,255,0.35)',
                  boxShadow: sel ? '0 0 2.4rem rgba(110,160,255,0.75), inset 0 0 1.4rem rgba(190,220,255,0.35)' : 'inset 0 0 1rem rgba(120,160,255,0.2)',
                }}
              >
                <Icon style={{ width: '3.6rem', height: '3.6rem' }} strokeWidth={1.4} className="text-white" />
              </div>
              <span className="text-[1.35rem] font-medium tracking-wide">{t(label)}</span>
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-[4.4rem] left-1/2 w-[38rem] -translate-x-1/2 text-center">
        <div key={index} className="screen-in ps-panel-dark px-[1.6rem] py-[0.9rem] text-[1.2rem] leading-snug text-sky-50">
          {t(ITEMS[index].desc)}
        </div>
      </div>

      <HintBar
        hints={[
          { glyph: 'dpad', label: t('hint.move') },
          { glyph: 'cross', label: t('hint.select'), action: 'confirm' },
        ]}
      />
    </div>
  );
}
