# Build a cinematic scroll-driven artist page

Act as a designer, creative director and website developer. Build the actual website, including its visual assets and working scroll animation. The centrepiece is **one continuous lip-synced performance**: a single unbroken 30-second take of Aria singing her debut single «Non sei polvere», with the original audio as the master clock — scroll and frames follow the voice, never the other way round. Motion, typography and content should feel composed together.

Adattamento di `01-desktop-drone-flythrough.md` al caso reale: il video è fornito
dall'utente (non generato), il sito è una pagina artista con audio sincronizzato.

## 1. Brief con minima frizione
- Leggere conversazione e materiali; poche domande mirate (business/CTA, brand, percorso video).
- Due modalità: guidata (review a punti) o autonoma/template (default + assunzioni registrate).
- Non inventare fatti: link/claim solo se forniti, altrimenti placeholder dichiarati.

## 2. Identità e direzione visiva
- Asset forniti = autorevoli, non ridisegnare loghi esistenti.
- Senza reference: direzione coerente dedotta dal contenuto (qui: «polvere editoriale»).
- Style tile implicito nei design token reali (palette, type, CTA, grana, motion).
- Skill `frontend-design` per la direzione; varianti proposte come opzioni A/B/C/D.

## 3. Visual Story su timestamp reali
- Tabella **Slot | Tempo | Frase | Sub | Layout | Motion** calibrata sulla durata vera
  (qui: 10 slot da 3s su 30.125s), non su un percorso ipotetico.
- Beat capitoli (hero/climax/finale) con clip `from/to` reali + `vh` per beat.
- Scroll pacing in viewport heights, indipendente dalla durata clip; hold su apertura
  e finale; beat veloci = propri segmenti per non sembrare salti.
- Regola anti-overlap: zone testo disgiunte per costruzione (qui: letterbox con
  caption in banda superiore, capitoli sul video, header auto-nascosto nel pinned).

## 4. Ingest del video fornito (sostituisce la generazione)
1. Metadati: `ffprobe` (durata, fps, dimensioni, audio presente?).
2. Cut-detection: `select='gt(scene,0.3)'` — take unico → flusso continuo; con tagli,
   beat mappati sui tagli.
3. Audio: `volumedetect` + envelope per sezioni — se piatto/non legato al labiale,
   segnalarlo (nessun codice riallinea una sorgente sfasata).
4. Master normalizzato 1920x1080/24fps + audio AAC separato.
5. Frame-sequence browser-ready: `fps=20,scale=1440:-2` WebP + manifest
   (count, fps, dimensioni, poster, version) + poster start/mid/end.

## 5. Build sito
- Canvas pinnato + timeline piecewise editabile (`content.json`: beat, caption, copy).
- Audio performance mode: parte su gesto, master-clock (con estrapolazione tra update),
  draw sincrono da cache + prefetch direzionale; stop su qualsiasi input utente.
- Copy semantico fuori dal canvas; skip-link; poster durante load; lazy/prefetch;
  reduced-motion statico; reflow mobile vero.
- Fallback `file://`: default inline nel JS (niente fetch), font di sistema.

## 6. Contenuto sostituibile, validazione, delivery
- Copy/beat/caption in content file; form con destinazione reale o demo dichiarata.
- Check: manifest/path/poster, ogni beat raggiunge il frame, no horizontal scroll,
  desktop + mobile; distinguere verificato da non verificato.
- Pubblicare solo su scope autorizzato; nota di produzione con scelte, misure e limiti.
