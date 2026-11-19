import { useRef } from 'react';
import { Download, FileText } from 'lucide-react';
import { cv } from '../data/cv';
import { useStore } from '../store';
import { useT } from '../i18n';
import { sfx } from '../lib/audio';
import { useInput } from '../lib/input';
import { HintBar } from '../components/HintBar';
import { TopBar } from '../components/Chrome';

/** CV armado desde datos (src/data/cv.ts) con dos versiones y descarga del PDF correspondiente. */
export function CvScreen() {
  const t = useT();
  const go = useStore((s) => s.go);
  const body = useRef<HTMLDivElement>(null);

  const download = () => {
    sfx.confirm();
    const a = document.createElement('a');
    a.href = cv.pdf;
    a.download = cv.pdf.split('/').pop() ?? 'cv.pdf';
    a.click();
  };

  useInput((a) => {
    if (a === 'up') body.current?.scrollBy({ top: -90, behavior: 'smooth' });
    else if (a === 'down') body.current?.scrollBy({ top: 90, behavior: 'smooth' });
    else if (a === 'confirm') download();
    else if (a === 'back') { sfx.back(); go('menu'); }
  });

  const H = ({ children }: { children: string }) => (
    <h3 className="mb-[0.5rem] mt-[1.3rem] border-b border-sky-300/35 pb-[0.2rem] text-[0.95rem] font-semibold uppercase tracking-[0.2em] text-sky-300">{children}</h3>
  );

  return (
    <div className="screen-in absolute inset-0 ps-ui">
      <TopBar icon={<FileText style={{ width: '2.1rem', height: '2.1rem' }} strokeWidth={1.5} />} title={t('cv.title')} sub={cv.headline} />

      <div className="absolute left-[2.2rem] right-[2.2rem] top-[6.2rem] bottom-[3.8rem] flex flex-col gap-[0.7rem]">
        <div className="flex items-center justify-end">
          <button onClick={download} className="pointer-events-auto ps-panel flex items-center gap-[0.5rem] px-[1.1rem] py-[0.3rem] text-[1.05rem] transition hover:brightness-125">
            <Download style={{ width: '1.1rem', height: '1.1rem' }} />
            {t('cv.download')}
          </button>
        </div>

        <div ref={body} className="screen-in ps-panel-dark pointer-events-auto flex-1 overflow-y-auto px-[1.8rem] pb-[1.6rem] pt-[1.2rem] text-[1.08rem] leading-snug">
          <div className="text-[2rem] font-semibold leading-none">{cv.name}</div>
          <div className="mt-[0.35rem] text-sky-200">{cv.headline}</div>
          <div className="text-[0.95rem] text-sky-100/55">{cv.location}</div>

          <H>{t('cv.about')}</H>
          <p>{cv.about}</p>
          <H>{t('cv.interests')}</H>
          <p>{cv.interests}</p>
          <H>{t('cv.education')}</H>
          <div className="flex justify-between gap-[1rem]">
            <span className="font-semibold">{cv.education.title}</span>
            <span className="text-sky-100/60">{cv.education.school} · {cv.education.period}</span>
          </div>
          <p className="mt-[0.2rem]">{cv.education.text}</p>
          <H>{t('cv.projects')}</H>
          <div className="flex flex-col gap-[0.8rem]">
            {cv.projects.map((p) => (
              <div key={p.name}>
                <div><span className="font-semibold text-sky-100">{p.name}</span> <span className="text-[0.95rem] text-sky-100/55">— {p.meta}</span></div>
                <p className="text-sky-50/90">{p.text}</p>
              </div>
            ))}
          </div>
          <H>{t('cv.tech')}</H>
          <div className="grid grid-cols-[8rem_1fr] gap-y-[0.2rem]">
            <span className="text-sky-300">{t('cv.langs')}</span><span>{cv.tech.languages}</span>
            <span className="text-sky-300">{t('cv.frameworks')}</span><span>{cv.tech.frameworks}</span>
            <span className="text-sky-300">{t('cv.tools')}</span><span>{cv.tech.tools}</span>
          </div>
          <H>{t('cv.languages')}</H>
          {cv.languages.map((l) => (
            <div key={l.name}><span className="font-semibold">{l.name}</span> <span className="text-sky-100/60">— {l.level}</span></div>
          ))}
        </div>
      </div>

      <HintBar
        hints={[
          { glyph: 'dpad', label: t('hint.scroll') },
          { glyph: 'cross', label: t('cv.download'), action: 'confirm' },
          { glyph: 'circle', label: t('hint.back'), action: 'back' },
        ]}
      />
    </div>
  );
}
