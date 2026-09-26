# LearningStar

Ein Lernspiel im Browser für Kinder von 8 bis 12 Jahren im Pferde-Look – mit
Reitturnieren für Mathe, Deutsch, Englisch, Französisch und Spanisch.

## So funktioniert das Spiel

- **Stall**: Jedes Kind legt ein eigenes Profil mit Tier und Farbe an.
- **Turniere**: Jedes Fach ist ein eigenes Reitturnier mit einem Weg aus
  Missionen. Wer eine Mission besteht, schaltet die nächste frei.

  | Turnier | Fach | Inhalte |
  |---|---|---|
  | Mathe-Springturnier | Mathe | 1×1 von leicht bis gemischt |
  | Deutsch-Dressur | Deutsch | der/die/das, Mehrzahl, Rechtschreibung, Wortarten |
  | Englisch-Geländeritt | Englisch | Pferdestall, Tiere, Farben, Schule |
  | Grand Prix de Paris | Französisch | Pferdestall, Begrüßung, Zahlen, Farben |
  | Spanische Hofreitschule | Spanisch | Pferdestall, Begrüßung, Zahlen, Farben |
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
- **Sounds**: Töne für Buttons, richtige und falsche Antworten, Einkäufe,
  Abzeichen und den Zieleinlauf, direkt im Browser erzeugt (keine
  Audiodateien). Über den Lautsprecher-Knopf stummschaltbar.
- **Abzeichen**: 12 Abzeichen für Meilensteine, z. B. erste Mission,
  fehlerfreier Ritt, 3 bzw. 7 Tage in Folge gespielt oder einen ganzen Weg
  geschafft. Der Fortschritt zu jedem Abzeichen ist sichtbar.
- **Hufeisen-Laden**: Gesammelte Hufeisen lassen sich gegen Kopfschmuck,
  tierische Freunde und Hintergründe für das eigene Tier eintauschen. Manche
  Artikel gibt es erst mit einem bestimmten Abzeichen (z. B. die Krone).
  Einkaufen verringert nur den *Beutel*, nicht die gesammelten Hufeisen in der
  Rangliste. Gekauft wird mit zwei Tipps, damit nichts aus Versehen passiert.
- **Duelle**: Ein Kind fordert ein Geschwisterkind heraus und spielt zuerst.
  Das andere Kind bekommt später – auch auf einem anderen Gerät – genau dieselben
  Aufgaben; wer mehr Hufeisen holt, gewinnt (bei Gleichstand zählen die richtigen
  Antworten). Offene Herausforderungen zeigt ein roter Punkt in der Navigation.
  Duelle bringen normale Hufeisen, schalten aber keine Turnier-Stationen frei.
  Dazu gibt es die Abzeichen „Duell-Gewinner“ und „Duell-Champion“.
- **Eltern-Bereich** (im Stall, mit PIN geschützt):
  - **Eigene Missionen** anlegen, z. B. die Vokabeln für den nächsten Test
    (`the saddle = der Sattel`), eigene Fragen (`Hauptstadt von Frankreich = Paris | Lyon | Nizza`)
    oder bestimmte 1×1-Reihen. Sie erscheinen sofort mit Stern im gewählten Turnier
    und sind immer freigeschaltet.
  - **Fortschritt** jedes Kindes: Hufeisen, Abzeichen, Tagesserie, Stand je
    Turnier und die Aufgaben, die noch schwerfallen.
  - **Spieler löschen** (mit Sicherheitsabfrage): entfernt ein Kind samt
    Hufeisen, Abzeichen, Einkäufen und Duellen – mit Familie auf allen Geräten.
    Der Server prüft dafür die Eltern-PIN.
  - Mit Familie gelten PIN und Missionen auf allen Geräten. Die PIN wird nur als
    Hash gespeichert und nie an die App zurückgegeben.
- **Familien-Rangliste**: Wer hat diese Woche die meisten Hufeisen gesammelt?
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
2. Die Werte für den Familien-Server stehen in [`.env.production`](.env.production)
   (Projekt-URL und *publishable* Key, beide öffentlich gedacht). Ohne diese Datei
   läuft die Online-Version im Ein-Geräte-Modus. Der Workflow prüft bei jedem
   Lauf, ob der Server erreichbar und das Schema eingerichtet ist.
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
4. Die beiden Werte in `.env.production` eintragen (für die Online-Version)
   bzw. `.env.example` nach `.env.local` kopieren (für `npm run dev`).
