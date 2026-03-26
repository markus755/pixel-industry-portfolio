# Audio-Dateien: Workflow

Die MP3-Dateien für den Audio-Player sind statisch in Git versioniert (`audio/*.mp3`).
Kein Build-Prozess läuft automatisch – Audio wird nur bei Bedarf manuell generiert.

## Audio für eine neue Projektseite generieren

### Voraussetzungen

- Node.js 18+ installiert
- Google Cloud Service Account JSON (einmalig bei Markus anfragen / im Google Cloud Console nachschlagen)

### Schritte

**1. Neue Projektseite anlegen**

Erstelle `projects/meine-neue-seite.html` mit dem üblichen Aufbau.
Der Text in `.project-header h1` und `.project-column` wird für das Audio verwendet.

**2. Script lokal ausführen**

Im Terminal, im Projektordner:

```bash
GOOGLE_APPLICATION_CREDENTIALS_JSON='HIER_DAS_KOMPLETTE_JSON_EINFÜGEN' \
REGENERATE_AUDIO=true \
node netlify/build-audio.js
```

Das JSON findest du in der Google Cloud Console unter:
**IAM & Admin → Service Accounts → pixel-industry-tts → Keys**

**3. Was das Script automatisch macht**

- Liest den Text aus der neuen HTML-Datei
- Berechnet einen Hash des Textes (z. B. `meine-neue-seite-a1b2c3d4`)
- Generiert `audio/meine-neue-seite-a1b2c3d4.mp3` via Google Cloud TTS (Stimme: en-US-Studio-Q)
- Schreibt `data-audio-file="meine-neue-seite-a1b2c3d4.mp3"` direkt in das `<main>`-Element der HTML-Datei
- Bestehende Audio-Dateien (für unveränderte Seiten) werden **nicht** neu generiert

**4. Ergebnis committen**

```bash
git add audio/meine-neue-seite-a1b2c3d4.mp3 projects/meine-neue-seite.html
git commit -m "Add new project page with audio"
git push
```

---

## Bestehende Audio-Datei aktualisieren (Textänderung)

Wenn du den Text einer bestehenden Projektseite änderst, ändert sich der Hash →
das Script erkennt das automatisch und generiert eine neue MP3.

Ablauf identisch zu oben: Script ausführen, beide Dateien committen.

---

## Warum dieser Ansatz?

- **Kein Quota-Verbrauch bei Deploys** – Google TTS wird nur lokal aufgerufen
- **Kein Build-Prozess auf dem Server** – GitHub Pages und Netlify liefern einfach statische Dateien
- **Reproduzierbar** – gleicher Text ergibt immer gleiche Datei (Hash-basiert)

---

## Dateien im Überblick

| Datei | Zweck |
|-------|-------|
| `netlify/build-audio.js` | Script zur lokalen Audio-Generierung |
| `audio/*.mp3` | Generierte Audio-Dateien (in Git) |
| `js/google-tts-player-pregenerated.js` | Audio-Player im Browser |
| `js/audio-player.css` | Styles des Audio-Players |
