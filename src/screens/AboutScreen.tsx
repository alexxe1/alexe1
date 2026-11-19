import { useState } from 'react';
import { User } from 'lucide-react';
import { modelCredits, profile, stack } from '../data/profile';
import { useStore } from '../store';
import { useT, type Key } from '../i18n';
import { sfx } from '../lib/audio';
import { useInput } from '../lib/input';
import { HintBar } from '../components/HintBar';
import { TopBar } from '../components/Chrome';
import type { CommitData } from '../lib/commits';

const TABS: { id: 'system' | 'stack' | 'version'; key: Key }[] = [
  { id: 'system', key: 'about.tab.system' },
  { id: 'stack', key: 'about.tab.stack' },
  { id: 'version', key: 'about.tab.version' },
];

/** Sobre mí / Stack con estética de "System Configuration" y "Version" de la PS2. */
export function AboutScreen({ commits }: { commits: CommitData }) {
  const t = useT();
  const go = useStore((s) => s.go);
  const lang = useStore((s) => s.lang);
  const [tab, setTab] = useState(0);

  useInput((a) => {
    if (a === 'left') { setTab((x) => (x + TABS.length - 1) % TABS.length); sfx.move(); }
    else if (a === 'right') { setTab((x) => (x + 1) % TABS.length); sfx.move(); }
    else if (a === 'back') { sfx.back(); go('menu'); }
  });

  const rows: [string, string][] =
    TABS[tab].id === 'system'
      ? [
          [t('about.name'), profile.name],
          [t('about.alias'), profile.alias],
          [t('about.role'), t('about.roleValue')],
          [t('about.focus'), t('about.focusValue')],
          [t('about.langs'), t('about.langsValue')],
        ]
      : [
          [t('ver.console'), t('ver.consoleValue')],
          [t('ver.rom'), 'v8.1.1'],
          [t('ver.engine'), t('ver.engineValue')],
          [t('ver.commits'), `${commits.source === 'api' ? t('ver.commitsApi') : t('ver.commitsMock')} · ${commits.total}`],
        ];

  const groups: [Key, string[]][] = [
    ['stack.languages', stack.languages],
    ['stack.frameworks', stack.frameworks],
    ['stack.tools', stack.tools],
  ];

  return (
    <div className="screen-in absolute inset-0 ps-ui">
      <TopBar icon={<User style={{ width: '2.1rem', height: '2.1rem' }} strokeWidth={1.5} />} title={t('about.title')} sub="alexe1 Portfolio System" />

      <div className="absolute left-[2.2rem] right-[2.2rem] top-[6.2rem] bottom-[3.8rem] flex flex-col">
        <div className="flex gap-[0.4rem]">
          {TABS.map((x, i) => (
            <button
              key={x.id}
              onClick={() => { setTab(i); sfx.move(); }}
              className={`pointer-events-auto rounded-t-[0.5rem] border border-b-0 px-[1.6rem] py-[0.45rem] text-[1.15rem] transition ${i === tab ? 'border-sky-200/60 bg-sky-400/25 text-white' : 'border-sky-200/20 bg-black/30 text-sky-100/55 hover:text-white'}`}
            >
              {t(x.key)}
            </button>
          ))}
        </div>
        <div key={tab} className="screen-in ps-panel-dark flex-1 overflow-y-auto rounded-tl-none p-[1.4rem]">
          {TABS[tab].id === 'stack' ? (
            <div className="flex flex-col gap-[1.4rem]">
              {groups.map(([k, items]) => (
                <div key={k}>
                  <div className="mb-[0.5rem] text-[0.9rem] uppercase tracking-[0.2em] text-sky-200/65">{t(k)}</div>
                  <div className="flex flex-wrap gap-[0.6rem]">
                    {items.map((x) => (
                      <span key={x} className="ps-chip text-[1.25rem] px-[1.1rem] py-[0.25rem]">{x}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              {rows.map(([k, v], i) => (
                <div key={k} className={`flex items-baseline justify-between gap-[2rem] px-[0.8rem] py-[0.62rem] text-[1.2rem] ${i % 2 ? '' : 'bg-sky-300/[0.07]'}`}>
                  <span className="text-sky-100/65">{k}</span>
                  <span className="text-right">{v}</span>
                </div>
              ))}
              {TABS[tab].id === 'version' && (
                <div className="mt-[1.1rem] px-[0.8rem] text-[0.98rem] leading-snug">
                  <div className="mb-[0.4rem] text-[0.82rem] uppercase tracking-[0.2em] text-sky-200/60">{t('ver.credits')}</div>
                  {modelCredits.map((c) => (
                    <p key={c.title} className="mb-[0.35rem] text-sky-50/85">
                      “<a href={c.url} target="_blank" rel="noopener noreferrer" className="pointer-events-auto underline decoration-sky-300/50 hover:text-white">{c.title}</a>” by {c.author} ·{' '}
                      <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer" className="pointer-events-auto underline decoration-sky-300/50 hover:text-white">{c.license}</a>
                      {' '}· {t('ver.modified')}: {c.changes[lang]}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <HintBar hints={[{ glyph: 'dpad', label: t('hint.tab') }, { glyph: 'circle', label: t('hint.back'), action: 'back' }]} />
    </div>
  );
}
