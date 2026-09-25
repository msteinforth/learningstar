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

## Entwicklung

```bash
npm install
npm run dev     # Entwicklungsserver
npm test        # Tests der Spiellogik
npm run lint
npm run build   # Produktions-Build nach dist/
```

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
  components/  Bildschirme: Stall, Hof, Parcours, Ergebnis
```

Die Spielstände liegen im `localStorage` des Browsers. Die Speicherung läuft
über die Schnittstelle `PlayerStore` (`src/game/storage.ts`), damit sie später
gegen einen Server getauscht werden kann, zum Beispiel für eine gemeinsame
Familien-Rangliste über mehrere Geräte.
