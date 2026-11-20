# Red de Ceuvel — reddeceuvel.nl

Actiewebsite voor het behoud van De Ceuvel in Amsterdam-Noord.
Statische site (HTML/CSS/JS, geen build-stap) op GitHub Pages.

| Bestand | Pagina |
|---|---|
| `index.html` | Red de Ceuvel: hero, kort verhaal, petitieblok, ambassadeurs |
| `petitie.html` | Petitietekst + knop naar petities.nl |
| `ambassadeurs.html` | "Word ambassadeur"-blok + alle ambassadeurs |
| `aanmelden.html` | Aanmeldformulier ambassadeur (niet in het menu) |

- **Petitie:** loopt via petities.nl. Zie [`PETITIE.md`](PETITIE.md) voor advies, tekst en stappen.
- **Ambassadeurs:** Google Sheet + Drive + mail via Apps Script. Zie [`apps-script/SETUP.md`](apps-script/SETUP.md).
  Alleen rijen met een vinkje bij **Goedgekeurd** komen op de site.
- **Instellingen:** `assets/js/config.js` (`PETITIE_URL`, `API_URL`).

## Lokaal draaien
```bash
python3 -m http.server 8080
```

## Domein
`CNAME` = `reddeceuvel.nl`. DNS: A-records naar `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
`185.199.111.153`; `www` als CNAME naar `bartgramberg.github.io`.
