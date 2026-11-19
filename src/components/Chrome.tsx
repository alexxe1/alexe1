import { useEffect, useState, type ReactNode } from 'react';

export function useClock() {
  const fmt = () => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}  ${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  const [v, setV] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setV(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return v;
}

/** Barra superior de pantalla: icono + título a la izquierda, reloj a la derecha (como el BIOS). */
export function TopBar({ icon, title, sub }: { icon?: ReactNode; title: string; sub?: string }) {
  const clock = useClock();
  return (
    <div className="absolute left-0 right-0 top-0 flex items-start justify-between px-[2.2rem] pt-[1.4rem] ps-ui">
      <div className="flex items-center gap-[0.8rem]">
        {icon && <div className="text-sky-200">{icon}</div>}
        <div>
          <div className="text-[1.7rem] font-semibold leading-none tracking-wide">{title}</div>
          {sub && <div className="mt-[0.25rem] text-[0.95rem] text-sky-100/70">{sub}</div>}
        </div>
      </div>
      <div className="pt-[0.2rem] text-[1rem] tabular-nums text-sky-100/80">{clock}</div>
    </div>
  );
}
