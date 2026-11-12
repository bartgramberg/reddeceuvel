/* Red de Ceuvel — gedeelde opbouw: menu, footer, kaarten, teller, delen. */
(function () {
  var C = window.RDC_CONFIG;
  var RDC = (window.RDC = window.RDC || {});
  var pagina = document.body.getAttribute("data-pagina") || "";

  // ---------- helpers ----------
  function fmt(n) { return String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function initialen(naam) { return String(naam || "?").split(/\s+/).filter(Boolean).map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase(); }
  function veiligeUrl(u) { return /^https:\/\//i.test(u || "") ? u : ""; }
  RDC.fmt = fmt; RDC.esc = esc;

  // ---------- header ----------
  var nav = [
    ["index.html", "home", "Home"],
    ["verhaal.html", "verhaal", "Het verhaal"],
    ["ambassadeurs.html", "ambassadeurs", "Ambassadeurs"],
    ["word-ambassadeur.html", "word-ambassadeur", "Word ambassadeur"]
  ];
  var header = document.createElement("header");
  header.className = "kop-balk";
  header.innerHTML =
    '<a class="kop-logo" href="index.html" aria-label="Red de Ceuvel — home"><span class="rdc-grit-licht">Red de<br>Ceuvel</span></a>' +
    '<button class="kop-menu-knop" aria-expanded="false" aria-controls="hoofdmenu"><span></span><span></span><span></span><span class="sr">Menu</span></button>' +
    '<nav id="hoofdmenu" class="kop-nav" aria-label="Hoofdmenu">' +
    nav.map(function (n) { return '<a href="' + n[0] + '"' + (pagina === n[1] ? ' aria-current="page"' : "") + ">" + n[2] + "</a>"; }).join("") +
    '<a class="rdc-btn rdc-btn-oker kop-cta" href="petitie.html">Teken de petitie</a>' +
    "</nav>";
  document.body.insertBefore(header, document.body.firstChild);
  var knop = header.querySelector(".kop-menu-knop");
  knop.addEventListener("click", function () {
    var open = header.classList.toggle("open");
    knop.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // ---------- footer ----------
  var footer = document.createElement("footer");
  footer.className = "voet rdc-korrel";
  footer.innerHTML =
    '<div class="nagelrij" aria-hidden="true"></div>' +
    '<div class="voet-binnen">' +
    '<div><p class="voet-leus rdc-grit">Red de<br>Ceuvel</p><p class="voet-slogan">Een unieke plek slopen of samen de stad maken?</p></div>' +
    '<div class="voet-kolom"><p class="label">Doe mee</p><a href="petitie.html">Teken de petitie</a><a href="word-ambassadeur.html">Word ambassadeur</a><a href="ambassadeurs.html">Alle ambassadeurs</a></div>' +
    '<div class="voet-kolom"><p class="label">Lees</p><a href="verhaal.html">Het verhaal</a><a href="https://deceuvel.nl" rel="noopener">deceuvel.nl</a></div>' +
    '<div class="voet-kolom"><p class="label">De Ceuvel</p><p>Korte Papaverweg 4<br>1032 KB Amsterdam-Noord</p></div>' +
    "</div>" +
    '<p class="voet-klein">Red de Ceuvel is een campagne van de gemeenschap van De Ceuvel. We gebruiken je gegevens alleen voor deze campagne.</p>';
  document.body.appendChild(footer);

  // ---------- demo-melding ----------
  if (RDC.api && RDC.api.demo) {
    var d = document.createElement("div");
    d.className = "demo-melding";
    d.textContent = "Voorbeelddata — nog niet gekoppeld aan de Google Sheet";
    document.body.appendChild(d);
  }

  // ---------- ambassadeurkaart ----------
  var tinten = ["oker", "staal", "korstmos", "mos"];
  RDC.ambKaart = function (a, i, opts) {
    opts = opts || {};
    var tint = tinten[i % tinten.length];
    var foto = veiligeUrl(a.foto);
    var link = veiligeUrl(a.link) || (/^@?[\w.]+$/.test(a.link || "") ? "https://instagram.com/" + String(a.link).replace("@", "") : "");
    return (
      '<article class="amb amb-' + tint + (opts.groot ? " amb-groot" : "") + '">' +
      '<div class="amb-poort">' +
      (foto ? '<img src="' + esc(foto) + '" alt="Portret van ' + esc(a.naam) + '" loading="lazy" referrerpolicy="no-referrer">' : '<span class="amb-init">' + esc(initialen(a.naam)) + "</span>") +
      "</div>" +
      '<div class="amb-tekst">' +
      '<p class="amb-label">Ambassadeur</p>' +
      '<blockquote class="amb-quote">' + esc(a.verhaal) + "</blockquote>" +
      '<p class="amb-naam">' + esc(a.naam) + "</p>" +
      '<p class="amb-wie">' + esc(a.wie) + (link ? ' · <a href="' + esc(link) + '" rel="noopener" target="_blank">volg</a>' : "") + "</p>" +
      "</div></article>"
    );
  };

  // ---------- teller ----------
  RDC.teller = function (el, aantal) {
    var doel = C.PETITIE_DOEL || 5000;
    var pct = Math.max(0, Math.min(100, (aantal / doel) * 100));
    var deadline = "";
    if (C.PETITIE_DEADLINE) {
      var dagen = Math.ceil((new Date(C.PETITIE_DEADLINE) - new Date()) / 864e5);
      if (dagen > 0) deadline = "<span>Nog <b>" + dagen + (dagen === 1 ? " dag" : " dagen") + "</b></span>";
    }
    el.innerHTML =
      '<div class="rdc-counter" role="group" aria-label="handtekeningen: ' + fmt(aantal) + " van " + fmt(doel) + '">' +
      '<div class="rdc-counter-kop"><span class="rdc-counter-getal" data-tel="' + aantal + '">0</span><span class="rdc-counter-doel">van ' + fmt(doel) + " handtekeningen</span></div>" +
      '<div class="rdc-counter-balk" aria-hidden="true"><div class="rdc-counter-vul" style="width:0"></div></div>' +
      '<div class="rdc-counter-voet"><span>' + Math.floor(pct) + "% binnen</span>" + deadline + "</div></div>";
    var getal = el.querySelector(".rdc-counter-getal"), vul = el.querySelector(".rdc-counter-vul");
    requestAnimationFrame(function () { vul.style.width = pct + "%"; });
    var start = performance.now(), duur = 1400;
    (function stap(t) {
      var p = Math.min(1, (t - start) / duur), e = 1 - Math.pow(1 - p, 3);
      getal.textContent = fmt(aantal * e);
      if (p < 1) requestAnimationFrame(stap);
    })(start);
  };

  // ---------- delen ----------
  RDC.deelknoppen = function (el, tekst, url) {
    url = url || C.SITE_URL;
    tekst = tekst || C.DEEL_TEKST;
    var t = encodeURIComponent(tekst), u = encodeURIComponent(url);
    el.innerHTML =
      '<a class="deel deel-wa" target="_blank" rel="noopener" href="https://wa.me/?text=' + t + "%20" + u + '">WhatsApp</a>' +
      '<a class="deel" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + u + '">Facebook</a>' +
      '<a class="deel" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=' + u + '">LinkedIn</a>' +
      '<a class="deel" target="_blank" rel="noopener" href="https://bsky.app/intent/compose?text=' + t + "%20" + u + '">Bluesky</a>' +
      '<button type="button" class="deel deel-kopie">Kopieer link</button>';
    var kopie = el.querySelector(".deel-kopie");
    kopie.addEventListener("click", function () {
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () {
        kopie.textContent = "Gekopieerd";
        setTimeout(function () { kopie.textContent = "Kopieer link"; }, 2000);
      }).catch(function () { prompt("Kopieer deze link:", url); });
    });
    if (navigator.share) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "deel deel-native"; b.textContent = "Delen…";
      b.addEventListener("click", function () { navigator.share({ title: "Red de Ceuvel", text: tekst, url: url }).catch(function () {}); });
      el.insertBefore(b, el.firstChild);
    }
  };

  // ---------- verschijnen bij scrollen ----------
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("zichtbaar"); io.unobserve(e.target); } });
  }, { threshold: 0.12 }) : null;
  RDC.observeer = function (root) {
    (root || document).querySelectorAll(".opkomst:not(.zichtbaar)").forEach(function (el) {
      if (io) io.observe(el); else el.classList.add("zichtbaar");
    });
  };
  RDC.observeer();

  // ---------- teller op elke pagina met [data-teller] ----------
  var tellers = document.querySelectorAll("[data-teller]");
  if (tellers.length && RDC.api) {
    RDC.api.data().then(function (d) { tellers.forEach(function (el) { RDC.teller(el, d.handtekeningen || 0); }); });
  }
})();
