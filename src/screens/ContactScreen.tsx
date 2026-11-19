import { useEffect, useState } from 'react';
import { AtSign, Github, Linkedin, Mail, Music2, Play, Youtube, type LucideIcon } from 'lucide-react';
import { contacts, type ContactId } from '../data/profile';
import { useStore } from '../store';
import { useT } from '../i18n';
import { sfx } from '../lib/audio';
import { useInput } from '../lib/input';
import { HintBar } from '../components/HintBar';
import { TopBar } from '../components/Chrome';

const ICONS: Record<ContactId, LucideIcon> = { email: Mail, linkedin: Linkedin, github: Github, youtube: Youtube, tiktok: Music2, x: AtSign, play: Play };

export function ContactScreen() {
  const t = useT();
  const go = useStore((s) => s.go);
  const [sel, setSel] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  const activate = (i: number) => {
    const c = contacts[i];
    sfx.confirm();
    if (c.id === 'email') {
      void navigator.clipboard?.writeText(c.value).then(() => setToast(t('contact.copied')), () => undefined);
      window.location.href = c.url;
    } else window.open(c.url, '_blank', 'noopener,noreferrer');
  };

  useInput((a) => {
    if (a === 'up') { setSel((s) => (s + contacts.length - 1) % contacts.length); sfx.move(); }
    else if (a === 'down') { setSel((s) => (s + 1) % contacts.length); sfx.move(); }
    else if (a === 'confirm') activate(sel);
    else if (a === 'back') { sfx.back(); go('menu'); }
  });

  return (
    <div className="screen-in absolute inset-0 ps-ui">
      <TopBar icon={<Mail style={{ width: '2.1rem', height: '2.1rem' }} strokeWidth={1.5} />} title={t('contact.title')} sub="alexe1 · Elías Torczuk" />
      <div className="absolute left-1/2 top-[6.6rem] w-[40rem] -translate-x-1/2">
        <div className="ps-panel-dark overflow-hidden py-[0.4rem]">
          {contacts.map((c, i) => {
            const Icon = ICONS[c.id];
            return (
              <button
                key={c.id}
                onMouseEnter={() => { if (sel !== i) { setSel(i); sfx.move(); } }}
                onClick={() => activate(i)}
                className={`pointer-events-auto flex w-full items-center gap-[1.1rem] px-[1.4rem] py-[0.78rem] text-left transition ${sel === i ? 'ps-row-sel' : ''}`}
              >
                <Icon style={{ width: '1.7rem', height: '1.7rem' }} strokeWidth={1.6} className="text-sky-200" />
                <span className="w-[8rem] text-[1.3rem] font-medium">{c.label}</span>
                <span className="flex-1 truncate text-right text-[1.15rem] text-sky-100/75">{c.value}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-[0.8rem] text-center text-[0.95rem] text-sky-100/60">{toast || t('contact.hint')}</div>
      </div>
      <HintBar hints={[{ glyph: 'dpad', label: t('hint.move') }, { glyph: 'cross', label: t('contact.open'), action: 'confirm' }, { glyph: 'circle', label: t('hint.back'), action: 'back' }]} />
    </div>
  );
}
