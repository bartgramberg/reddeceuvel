/* Red de Ceuvel — ambassadeurs ophalen en aanmelden via het Google Apps Script
   (of voorbeelddata zolang er geen API_URL is). */
(function () {
  var C = window.RDC_CONFIG;
  var DEMO = !C.API_URL;

  var VOORBEELD = [
    ["Noor Hendriks", "Buurvrouw en tuinier", "Elke zaterdag sta ik met mijn handen in de grond die hier ooit vervuild was. Nu groeit er munt, en groeien wij mee."],
    ["De reiger", "Vaste bewoner van de steiger", "Ik was hier eerder dan jullie. Er is vis, er is riet, er is rust. Laat het zo."],
    ["Daan Okafor", "Muzikant", "Mijn eerste optreden was op de steiger, voor twaalf mensen en een reiger."],
    ["Ilse de Wit", "Architect", "Hier zie je hoe je een stad bouwt zonder alles eerst plat te gooien."],
    ["Youssef Amrani", "Ondernemer", "Mijn bedrijf is hier gegroeid, tussen mensen die elkaar helpen."],
    ["Fien (9)", "Komt hier met haar opa", "Je kan hier op een boot zitten die op het land staat. Dat kan nergens anders."],
    ["Marieke Vos", "Juf in Noord", "Met mijn klas kijken we hoe planten de bodem schoonmaken. Kinderen snappen het meteen."],
    ["Tom Bakker", "Vrijwilliger in de tuin", "Ik kwam voor een koffie en bleef voor de mensen."],
    ["Sanne de Graaf", "Buurtbewoner", "Mijn rustpunt na het werk. Water, groen en altijd een bekend gezicht."],
    ["Pieter Rooij", "Bezoeker uit Utrecht", "Elke keer dat ik vrienden in Amsterdam rondleid, eindigen we hier."],
    ["Lotte Kramer", "Maker", "In mijn werkplaats op het water maak ik dingen die nergens anders zouden ontstaan."],
    ["Mehmet Yilmaz", "Buurman", "Er verdwijnt al zoveel uit de stad. Niet deze plek."]
  ].map(function (r, i) { return { naam: r[0], wie: r[1], verhaal: r[2], foto: "", uitgelicht: i < 2 }; });

  var cache = null;
  function ambassadeurs() {
    if (cache) return cache;
    cache = DEMO
      ? Promise.resolve({ ok: true, demo: true, ambassadeurs: VOORBEELD })
      : fetch(C.API_URL + "?action=data").then(function (r) { return r.json(); })
          .catch(function (e) { console.warn("RDC: data niet geladen", e); return { ok: false, ambassadeurs: [] }; });
    return cache;
  }

  function aanmelden(payload) {
    if (DEMO) {
      console.info("RDC demo — zou versturen:", payload);
      return new Promise(function (res) { setTimeout(function () { res({ ok: true, demo: true }); }, 800); });
    }
    // text/plain voorkomt een CORS-preflight; Apps Script leest de body als JSON.
    return fetch(C.API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); });
  }

  window.RDC = window.RDC || {};
  window.RDC.api = { ambassadeurs: ambassadeurs, aanmelden: aanmelden, demo: DEMO };
})();
