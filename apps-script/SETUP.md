# Backend koppelen: Google Sheet + Drive + mail

De website is statisch (GitHub Pages). Alle inzendingen gaan naar een Google Sheet
via een klein Google Apps Script. Kosten: nul. Tijd: ± 10 minuten.

## 1. Sheet aanmaken
1. Ga naar [sheets.new](https://sheets.new) (met het Google-account van de campagne).
2. Noem hem bijvoorbeeld **Red de Ceuvel — inzendingen**.

## 2. Script plakken
1. In de sheet: **Extensies → Apps Script**.
2. Verwijder de voorbeeldcode en plak de volledige inhoud van [`Code.gs`](Code.gs).
3. Vul bovenin bij `NOTIFY_EMAIL` het adres in dat een mail moet krijgen bij elke nieuwe ambassadeur
   (meerdere adressen: komma-gescheiden).
4. Opslaan (⌘S).

## 3. Eenmalig inrichten
1. Kies bovenin de functie **`setup`** en klik **▶ Uitvoeren**.
2. Geef toestemming (Sheets, Drive, Mail). Bij "Google heeft deze app niet geverifieerd":
   *Geavanceerd → Ga naar … (onveilig)*. Dat is normaal voor je eigen script.
3. In de sheet staan nu twee tabbladen, **Petitie** en **Ambassadeurs**, met vinkjes-kolommen.
   In je Drive staat een map voor de ambassadeursfoto's.

## 4. Publiceren als web-app
1. **Implementeren → Nieuwe implementatie** → type **Web-app**.
2. *Uitvoeren als*: **Ik** · *Wie heeft toegang*: **Iedereen**.
3. Klik **Implementeren** en kopieer de **Web-app-URL** (eindigt op `/exec`).

## 5. URL in de website zetten
Open `assets/js/config.js` en plak de URL bij `API_URL`:

```js
API_URL: "https://script.google.com/macros/s/XXXX/exec",
```

Commit en push. Klaar: de website toont nu echte data in plaats van voorbeelddata.

## Dagelijks gebruik
- **Ambassadeur goedkeuren**: zet het vinkje in de kolom **Goedgekeurd**. Binnen een minuut staat hij/zij op de site.
- **Uitgelicht**: aangevinkte ambassadeurs komen vooraan in de carrousel op de homepage.
- **Petitie**: de teller telt alle handtekeningen. In de lijst "Zij tekenden al" verschijnen alleen
  mensen die *Naam tonen* aanvinkten én die jij op **Goedgekeurd** zet (alleen voornaam + initiaal en woonplaats).
- Wil je iets aanpassen of weghalen? Wijzig de cel of haal het vinkje weg.

## Script aangepast?
Na elke wijziging in `Code.gs`: **Implementeren → Implementaties beheren → ✏️ → Versie: Nieuwe versie → Implementeren**.
De URL blijft dan hetzelfde.
