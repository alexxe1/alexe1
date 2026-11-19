import { useSyncExternalStore } from 'react';
import { SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useStore } from '../store';
import { useT } from '../i18n';
import { ambientStore, nextAmbientTrack } from '../lib/audio';

/** Reproductor ambiental discreto (esquina inferior izquierda): título de pista, siguiente y mute. */
export function AudioWidget() {
  const muted = useStore((s) => s.muted);
  const toggleMute = useStore((s) => s.toggleMute);
  const title = useSyncExternalStore(ambientStore.subscribe, ambientStore.getTitle);
  const t = useT();
  const label = title === '~' ? t('audio.generative') : title;
  return (
    <div className="pointer-events-auto absolute bottom-[0.9rem] left-[1.2rem] z-30 flex items-center gap-[0.5rem] text-[0.85rem] text-white/60 ps-ui">
      <button onClick={toggleMute} className="rounded p-[0.2rem] transition hover:text-white" title={muted ? t('audio.unmute') : t('audio.mute')} aria-label={muted ? t('audio.unmute') : t('audio.mute')}>
        {muted ? <VolumeX style={{ width: '1.25rem', height: '1.25rem' }} /> : <Volume2 style={{ width: '1.25rem', height: '1.25rem' }} />}
      </button>
      {!muted && label && <span className="max-w-[10rem] truncate">♪ {label}</span>}
      {ambientStore.canSkip() && !muted && (
        <button onClick={nextAmbientTrack} className="p-[0.2rem] transition hover:text-white" aria-label="Next">
          <SkipForward style={{ width: '1.1rem', height: '1.1rem' }} />
        </button>
      )}
    </div>
  );
}
