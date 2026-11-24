import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../store';
import { useT } from '../i18n';
import { bootDurations, sfx, startAmbient } from '../lib/audio';
import { useInput } from '../lib/input';
import { RSOD_SECONDS } from '../config/easter';
import { Glyph } from '../components/Glyphs';

export type BootPhase = 'fly' | 'black' | 'rsod' | 'logo';

/**
 * Capa DOM de la intro.
 *  fly   → fundido de entrada desde negro mientras vuelan las torres
 *  black → corte a negro (cuando termina el dash)
 *  rsod  → (easter egg) fundido desde negro al RSOD, con su cartel; después vuelve a negro
 *  logo  → sobre negro, el logo + "alexe1" pasan de negro a color muy rápido (suena ps2_logo.mp3)
 */
export function BootScreen({ phase, onPhase }: { phase: BootPhase; onPhase: (p: BootPhase) => void }) {
  const t = useT();
  const [leaving, setLeaving] = useState(false);
  const [rsodOut, setRsodOut] = useState(false);

  const finish = useCallback(() => {
    sfx.bootStop();
    const s = useStore.getState();
    s.setCurtain(true);
    s.go('menu');
    startAmbient();
  }, []);

  useInput((a) => {
    if (a === 'confirm' || a === 'back') finish();
  });

  // Easter egg: el RSOD dura lo que dura su audio y se "reinicia" hacia el logo
  useEffect(() => {
    if (phase !== 'rsod') return;
    sfx.rsodStart();
    // el RSOD dura lo que dura rsod.mp3 (si no hay audio, RSOD_SECONDS)
    const ms = (bootDurations().rsod ?? RSOD_SECONDS) * 1000;
    const t1 = setTimeout(() => { setRsodOut(true); sfx.rsodStop(); }, ms);
    const t2 = setTimeout(() => onPhase('logo'), ms + 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      sfx.rsodStop();
    };
  }, [phase, onPhase]);

  useEffect(() => {
    if (phase !== 'logo') return;
    sfx.bootLogo();
    const hold = Math.max(3200, (bootDurations().logo ?? 1) * 1000 + 2400);
    const t1 = setTimeout(() => setLeaving(true), hold);
    const t2 = setTimeout(finish, hold + 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, finish]);

  const blackOn = phase === 'black' || phase === 'logo' || (phase === 'rsod' && rsodOut);
  const slowFade = phase === 'rsod' && !rsodOut; // entrada al RSOD: fundido más lento desde negro

  return (
    <div className="absolute inset-0 ps-ui">
      {/* fundido de entrada desde negro */}
      <div className="pointer-events-none absolute inset-0 bg-black" style={{ animation: 'fadeOut 1.4s ease-out 0.1s both' }} />
      {/* negro (corte rápido; en el RSOD sirve de fundido de entrada y de salida) */}
      <div className="pointer-events-none absolute inset-0 z-[5] bg-black" style={{ opacity: blackOn ? 1 : 0, transition: `opacity ${slowFade ? 1.1 : 0.4}s ease-in-out` }} />

      {phase === 'rsod' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[6.5rem] z-[6] text-center text-[2rem] font-medium leading-snug tracking-[0.02em] text-white screen-in" style={{ animationDelay: '0.9s', textShadow: '0 0 1.2rem rgba(255,40,20,0.7), 0.12rem 0.16rem 0.3rem rgba(0,0,0,0.8)' }}>
          <div>{t('rsod.line1')}</div>
          <div>{t('rsod.line2')}</div>
        </div>
      )}

      {phase === 'logo' && (
        <div className="absolute inset-0 z-[6] flex flex-col items-center justify-center" style={{ opacity: leaving ? 0 : 1, transition: 'opacity 0.65s ease-in' }}>
          <div className="flex flex-col items-center gap-[1.4rem]" style={{ animation: 'logoReveal 0.8s ease-out both' }}>
            <img src={`${import.meta.env.BASE_URL}img/logo.png`} alt="alexe1" draggable={false} className="h-[15rem] w-[15rem] object-contain" style={{ filter: 'drop-shadow(0 0 1.6rem rgba(255,240,200,0.35))' }} />
            <div className="text-[6.6rem] font-semibold leading-none tracking-[0.06em] text-white" style={{ textShadow: '0 0 2rem rgba(255,245,220,0.45), 0.12rem 0.18rem 0.3rem rgba(0,0,0,0.6)' }}>
              alexe1
            </div>
          </div>
        </div>
      )}

      <button onClick={finish} className="pointer-events-auto absolute bottom-[1rem] right-[1.4rem] z-10 flex items-center gap-[0.5rem] text-[1rem] text-white/50 transition hover:text-white">
        <Glyph name="cross" />
        {t('boot.skip')}
      </button>
    </div>
  );
}
