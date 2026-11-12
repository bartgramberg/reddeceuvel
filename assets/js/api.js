/* Red de Ceuvel — praat met het Google Apps Script (of met voorbeelddata als er geen API_URL is). */
(function () {
  var C = window.RDC_CONFIG;
  var DEMO = !C.API_URL;

  var VOORBEELD = {
    ok: true,
    demo: true,
    handtekeningen: 2418,
    ondertekenaars: [
      { naam: "Fatima B.", woonplaats: "Amsterdam-Noord", rol: "Buurtbewoner", bericht: "Hier leerde mijn dochter wat compost is." },
      { naam: "Joris v.", woonplaats: "Amsterdam", rol: "Bezoeker", bericht: "" },
      { naam: "Lotte K.", woonplaats: "Utrecht", rol: "Van verder weg", bericht: "Dit is waarom ik naar Amsterdam kom." },
      { naam: "Mehmet Y.", woonplaats: "Amsterdam-Noord", rol: "Buurtbewoner", bericht: "Niet weer een plek kwijt." },
      { naam: "Sanne d.", woonplaats: "Zaandam", rol: "Ondernemer op de Ceuvel", bericht: "" },
      { naam: "Pieter R.", woonplaats: "Amsterdam", rol: "Amsterdammer", bericht: "Samen de stad maken. Dan ook echt." }
    ],
    ambassadeurs: [
      { naam: "Noor Hendriks", wie: "Buurvrouw en tuinier", verhaal: "Elke zaterdag sta ik met mijn handen in de grond die hier ooit vervuild was. Nu groeit er munt, en groeien wij mee. Dit is de achtertuin van heel Noord.", foto: "", uitgelicht: true },
      { naam: "Daan Okafor", wie: "Muzikant, speelt hier sinds 2014", verhaal: "Mijn eerste optreden was op de steiger, voor twaalf mensen en een reiger. De Ceuvel geeft ruimte aan dingen die nog niet af zijn. Dat is zeldzaam in deze stad.", foto: "" },
      { naam: "Ilse de Wit", wie: "Architect", verhaal: "Studenten uit de hele wereld komen hier kijken hoe je een stad bouwt zonder alles eerst plat te gooien. Slopen is het tegenovergestelde van wat we hier bewijzen.", foto: "" },
      { naam: "Youssef Amrani", wie: "Ondernemer in een woonboot-kantoor", verhaal: "Ik huur een opgeknapte woonboot op het droge. Mijn bedrijf is hier gegroeid, tussen mensen die elkaar helpen in plaats van beconcurreren.", foto: "" },
      { naam: "Marieke Vos", wie: "Juf in Noord", verhaal: "Met mijn klas komen we kijken naar de planten die de bodem schoonmaken. Kinderen snappen meteen wat de toekomst kan zijn. Laat ze dat houden.", foto: "" },
      { naam: "Tom Bakker", wie: "Vrijwilliger in de tuin", verhaal: "Ik kwam hier voor een koffie en bleef voor de mensen. De Ceuvel is geen plek, het is een werkwoord.", foto: "" }
    ]
  };

  var cache = null;

  function data() {
    if (cache) return cache;
    if (DEMO) {
      cache = Promise.resolve(VOORBEELD);
    } else {
      cache = fetch(C.API_URL + "?action=data", { method: "GET" })
        .then(function (r) { return r.json(); })
        .catch(function (e) { console.warn("RDC: data niet geladen", e); return { ok: false, handtekeningen: 0, ondertekenaars: [], ambassadeurs: [] }; });
    }
    return cache;
  }

  function verstuur(payload) {
    if (DEMO) {
      console.info("RDC demo — zou versturen:", payload);
      return new Promise(function (res) { setTimeout(function () { res({ ok: true, demo: true }); }, 900); });
    }
    // text/plain voorkomt een CORS-preflight; Apps Script leest de body gewoon als JSON.
    return fetch(C.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  window.RDC = window.RDC || {};
  window.RDC.api = { data: data, verstuur: verstuur, demo: DEMO };
})();
