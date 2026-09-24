# LEG & DRUK

Et dansk party-game command center bygget til tablet, mobil og desktop. Inspireret af Command Center-retningen i LEG&DRUK-designbeskrivelsen: sort krom, neon, store spilleflader og ét sammenhængende spilforløb.

## Start lokalt

Kræver Node.js 20.11 eller nyere. Ingen pakker skal installeres.

```sh
node scripts/serve.mjs
```

Åbn http://127.0.0.1:4173. Porten kan ændres med miljøvariablen `PORT`.

```sh
node --test tests/engine.test.mjs
node scripts/build.mjs
node scripts/serve.mjs dist
```

## Det kan appen

- Seks spilmotorer: Lucky Spin med sekventielt hjulstop, to terninger, roulette, kort, 12 Mystery Boxes og Random, som vælger næste motor.
- Fire spilpakker med 67 originale danske kort: Party Starter, Kontrolleret kaos, Bare os to og Bordets klassikere.
- 2–16 spillere, individuelle ture, 3/5/10/20 runder, fem intensitetsniveauer, pause og spring over.
- Smart Random udtømmer den relevante pulje før gentagelser og balancerer kategorier pr. spiller, når motoren ikke vælger en kategori.
- Action Board med drag-and-drop, tastaturvenlige flytteknapper, spillerfordeling, filtre, kortvisning og gennemført-status.
- Studio med egne kort, timer og valg af næste spilmotor. Kort med et næste trin gemmes på boardet, og samme spiller fortsætter. Kæder er begrænset til otte trin.
- Game Master med kategori, bonus, wildcard, Chaos Mode, ekstra kort, spillerskip og afslutning.
- Fire temaer, valgfri lyd, reduceret bevægelse og automatisk tema pr. pakke.
- Resultatoversigt og finale, der afvikler boardkort ét ad gangen.
- Automatisk lagring på enheden samt JSON-eksport og valideret import.
- Alkoholfri som standard. Voksne kan aktivere en valgfri skål; ingen mængder eller drikkepres.
- Web-app-manifest og offline-cache efter første onlinebesøg på et HTTPS-hostet site. Skrifttyper har lokale systemfallbacks.

## Udgivelse

`node scripts/build.mjs` laver `dist/`. Upload mappens indhold til en statisk webhost. Relative stier gør appen kompatibel med GitHub Pages i en undermappe som `/Leg-Druk/`. Ingen database, API-nøgler eller serverfunktioner er nødvendige.

GitHub Actions kører tests og build på push/PR og tilbyder den færdige webapp som artefakt. Workflowet ændrer ikke hostingindstillinger og publicerer ikke automatisk.

## Data og afgrænsning

Dette er en fælles skærm-app. Data bliver i browserens localStorage; der er ingen login, cloudsynkronisering eller multiplayer på tværs af enheder. Eksportér aftenen for at flytte den. Browserrydning fjerner den lokale lagring. Ingen virkelige penge, køb eller væddemål. Parpakken indeholder samtaler og frivillige fælles udfordringer, ikke eksplicit indhold.

Designmaterialets fem koncepter er fortolket til én samlet app. Studio bygger indhold og enkle spilforløb med motorovergange; det er ikke en generel grafisk programmeringseditor.

## Struktur

- `src/data.js` – spilpakker, kort, kategorier og motorer.
- `src/engine.js` – spiltilstand, kortpulje, ture, lagring og importvalidering.
- `src/app.js` – brugerflade, animationer, timer og interaktioner.
- `src/styles.css` – temaer og responsive layouts.
- `tests/engine.test.mjs` – tests af centrale spilregler og datahåndtering.
- `sw.js` – offline-cache for appens kernefiler.

Alle kort og al kode er lavet til dette projekt. Google Fonts: DM Sans og Barlow Condensed (SIL Open Font License), med systemskrifter som fallback.

