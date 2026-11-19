# alexe1 · Portafolio estilo PS2 (BIOS + Memory Card)

Reconstrucción de https://alexe1.vercel.app como una experiencia interactiva inspirada en la BIOS de PlayStation 2:
React 18 + TypeScript + Vite + Tailwind 3 + Three.js / React Three Fiber + Lucide + Web Audio API.

```bash
npm install
npm run dev        # desarrollo
npm run build      # type-check + build de producción en /dist
```

## Flujo
`POWER (PS2 en 3D, botón I/O clickeable)` → `intro de torres (commits)` → negro → logo + `alexe1` → **menú**:
**Proyectos** (Memory Card) · **Sobre mí** (System Configuration / Stack / Versión) · **Currículum** · **Contacto**.

## Controles (simulan un DualShock)
| Acción | Teclado | Mouse | Gamepad |
|---|---|---|---|
| Mover | Flechas / WASD | hover | cruceta / stick izq. |
| Aceptar ✕ | Enter / Espacio | click | ✕ |
| Volver ○ | Escape / Backspace | botón de la barra inferior | ○ |
| Mute | M | botón abajo-izquierda | – |

Fuera del marco 4:3 (esquina de la ventana): **CRT on/off**, **ES/EN** y **pantalla completa**.

## Dónde se edita cada cosa
| Qué | Archivo |
|---|---|
| Proyectos (texto ES/EN, enlaces, capturas, fecha) | `src/data/projects.ts` |
| Contacto, stack, datos personales | `src/data/profile.ts` |
| CV en pantalla (una sola versión) | `src/data/cv.ts` + PDF en `public/cv/` |
| Música ambiental | `src/config/audio.ts` (+ archivos en `public/audio/`) |
| Textos de interfaz ES/EN | `src/i18n.ts` |
| Commits de las torres | `src/data/github-commits.json` / `api/github-commits.js` |

### Agregar un proyecto
1. Agregá un objeto en `projects` (`src/data/projects.ts`). Sin `demo` → "Ver Demo" queda gris; sin `repo` → "Código Fuente" queda gris.
2. Elegí un `icon` existente o creá uno nuevo en `src/three/icons/index.ts` (función que arma geometrías con colores por vértice y devuelve `update(t, k, dt)`; `k` = 0..1 qué tan seleccionado está) y sumalo a `BUILDERS` + al tipo `IconId`.
3. La grilla crece sola (5 columnas; mínimo 10 ranuras, las libres se ven como "sin datos").

> Fechas vacías (`date: ''`) se muestran como `----/--/--`. Los KB son decorativos.

### Commits reales de GitHub
`src/lib/commits.ts` intenta `GET /api/github-commits` y, si no existe o falla, usa el mock.
`api/github-commits.js` es una Vercel Function que consulta la API GraphQL (`contributionCalendar`) con el token **en el servidor**.
En Vercel → Settings → Environment Variables: `GITHUB_TOKEN` (PAT con `read:user`) y opcional `GITHUB_USER` (por defecto `alexxe1`).
El mock tiene exactamente la misma forma (`weeks[].contributionDays[]`); regeneralo con `npm run mock:commits`.

### Música
```ts
// src/config/audio.ts
export const AMBIENT_TRACKS = [
  { src: './audio/ambient-1.mp3', title: 'Ambient I' },
  { src: './audio/ambient-2.ogg', title: 'Ambient II' },
];
```
Playlist en bucle con crossfade (`CROSSFADE_SECONDS`). Con el array vacío suena un ambiente generativo sintetizado. Los SFX (cristalinos/acuáticos) siempre se sintetizan con Web Audio.

### Política de privacidad de Krypto
Google Play la necesita online: está en `public/krypto/privacy/index.html` (URL `/krypto/privacy/`). Además, el link viejo con hash (`#/krypto/privacy`) redirige ahí. `public/app-ads.txt` se conserva.

