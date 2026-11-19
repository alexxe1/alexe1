import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Save } from 'lucide-react';
import { projects, type Project, type Status } from '../data/projects';
import { useStore } from '../store';
import { useT, type Key } from '../i18n';
import { sfx } from '../lib/audio';
import { useInput } from '../lib/input';
import { HintBar } from '../components/HintBar';
import { TopBar } from '../components/Chrome';
import { GRID_COLS } from '../three/MemoryCardScene';

const STATUS_KEY: Record<Status, Key> = { live: 'status.live', wip: 'status.wip', offline: 'status.offline', academic: 'status.academic' };
const STATUS_COLOR: Record<Status, string> = { live: '#5fe3a0', wip: '#ffd75a', offline: '#ff9a6b', academic: '#9ec3ff' };

const open = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

export function ProjectsScreen() {
  const t = useT();
  const focus = useStore((s) => s.focus);
  const lang = useStore((s) => s.lang);
  const view = useStore((s) => s.projView);
  const setFocus = useStore((s) => s.setFocus);
  const setView = useStore((s) => s.setProjView);
  const go = useStore((s) => s.go);
  const n = projects.length;
  const p = projects[Math.min(focus, n - 1)];

  useEffect(() => {
    setView('grid');
    return () => {
      setView('grid');
      document.body.style.cursor = '';
    };
  }, [setView]);

  useInput((a) => {
    if (useStore.getState().projView !== 'grid') return;
    const f = useStore.getState().focus;
    let next = f;
    if (a === 'left') next = Math.max(0, f - 1);
    else if (a === 'right') next = Math.min(n - 1, f + 1);
    else if (a === 'up' && f - GRID_COLS >= 0) next = f - GRID_COLS;
    else if (a === 'down' && f + GRID_COLS < n) next = f + GRID_COLS;
    else if (a === 'confirm') {
      sfx.confirm();
      setView('menu');
      return;
    } else if (a === 'back') {
      sfx.back();
      go('menu');
      return;
    }
    if (next !== f) {
      setFocus(next);
      sfx.move();
    }
  });

  const date = p.date || t('proj.noDate');
  return (
    <div className="screen-in absolute inset-0 ps-ui">
      <TopBar icon={<Save style={{ width: '2.1rem', height: '2.1rem' }} strokeWidth={1.5} />} title={t('proj.header')} sub={t('proj.slot')} />

      {/* Panel de información del archivo enfocado */}
      <div className="absolute bottom-[3.6rem] left-[2.2rem] right-[2.2rem]">
        <div key={p.id} className="screen-in ps-panel flex gap-[1.6rem] px-[1.5rem] py-[1rem]">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[1.7rem] font-semibold leading-tight">{p.title}</div>
            <div className="mt-[0.3rem] line-clamp-2 text-[1.08rem] leading-snug text-sky-50/90">{p.short[lang]}</div>
            <div className="mt-[0.55rem] flex flex-wrap items-center gap-[0.4rem] text-[0.88rem]">
              {p.tags.map((tag) => (
                <span key={tag} className="ps-chip">{tag}</span>
              ))}
            </div>
          </div>
          <div className="w-[12rem] shrink-0 space-y-[0.3rem] border-l border-sky-200/25 pl-[1.4rem] text-[1.05rem]">
            <Row k={t('proj.saved')} v={date} />
            <Row k={t('proj.size')} v={`${p.sizeKB} KB`} />
            <div className="flex items-center gap-[0.45rem] pt-[0.2rem] text-[0.95rem]">
              <span className="inline-block h-[0.6rem] w-[0.6rem] rounded-full" style={{ background: STATUS_COLOR[p.status], boxShadow: `0 0 0.6rem ${STATUS_COLOR[p.status]}` }} />
              {t(STATUS_KEY[p.status])}
            </div>
          </div>
        </div>
      </div>

      {view === 'menu' && <ContextMenu project={p} index={focus} />}
      {view === 'details' && <Details project={p} />}

      <HintBar
        hints={
          view === 'details'
            ? [{ glyph: 'dpad', label: t('hint.shot') }, { glyph: 'circle', label: t('hint.back'), action: 'back' }]
            : [{ glyph: 'dpad', label: t('hint.move') }, { glyph: 'cross', label: t('hint.select'), action: 'confirm' }, { glyph: 'circle', label: t('hint.back'), action: 'back' }]
        }
      />
    </div>
  );
}

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between gap-[0.8rem]">
    <span className="text-sky-100/65">{k}</span>
    <span className="tabular-nums">{v}</span>
  </div>
);

