/* Red de Ceuvel — menu, footer, kaarten, petitielinks. */
(function () {
  var C = window.RDC_CONFIG;
  var RDC = (window.RDC = window.RDC || {});
  var pagina = document.body.getAttribute("data-pagina") || "";

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function initialen(n) { return String(n || "?").split(/\s+/).filter(function (w) { return /^\p{L}/u.test(w); }).map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase(); }
  function https(u) { return /^https:\/\//i.test(u || "") ? u : ""; }
  RDC.esc = esc;

  // ---------- header ----------
  var header = document.createElement("header");
  header.className = "kop-balk";
  header.innerHTML =
    '<a class="kop-logo" href="index.html" aria-label="Red de Ceuvel"><img src="assets/img/logo-ceuvel.svg" alt="De Ceuvel"></a>' +
    '<button class="kop-menu-knop" aria-expanded="false" aria-controls="hoofdmenu"><span></span><span></span><span></span><span class="sr">Menu</span></button>' +
    '<nav id="hoofdmenu" class="kop-nav" aria-label="Hoofdmenu">' +
    '<a href="index.html"' + (pagina === "home" ? ' aria-current="page"' : "") + ">Red de Ceuvel</a>" +
    '<a href="ambassadeurs.html"' + (pagina === "ambassadeurs" ? ' aria-current="page"' : "") + ">Ambassadeurs</a>" +
    '<a class="knop knop-rood" data-petitie href="petitie.html">Teken de petitie</a>' +
    "</nav>";
  document.body.insertBefore(header, document.body.firstChild);
  var menuKnop = header.querySelector(".kop-menu-knop");
  menuKnop.addEventListener("click", function () {
    var open = header.classList.toggle("open");
    menuKnop.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // ---------- footer ----------
  var footer = document.createElement("footer");
  footer.className = "voet";
  footer.innerHTML =
    '<div class="binnen">' +
    '<img src="assets/img/logo-ceuvel.svg" alt="De Ceuvel">' +
    '<nav aria-label="Footer"><a data-petitie href="petitie.html">Teken de petitie</a><a href="ambassadeurs.html">Ambassadeurs</a><a href="https://deceuvel.nl" rel="noopener">deceuvel.nl</a></nav>' +
    "<p>De Ceuvel · Korte Papaverweg 4 · Amsterdam-Noord</p>" +
    "</div>";
  document.body.appendChild(footer);

  // De tekenknop op petitie.html gaat naar petities.nl.
  document.querySelectorAll("[data-extern]").forEach(function (a) {
    if (C.PETITIE_URL) { a.href = C.PETITIE_URL; a.target = "_blank"; a.rel = "noopener"; }
    else { a.setAttribute("aria-disabled", "true"); a.textContent = "Petitie opent binnenkort"; a.removeAttribute("href"); }
  });

  if (RDC.api && RDC.api.demo) {
    var d = document.createElement("div");
    d.className = "demo-melding";
    d.textContent = "Voorbeelddata";
    document.body.appendChild(d);
  }

  // ---------- ambassadeurkaart ----------
  var tinten = ["creme", "rood", "blauw", "oker", "groen"];
  RDC.ambKaart = function (a, i) {
    var foto = https(a.foto) || (/^data:image\//.test(a.foto || "") ? a.foto : "");
    var link = https(a.link) || (/^@?[\w.]+$/.test(a.link || "") ? "https://instagram.com/" + String(a.link).replace("@", "") : "");
    return (
      '<article class="amb amb-' + tinten[i % tinten.length] + '">' +
      (foto ? '<img class="amb-foto" src="' + esc(foto) + '" alt="' + esc(a.naam) + '" loading="lazy" referrerpolicy="no-referrer">'
            : '<div class="amb-init" aria-hidden="true">' + esc(initialen(a.naam)) + "</div>") +
      '<p class="amb-quote">“' + esc(a.verhaal) + '”</p>' +
      '<p class="amb-naam">' + esc(a.naam) + "</p>" +
      '<p class="amb-wie">' + esc(a.wie) + (link ? ' · <a href="' + esc(link) + '" rel="noopener" target="_blank">volg</a>' : "") + "</p>" +
      "</article>"
    );
  };

  // ---------- delen ----------
  RDC.deelknoppen = function (el, tekst, url) {
    var t = encodeURIComponent(tekst), u = encodeURIComponent(url);
    el.innerHTML =
      '<a class="deel" target="_blank" rel="noopener" href="https://wa.me/?text=' + t + "%20" + u + '">WhatsApp</a>' +
      '<a class="deel" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + u + '">Facebook</a>' +
      '<a class="deel" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=' + u + '">LinkedIn</a>' +
      '<button type="button" class="deel">Kopieer link</button>';
    var k = el.querySelector("button");
    k.addEventListener("click", function () {
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () {
        k.textContent = "Gekopieerd";
      }).catch(function () { prompt("Kopieer deze link:", url); });
    });
  };

  // ---------- opkomen bij scrollen ----------
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("zichtbaar"); io.unobserve(e.target); } });
  }, { threshold: 0.1 }) : null;
  RDC.observeer = function (root) {
    (root || document).querySelectorAll(".opkomst:not(.zichtbaar)").forEach(function (el) { io ? io.observe(el) : el.classList.add("zichtbaar"); });
  };
  RDC.observeer();
})();
