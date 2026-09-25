# 🐴 LearningStar

Ein Lernspiel im Browser für Kinder von 8 bis 12 Jahren – mit 1×1-Aufgaben und
Englisch-Vokabeln im Pferde-Look.

## So funktioniert das Spiel

- **Stall**: Jedes Kind legt ein eigenes Profil mit Tier und Farbe an.
- **Hof**: Die Missionen liegen auf zwei Wegen, dem *Rechen-Parcours* (1×1)
  und dem *Englisch-Ausritt* (Vokabeln). Wer eine Mission besteht, schaltet
  die nächste frei.
- **Hufeisen (1–3 pro Aufgabe)**:
  - Grundpunkte nach Schwierigkeit: beim 1×1 bringen 2, 5 und 10 einen Punkt,
    3 und 4 zwei, 6 bis 9 drei. Bei Vokabeln bringt Auswählen einen Punkt,
    selbst Tippen zwei.
  - +1 Tempo-Bonus bei einer Antwort unter 6 Sekunden (maximal 3).
  - Ein richtiger zweiter Versuch bringt 1 Punkt, sonst wird die Lösung angezeigt.
- **Schleifen**: Für eine Mission gibt es 1 bis 3 Turnierschleifen (Bronze,
  Silber, Gold), gemessen an den erreichbaren Hufeisen. Ab 60 % gilt eine
  Mission als bestanden, bei einzelnen Missionen gilt eine höhere Grenze.
- **Wiederholung**: Falsch beantwortete Aufgaben kommen später häufiger dran.
- **Familien-Rangliste** 🏆: Wer hat diese Woche die meisten Hufeisen gesammelt?
  Die Wochenwertung beginnt jeden Montag neu, daneben gibt es eine Gesamtwertung.
  Mit einer *Familie* spielen die Kinder auf verschiedenen Geräten und sehen
  eine gemeinsame Rangliste (siehe unten).

## Entwicklung

```bash
npm install
npm run dev     # Entwicklungsserver
npm test        # Tests der Spiellogik
npm run lint
npm run build   # Produktions-Build nach dist/
```

## Online stellen (GitHub Pages)

Der Workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
prüft die App bei jedem Push auf `main` (bzw. den aktuellen Standard-Branch)
mit Lint und Tests, baut sie und veröffentlicht sie unter
`https://<benutzername>.github.io/learningstar/`.

Einmalig einzurichten:

1. **Settings → Pages → Build and deployment → Source: „GitHub Actions“** wählen.
   Für ein *privates* Repository ist GitHub Pages nur mit einem kostenpflichtigen
   GitHub-Plan (z. B. Pro) verfügbar; alternativ das Repository öffentlich machen.
2. Optional für die Familien-Rangliste: unter **Settings → Secrets and variables →
   Actions** die Secrets `VITE_SUPABASE_URL` und `VITE_SUPABASE_KEY` anlegen
   (Werte wie in `.env.local`). Ohne sie läuft die Online-Version im Ein-Geräte-Modus.
3. Unter **Actions → Deploy to GitHub Pages → Run workflow** den ersten Lauf
   starten (oder einfach etwas pushen).

Die Seite ist öffentlich erreichbar. Die Spielstände sind trotzdem geschützt:
Ohne Familien-Code sieht niemand eure Spieler. Auf Tablet oder Handy lässt sich
die Seite über „Zum Home-Bildschirm hinzufügen“ wie eine App starten.

## Familien-Rangliste über mehrere Geräte