## Arranque estilo PS2 y audios
La intro sigue la secuencia del arranque de la PS2, sincronizada con **tu** `ps2_startup.mp3`:
1. Vista de pájaro del campo de torres completo, en horizontal, acercándose muy de a poco.
2. Avance cada vez más rápido hacia el **centro de la ciudad** (entra por la avenida central vacía), mientras 4 luces de colores con estela recorren las torres.
3. Muy cerca de las torres: fundido a negro. ~1 s después, el logo (`public/img/logo.png`) y `alexe1` pasan de negro a color muy rápido mientras suena `ps2_logo.mp3`.

Los íconos flotan a `ICON_Z` de su baldosa (en `MemoryCardScene.tsx`) para que al girar no la atraviesen.

Las torres brotan del suelo todas a la vez (`RISE_SECONDS`). El dash hacia el centro arranca en el segundo 8 del audio (`DASH_START`).

Ajustes de la intro en `src/three/IntroScene.tsx`: `cameraPath()` (distancia/elevación/fov), `WISPS` (cantidad, colores y órbitas de las luces) y las constantes de tiempo al final de `useFrame` (`D - 0.45` = inicio del negro, `D + 0.65` = aparece el logo).

**Dónde van los audios** (ya están copiados, podés reemplazarlos):
```
public/audio/ps2_startup.mp3   ← suena mientras están las torres (~10,2 s)
public/audio/ps2_logo.mp3      ← suena al aparecer el logo + alexe1 (~0,9 s)
```
Rutas configurables en `src/config/audio.ts` (`BOOT_AUDIO`). **La duración real de `ps2_startup.mp3` define el ritmo de toda la intro**:
si ponés uno más largo o corto, la animación se estira o se comprime sola. Si falta un archivo, se usa un sonido sintetizado de reemplazo.
> Ojo: ambos sonidos son material de Sony. Para un sitio público conviene confirmar que podés usarlos o reemplazarlos por audios propios con los mismos nombres.

Las 52 semanas se acomodan en 4 bloques de 13 semanas (un trimestre cada uno, 2×2) con un pasillo en cruz; cada torre sigue siendo un día (altura/brillo ∝ commits). Las semanas corren de izquierda a derecha.

## Modelos 3D, logos y créditos
| Archivo | Uso |
|---|---|
| `public/models/ps2_slim_low_poly.glb` | Consola de la pantalla POWER (el botón y el LED 3D se agregan en `src/three/Ps2Model.tsx`; coordenadas `BTN` / `LED`). |
| `public/models/krypto.glb` | Ícono de Krypto. |
| `public/models/doll-head.glb` | Ícono de The Noris Project (sólo la cabeza de `doll.glb`, texturas a 512px: 5 MB → 0,4 MB). |
| `public/img/logos/*.png` + `src/three/shapes/*.json` | Logos con grosor (Noisepad, Waka Waka, Assetly). Los `.json` son los contornos extraídos del canal alfa de cada PNG. |
| `public/img/logo.png` | Logo del arranque. |

Para cambiar el modelo de la PS2: reemplazá el `.glb` y ajustá `MODEL_CENTER`, `MODEL_W`, `FRONT_Z`, `BTN` y `LED` en `Ps2Model.tsx`.

**Atribuciones (CC BY 4.0, obligatorias; se muestran en Sobre mí → Versión):**
- "PS2 Slim low poly" by alexdperdomo — https://skfb.ly/6X6RH — CC BY 4.0 (se agregó botón de encendido y LED).
- "doll" by lucq22 — https://sketchfab.com/3d-models/doll-51b4dafa7fa745c0af8e3772d0ac8a33 — CC BY 4.0 (sólo la cabeza, texturas optimizadas).

## Rendimiento
- Un solo `<Canvas>` persistente; cada pantalla monta/desmonta su escena y libera geometrías/materiales/texturas en el cleanup.
- 364 torres = 2 `InstancedMesh` (2 draw calls). Orbes y polvo: shaders de puntos animados en GPU (cero CPU por frame).
- Íconos de la Memory Card: ~2.500 triángulos en total, material compartido.
- CRT 100% CSS (scanlines, viñeta, curvatura de esquinas, brillo de fósforo, fringe cromático en bordes/texto): sin filtros SVG ni backdrop-filter.
- `dpr` limitado a 1.75.
