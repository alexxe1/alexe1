/** Overlay CRT 100% CSS (compositor): scanlines, viñeta/esquinas, resplandor de fósforo y barra de refresco. */
export function CrtOverlay() {
  return (
    <div className="crt-layer z-40" aria-hidden>
      <div className="crt-layer crt-glow" />
      <div className="crt-layer crt-scan" />
      <div className="crt-layer crt-roll" />
      <div className="crt-layer crt-vignette" style={{ borderRadius: 'inherit' }} />
    </div>
  );
}