Ohne weitere Einrichtung speichert jedes Gerät seine Spieler nur für sich. Für
eine gemeinsame Rangliste braucht die Familie einen kleinen Server. Dafür wird
[Supabase](https://supabase.com) genutzt, der kostenlose Tarif reicht aus.

1. Bei Supabase ein Konto und ein neues Projekt anlegen. Als Region eine in
   der EU wählen, z. B. Frankfurt.
2. Im Projekt den **SQL Editor** öffnen, den Inhalt von
   [`supabase/schema.sql`](supabase/schema.sql) einfügen und ausführen.
3. Unter **Project Settings → API Keys** die Projekt-URL und den
   *publishable* (bzw. *anon*) Key kopieren. **Nicht** den geheimen
   *secret*/*service_role* Key verwenden.
4. `.env.example` nach `.env.local` kopieren und die beiden Werte eintragen,
   dann die App neu starten oder neu bauen.
5. In der App im Stall auf **„Auf mehreren Geräten spielen“** tippen und eine
   Familie gründen. Spieler, die schon auf dem Gerät sind, können mitgenommen
   werden, ihre Hufeisen bleiben erhalten.
6. Auf jedem weiteren Gerät dort **„Familie beitreten“** wählen und den
   angezeigten Familien-Code (z. B. `K7PM-3XQA`) eingeben.

**Wie das abgesichert ist:** Die Kinder brauchen kein Login. Der Familien-Code
funktioniert wie ein Schlüssel: Nur wer ihn kennt, sieht die Spieler der Familie
und kann Punkte eintragen. Die Tabellen selbst sind für die App gesperrt, alle
Zugriffe laufen über Datenbankfunktionen, die den Code prüfen und
unplausible Punktzahlen ablehnen. Gespeichert werden nur Vorname, Tier, Farbe
und Spielstand.

Punkte werden auf dem Server addiert. Spielt ein Kind auf zwei Geräten, geht
also nichts verloren. Ist das Internet weg, zeigt das Ergebnis-Bild
„Nochmal speichern“ an.

### Lokal ausprobieren ohne Supabase-Konto

`dev/backend.ts` startet einen Test-Server mit einer eingebetteten Postgres-
Datenbank ([PGlite](https://pglite.dev)) und demselben Schema. Die Daten gehen
beim Beenden verloren.

```bash
npm run dev:backend
# in einem zweiten Terminal:
VITE_SUPABASE_URL=http://localhost:54321 VITE_SUPABASE_KEY=dev npm run dev
```

Zwei Geräte lassen sich simulieren, indem man die App in einem normalen und
einem privaten Browserfenster öffnet.

## Eigene Missionen anlegen

Missionen stehen in [`src/data/missions.json`](src/data/missions.json),
Vokabellisten in [`src/data/vocabulary.json`](src/data/vocabulary.json).

```json
{
  "id": "1x1-reihe-7",
  "track": "math",
  "type": "multiplication",
  "title": "Die 7er-Reihe",
  "subtitle": "Nur die 7",
  "requires": "1x1-reihe-3-4",
  "passRatio": 0.7,
  "config": { "factors": [7], "count": 10, "mode": "input" }
}
```

| Feld | Bedeutung |
|---|---|
| `track` | `math` oder `english`, legt den Weg auf der Karte fest |
| `type` | `multiplication` oder `vocabulary` |
| `requires` | Mission, die vorher bestanden sein muss (optional) |
| `passRatio` | Anteil der Hufeisen zum Bestehen (Standard 0.6) |
| `config.mode` | `choice` (auswählen) oder `input` (tippen) |
| `config.list` / `config.direction` | Nur für Vokabeln: Listenname und `en-de` oder `de-en` |

Bei Vokabeln werden Groß- und Kleinschreibung, Artikel („das Pferd“ oder
„Pferd“), „to“ bei Verben sowie ae/oe/ue statt ä/ö/ü toleriert. Weitere
richtige Antworten lassen sich über `deAlt` bzw. `enAlt` angeben.

## Aufbau

```
src/
  data/        Missionen und Vokabellisten (JSON)
  game/        Spiellogik ohne UI: Aufgaben, Punkte, Fortschritt, Speicherung
  components/  Bildschirme: Stall, Hof, Parcours, Ergebnis, Rangliste, Familie
supabase/      Datenbankschema für den Familien-Server
dev/           Lokaler Test-Server und Tests des Schemas
```

Die Speicherung läuft über die Schnittstelle `PlayerStore`
(`src/game/storage.ts`). `LocalPlayerStore` speichert im `localStorage` des
Browsers, `FamilyPlayerStore` über den Familien-Server.
