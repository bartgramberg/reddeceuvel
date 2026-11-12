# Red de Ceuvel — reddeceuvel.nl

Actiewebsite voor het behoud van De Ceuvel in Amsterdam-Noord.
Statische site (HTML/CSS/JS, geen build-stap), gehost op GitHub Pages, met een Google Sheet als backend.

## Pagina's
| Bestand | Pagina |
|---|---|
| `index.html` | Landing: hero met beeldmerk en banner, pitch, petitie-CTA, ambassadeur-CTA, carrousel |
| `petitie.html` | Petitie tekenen: oproep, teller, formulier, "Zij tekenden al", deelknoppen |
| `word-ambassadeur.html` | Wervende pagina "Word ambassadeur" |
| `aanmelden.html` | Aanmeldformulier ambassadeur, met foto-upload en live voorbeeld van je kaart |
| `ambassadeurs.html` | Alle goedgekeurde ambassadeurs |
| `verhaal.html` | Het verhaal in detail (drie pijlers) |

## Lokaal draaien
```bash
python3 -m http.server 8080
```
Open http://localhost:8080. Zonder `API_URL` in `assets/js/config.js` draait de site op voorbeelddata.

## Backend (Google Sheet + Drive + mail)
Zie [`apps-script/SETUP.md`](apps-script/SETUP.md). Kort:
- Petitie en ambassadeurs komen in een Google Sheet; foto's in een Drive-map.
- Bij elke nieuwe ambassadeur gaat er een mail uit.
- Alleen rijen met een vinkje bij **Goedgekeurd** verschijnen op de site.

## Instellingen
`assets/js/config.js`: API-URL, petitiedoel, deadline, aantal gezochte ambassadeurs, deeltekst.

## Domein
`CNAME` staat op `reddeceuvel.nl`. Zet bij je domeinregistrar:
- `A`-records voor `reddeceuvel.nl` naar `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `CNAME`-record `www` naar `bartgramberg.github.io`

## Huisstijl
Gebaseerd op het design system "Red de Ceuvel" (thema Staal + Papier, League Spartan / Big Shoulders Stencil / Archivo).
