import { Languages, Maximize, Tv } from 'lucide-react';
import { useStore } from '../store';
import { useT } from '../i18n';

/** Controles discretos FUERA del marco 4:3 (en el borde de la ventana): CRT, idioma y pantalla completa. */
export function OutsideControls() {
  const crt = useStore((s) => s.crt);
  const lang = useStore((s) => s.lang);
  const toggleCrt = useStore((s) => s.toggleCrt);
  const setLang = useStore((s) => s.setLang);
  const t = useT();
  const btn = 'flex h-[32px] min-w-[32px] items-center justify-center rounded-[6px] text-white/35 transition hover:bg-white/10 hover:text-white/90 focus-visible:text-white';

  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };

  return (
    <div className="fixed bottom-[8px] right-[8px] z-50 flex gap-[4px] font-ps2" style={{ fontSize: 12 }}>
      <button className={`${btn} ${crt ? '!text-sky-300/80' : ''}`} onClick={toggleCrt} title={t('ui.crt')} aria-pressed={crt} aria-label={t('ui.crt')}>
        <Tv size={16} />
      </button>
      <button className={`${btn} gap-[4px] px-[8px]`} onClick={() => setLang(lang === 'es' ? 'en' : 'es')} title={t('ui.lang')} aria-label={t('ui.lang')}>
        <Languages size={16} />
        <span className="uppercase">{lang}</span>
      </button>
      <button className={btn} onClick={fullscreen} title={t('ui.fullscreen')} aria-label={t('ui.fullscreen')}>
        <Maximize size={16} />
      </button>
    </div>
  );
}
