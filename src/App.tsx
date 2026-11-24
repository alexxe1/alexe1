import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from './store';
import { decodeBootAudio, initAudio, loadRsodAudio, prefetchBootAudio, setMuted, sfx, startAmbient } from './lib/audio';
import { decideEgg } from './lib/egg';
import { preloadIconModels } from './three/icons';
import { installInput } from './lib/input';
import { loadCommits, mockCommits, type CommitData } from './lib/commits';
import { SceneRoot } from './three/SceneRoot';
import { CrtOverlay } from './components/CrtOverlay';
import { OutsideControls } from './components/OutsideControls';
import { AudioWidget } from './components/AudioWidget';
import { PowerScreen } from './screens/PowerScreen';
import { BootScreen, type BootPhase } from './screens/BootScreen';
import { MainMenu } from './screens/MainMenu';
import { ProjectsScreen } from './screens/ProjectsScreen';
import { AboutScreen } from './screens/AboutScreen';
import { CvScreen } from './screens/CvScreen';
import { ContactScreen } from './screens/ContactScreen';

export default function App() {
  const screen = useStore((s) => s.screen);
  const crt = useStore((s) => s.crt);
  const curtain = useStore((s) => s.curtain);
  const muted = useStore((s) => s.muted);
  const [commits, setCommits] = useState<CommitData>(mockCommits);
  const [phase, setPhase] = useState<BootPhase>('fly');
  const powerTimer = useRef<number>();

  useEffect(() => installInput(), []);
  useEffect(() => prefetchBootAudio(), []);
  useEffect(() => setMuted(muted), [muted]);

  // Datos de las torres: API en vivo (si existe /api/github-commits) o mock local
  useEffect(() => {
    void loadCommits().then((d) => {
      if (useStore.getState().screen === 'power') setCommits(d);
    });
  }, []);

  // M = mute
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyM' && !e.repeat && !e.ctrlKey && !e.metaKey) useStore.getState().toggleMute();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (screen === 'boot') setPhase('fly');
  }, [screen]);

  // Si el usuario vuelve al menú sin haber pasado por la intro (no debería), asegurar ambiente
  useEffect(() => {
    if (screen === 'menu') startAmbient();
  }, [screen]);

  useEffect(() => () => window.clearTimeout(powerTimer.current), []);

  const power = useCallback(() => {
    const s = useStore.getState();
    if (s.powering || s.screen !== 'power') return;
    initAudio(); // el gesto del usuario habilita el AudioContext
    const egg = decideEgg(); // primera visita: nunca; después: chance (config/easter.ts)
    s.setEgg(egg);
    if (egg) void loadRsodAudio();
    const decoded = decodeBootAudio(); // decodifica ps2_startup / ps2_logo mientras se anima el encendido
    sfx.power();
    s.setPowering(true);
    preloadIconModels();
    powerTimer.current = window.setTimeout(() => {
      // esperar (máx. 2,5 s) a que los audios estén listos para que la intro quede sincronizada
      void Promise.race([decoded, new Promise((r) => setTimeout(r, 2500))]).then(() => useStore.getState().go('boot'));
    }, 1700);
  }, []);

  const onPhase = useCallback((p: 'black' | 'logo' | 'rsod') => setPhase(p), []);

  return (
    <div className="fixed inset-0 grid place-items-center overflow-hidden bg-black">
      <div
        className={`relative overflow-hidden bg-black ${crt ? 'crt-on' : ''}`}
        style={{ width: 'min(100vw, 133.3333vh)', height: 'min(75vw, 100vh)' }}
      >
        <SceneRoot commits={commits} bootPhase={phase} onPhase={onPhase} onPower={power} />

        <div className="pointer-events-none absolute inset-0 z-10 ps-ui">
          {screen === 'power' && <PowerScreen power={power} />}
          {screen === 'boot' && <BootScreen phase={phase} onPhase={setPhase} />}
          {screen === 'menu' && <MainMenu />}
          {screen === 'projects' && <ProjectsScreen />}
          {screen === 'about' && <AboutScreen commits={commits} />}
          {screen === 'cv' && <CvScreen />}
          {screen === 'contact' && <ContactScreen />}
          {screen !== 'power' && screen !== 'boot' && <AudioWidget />}
        </div>

        {curtain && screen === 'menu' && (
          <div className="pointer-events-none absolute inset-0 z-30 bg-black" style={{ animation: 'fadeOut 0.9s ease-out forwards' }} onAnimationEnd={() => useStore.getState().setCurtain(false)} />
        )}

        {crt && <CrtOverlay />}
      </div>
      <OutsideControls />
    </div>
  );
}
