# Piano dettagliato — Aria «Non sei polvere» (sito scroll-driven 30s)

Adattamento di `01-desktop-drone-flythrough.md` al progetto reale: video fornito
dall'utente (non generato), pagina artista, performance mode audio-clock.

## 1. Brief (chiuso)
- Artista: **Aria** — primo singolo **«Non sei polvere»**, status **coming soon**
- CTA: ascolto 30s in pagina + «Avvisami all'uscita» (mailto dichiarato, nessun link inventato)
- Modalità: autoplay 30s guidato dall'audio + scroll manuale libero con frame-sequence
- Sorgente: `siiiiiiiiiiii.mp4` — 30.1s, 723f, 24fps, 1152x640, take unico verificato
  (cut-detection `scene>0.3`: zero tagli), audio AAC presente
- Nota onesta: envelope audio piatto (~−27dB, sale solo ultimi 5s) → probabile tappeto
  AI non legato al labiale. Test VLC del mp4 originale per confermare; se sfasato in
  origine, serve la traccia vocale vera (nessun codice può riallinearla).

## 2. Identità (applicata)
- Direzione «polvere editoriale»: dark #100d0a, bone #f2ece1, ember #e0973f
- Font **A**: Cormorant Garamond (display 600) + Outfit (UI) — fallback Georgia/system
- Style implicito: grana animata, vignettatura calda, hairline progresso, bande letterbox
  vetro fumé 55% + blur 14px, 7 rollover sobri, contatore 01/10

## 3. Visual Story reale (slot da 3s sui 30.125s)
| Slot | Tempo | Frase | Sub | Layout banda | Motion |
|---|---|---|---|---|---|
| 1 | 0–3 | Aria è arrivata. | Il primo singolo sta per alzare la polvere. | sx | rise-blur |
| 2 | 3–6 | Trenta secondi. | Tanto basta per non dimenticarla più. | centro-alto | slide |
| 3 | 6–9 | Canta piano. | Per farsi sentire forte. | centro | wipe |
| 4 | 9–12 | «Non sei polvere» | Il titolo è una promessa, non un titolo. | sx-alto | tracking |
| 5 | 12–15 | Un take solo. | Niente rete. Niente filtri. Niente scuse. | dx | scale |
| 6 | 15–18 | Polvere | Si alza. Lei resta. | centro ember | zoomout |
| 7 | 18–21 | E se fosse per te? | Questa canzone parla a chi resta in piedi. | sx | stagger |
| 8 | 21–24 | Coming soon | Ovunque si ascolta musica. Prestissimo. | badge centro | rise |
| 9 | 24–27 | Segui la genesi. | Il viaggio comincia prima dell'uscita. | dx corsivo | slide-blur |
| 10 | 27–30 | Non sei polvere. | Avvisami all'uscita. | centro glow | glow-hold |

Capitoli scroll (beat): hero 0–5s / climax 5–22s / finale 22–30.125s + hold.
Copy capitoli ridotto (titolo → una riga → CTA); le caption sono la voce principale.
Regola anti-overlap: caption solo in banda superiore, capitoli sul video, header
auto-nascosto durante il pinned.

## 4. Pipeline ingest (al posto della generazione Higgsfield)
1. Master: `scale=1920:1080,fps=24,yuv420p` + AAC 160k → `flythrough-master.mp4`
2. Frame: `fps=20,scale=1440:-2` WebP q78 → `frames/frame-%04d.webp` (603 file, ~15MB)
3. Audio: AAC 160k → `public/audio/song.m4a` (30.15s)
4. Poster start/mid/end + `frames/manifest.json` (v2)
5. Cut-detection e volumedetect a ogni cambio sorgente

## 5. Build sito (stato: implementato, da validare sul browser)
- Canvas pinnato 490vh+100vh, piecewise timeline da `content.json` (fallback inline in
  `app.js` per `file://`, dove il fetch è bloccato da CORS)
- Autoplay: salto a inizio, audio master-clock con estrapolazione `performance.now()`,
  draw diretto sincrono da cache + prefetch ±10, bottone nascosto, stop su qualsiasi input
- Cache 24 frame, poster→canvas, reduced-motion statico, skip-link, reflow mobile
- File: `index.html` (principale), `index-new.html` (copia lavoro), `app.js`,
  `styles.css`, `content.json`

## 6. Validazione e delivery (da fare)
- [ ] Scroll reale desktop + mobile: ogni beat raggiunge il frame, hold finale ok
- [ ] Lip-sync: confronto VLC originale vs sito
- [ ] Sostituire placeholder: bio, testo brano, streaming, booking
- [ ] Valutare normalizzazione audio a −14 LUFS
- [ ] Pubblicare solo su scope autorizzato; altrimenti consegna locale + nota limiti
- [ ] Mantenere `piano.md` (plan dir + copia nel folder) aggiornato a ogni cambio

## Mappa decisioni prese
- Performance mode ibrido → poi full-sync 30s (audio unico orologio)
- Bottone sparisce in autoplay, poi «Rigioca ⟳»
- Letterbox A (vetri fumé 55%) contro overlap strutturale
- 7 rollover sobri; font A dopo giro A→C→D→A