/* ------------------------- Submenú clásico de PS2 adaptado ------------------------- */
function ContextMenu({ project, index }: { project: Project; index: number }) {
  const t = useT();
  const setView = useStore((s) => s.setProjView);
  const [sel, setSel] = useState(0);
  const [msg, setMsg] = useState('');

  const items = useMemo(
    () => [
      { key: 'proj.demo' as Key, url: project.demo?.url, run: () => project.demo && open(project.demo.url) },
      { key: 'proj.source' as Key, url: project.repo, run: () => project.repo && open(project.repo) },
      { key: 'proj.details' as Key, url: 'x', run: () => setView('details') },
      { key: 'proj.back' as Key, url: 'x', run: () => setView('grid') },
    ],
    [project, setView],
  );

  useInput((a) => {
    if (a === 'up') { setSel((s) => (s + items.length - 1) % items.length); sfx.move(); }
    else if (a === 'down') { setSel((s) => (s + 1) % items.length); sfx.move(); }
    else if (a === 'back') { sfx.back(); setView('grid'); }
    else if (a === 'confirm') {
      const it = items[sel];
      if (!it.url) return sfx.error();
      it.key === 'proj.back' ? sfx.back() : sfx.confirm();
      if (it.key === 'proj.demo' || it.key === 'proj.source') setMsg(t('proj.opening'));
      it.run();
    }
  });

  const left = index % GRID_COLS >= 3; // para no tapar el ícono enfocado
  return (
    <div className={`screen-in pointer-events-auto absolute top-[24%] w-[19.5rem] ${left ? 'left-[2.6rem]' : 'right-[2.6rem]'}`}>
      <div className="ps-panel-dark overflow-hidden py-[0.4rem]">
        <div className="truncate border-b border-sky-200/20 px-[1.1rem] pb-[0.5rem] pt-[0.3rem] text-[1.05rem] font-semibold text-sky-100">{project.title}</div>
        {items.map((it, i) => (
          <button
            key={it.key}
            onMouseEnter={() => setSel(i)}
            onClick={() => {
              setSel(i);
              if (!it.url) return sfx.error();
              it.key === 'proj.back' ? sfx.back() : sfx.confirm();
              it.run();
            }}
            className={`flex w-full items-center justify-between px-[1.1rem] py-[0.55rem] text-left text-[1.2rem] transition ${sel === i ? 'ps-row-sel' : ''} ${it.url ? '' : 'opacity-40'}`}
          >
            <span>{t(it.key)}</span>
            {!it.url ? <span className="text-[0.8rem]">{t('proj.unavailable')}</span> : (it.key === 'proj.demo' || it.key === 'proj.source') && <ExternalLink style={{ width: '1rem', height: '1rem' }} className="opacity-70" />}
          </button>
        ))}
      </div>
      {msg && <div className="mt-[0.5rem] text-center text-[0.9rem] text-sky-100/70">{msg}</div>}
    </div>
  );
}