5. In der App im Stall auf **„Auf mehreren Geräten spielen“** tippen und eine
   Familie gründen. Spieler, die schon auf dem Gerät sind, können mitgenommen
   werden, ihre Hufeisen bleiben erhalten.
6. Auf jedem weiteren Gerät dort **„Familie beitreten“** wählen und den
   angezeigten Familien-Code (z. B. `K7PM-3XQA`) eingeben.

**Nach Updates:** Wenn sich `supabase/schema.sql` ändert (z. B. für den
Hufeisen-Laden), den Inhalt einfach erneut im SQL Editor ausführen. Das Skript
lässt vorhandene Daten unverändert.

**Wie das abgesichert ist:** Die Kinder brauchen kein Login. Der Familien-Code
funktioniert wie ein Schlüssel: Nur wer ihn kennt, sieht die Spieler der Familie
und kann Punkte eintragen. Die Tabellen selbst sind für die App gesperrt, alle
Zugriffe laufen über Datenbankfunktionen, die den Code prüfen und
unplausible Punktzahlen ablehnen. Im Laden kann nicht mehr ausgegeben werden,
als gesammelt wurde. Gespeichert werden nur Vorname, Tier, Farbe
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
Vokabellisten in [`src/data/vocabulary.json`](src/data/vocabulary.json) und
Fragen (z. B. für Deutsch) in [`src/data/quiz.json`](src/data/quiz.json).

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
| `track` | Turnier: `math`, `german`, `english`, `french` oder `spanish` |
| `type` | `multiplication`, `vocabulary` oder `quiz` |
| `requires` | Mission, die vorher bestanden sein muss (optional) |
| `passRatio` | Anteil der Hufeisen zum Bestehen (Standard 0.6) |
| `config.mode` | `choice` (auswählen) oder `input` (tippen) |
| `config.list` / `config.direction` | Vokabeln: Listenname und `to-de` (Fremdsprache → Deutsch) oder `from-de` |
| `config.bank` | Quiz: Name des Fragenpools in `quiz.json` |

Jede Vokabelliste hat eine Sprache (`en`, `fr` oder `es`) und Wörter der Form
`{ "word": "le cheval", "de": "das Pferd" }`. Beim Tippen werden
Groß- und Kleinschreibung, Artikel („das Pferd“ oder „Pferd“, „l'écurie“ oder
„écurie“), fehlende Akzente (é, ñ …), Satzzeichen sowie ae/oe/ue statt ä/ö/ü
toleriert. Weitere richtige Antworten lassen sich über `deAlt` bzw. `wordAlt`
angeben.

Eine Quiz-Frage hat die Form `{ "prompt": "Hund", "answer": "der", "options":
["der", "die", "das"] }`. Ohne `options` werden falsche Antworten aus den
anderen Fragen des Pools gewählt.

## Aufbau

```
src/
  data/        Missionen und Vokabellisten (JSON)
  game/        Spiellogik ohne UI: Aufgaben, Punkte, Fortschritt, Abzeichen & Laden
               (rewards.ts), Speicherung
  components/  Bildschirme: Stall, Hof, Parcours, Ergebnis, Laden, Abzeichen,
               Rangliste, Familie
    icon-art/  Eigene gezeichnete Symbole (SVG) statt Emojis
supabase/      Datenbankschema für den Familien-Server
dev/           Lokaler Test-Server und Tests des Schemas
```

Alle Bilder sind selbst gezeichnet: Pferde in `Horse.tsx`, alle übrigen Symbole
(Turniere, Abzeichen, Laden-Artikel, Rechtschreib-Bilder, Navigation) in
`components/icon-art/` und werden über `<GameIcon name="…" />` angezeigt. So sieht
das Spiel auf jedem Gerät gleich aus. In Quizfragen zeigt der Prompt
`img:<name>` ein Bild statt Text an (z. B. `img:bike`).

Die Speicherung läuft über die Schnittstelle `PlayerStore`
(`src/game/storage.ts`). `LocalPlayerStore` speichert im `localStorage` des
Browsers, `FamilyPlayerStore` über den Familien-Server.