/* ------------------------- Detalles técnicos ------------------------- */
function Details({ project }: { project: Project }) {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const setView = useStore((s) => s.setProjView);
  const [shot, setShot] = useState(0);
  const [link, setLink] = useState(0);
  const shots = project.shots ?? [];

  const links = useMemo(() => {
    const arr: { label: string; url: string }[] = [];
    if (project.demo) arr.push({ label: t('detail.demo'), url: project.demo.url });
    if (project.repo) arr.push({ label: t('detail.repo'), url: project.repo });
    project.links?.forEach((l) => { if (!arr.some((a) => a.url === l.url)) arr.push(l); });
    return arr;
  }, [project, t]);

  useInput((a) => {
    if (a === 'back') { sfx.back(); setView('menu'); }
    else if (a === 'left' && shots.length) { setShot((s) => (s + shots.length - 1) % shots.length); sfx.move(); }
    else if (a === 'right' && shots.length) { setShot((s) => (s + 1) % shots.length); sfx.move(); }
    else if (a === 'up' && links.length) { setLink((s) => (s + links.length - 1) % links.length); sfx.move(); }
    else if (a === 'down' && links.length) { setLink((s) => (s + 1) % links.length); sfx.move(); }
    else if (a === 'confirm' && links[link]) { sfx.confirm(); open(links[link].url); }
  });

  return (
    <div className="screen-in pointer-events-auto absolute bottom-[3.6rem] left-[2.2rem] right-[2.2rem] top-[5.6rem]">
      <div className="ps-panel-dark flex h-full gap-[1.4rem] p-[1.2rem]">
        {shots.length > 0 && (
          <div className="relative w-[26rem] shrink-0">
            <div className="relative h-full overflow-hidden rounded-[0.5rem] border border-sky-200/30 bg-black">
              <img key={shots[shot]} src={shots[shot]} alt={`${project.title} ${shot + 1}`} className="screen-in h-full w-full object-cover" draggable={false} />
              <button onClick={() => { setShot((s) => (s + shots.length - 1) % shots.length); sfx.move(); }} className="absolute left-[0.4rem] top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-[0.2rem] hover:bg-black/80" aria-label="Previous"><ChevronLeft style={{ width: '1.6rem', height: '1.6rem' }} /></button>
              <button onClick={() => { setShot((s) => (s + 1) % shots.length); sfx.move(); }} className="absolute right-[0.4rem] top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-[0.2rem] hover:bg-black/80" aria-label="Next"><ChevronRight style={{ width: '1.6rem', height: '1.6rem' }} /></button>
              <div className="absolute bottom-[0.4rem] right-[0.6rem] rounded bg-black/55 px-[0.5rem] text-[0.85rem] tabular-nums">{shot + 1} / {shots.length}</div>
            </div>
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-[0.8rem] overflow-y-auto pr-[0.4rem] text-[1.08rem]">
          <div className="text-[1.6rem] font-semibold leading-tight">{project.title}</div>
          <p className="leading-snug text-sky-50/90">{project.long[lang]}</p>
          <Block label={t('detail.stack')}><div className="flex flex-wrap gap-[0.4rem]">{project.tags.map((x) => <span key={x} className="ps-chip text-[0.9rem]">{x}</span>)}</div></Block>
          {project.platforms && <Block label={t('detail.platforms')}><span>{project.platforms.join(' · ')}</span></Block>}
          <Block label={t('detail.status')}><span style={{ color: STATUS_COLOR[project.status] }}>{t(STATUS_KEY[project.status])}</span></Block>
          <Block label={t('detail.links')}>
            {links.length === 0 && <span className="text-sky-100/60">{t('detail.none')}</span>}
            <div className="flex flex-col gap-[0.2rem]">
              {links.map((l, i) => (
                <button key={l.url} onMouseEnter={() => setLink(i)} onClick={() => { sfx.confirm(); open(l.url); }} className={`flex items-center justify-between rounded px-[0.6rem] py-[0.25rem] text-left transition ${link === i ? 'ps-row-sel' : ''}`}>
                  <span>{l.label}</span>
                  <span className="ml-[1rem] truncate text-[0.85rem] text-sky-100/55">{l.url.replace(/^https?:\/\//, '')}</span>
                </button>
              ))}
            </div>
          </Block>
        </div>
      </div>
    </div>
  );
}

const Block = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <div className="mb-[0.25rem] text-[0.82rem] uppercase tracking-[0.18em] text-sky-200/60">{label}</div>
    {children}
  </div>
);
