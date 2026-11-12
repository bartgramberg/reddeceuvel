/**
 * Red de Ceuvel — backend (Google Apps Script)
 *
 * Slaat petitie-handtekeningen en ambassadeur-aanmeldingen op in een Google Sheet,
 * bewaart ambassadeursfoto's in een Google Drive-map, mailt bij elke nieuwe
 * ambassadeur, en levert de goedgekeurde inzendingen als JSON aan de website.
 *
 * Installatie: zie apps-script/SETUP.md
 */

// ====== INSTELLINGEN ======================================================
var CONFIG = {
  // E-mailadres(sen) dat een mail krijgt bij elke nieuwe ambassadeur (komma-gescheiden).
  NOTIFY_EMAIL: 'VUL-HIER-JE-EMAIL-IN@voorbeeld.nl',
  // Naam van de Drive-map voor ambassadeursfoto's (wordt automatisch aangemaakt).
  PHOTO_FOLDER_NAME: 'Red de Ceuvel — ambassadeursfoto\'s',
  // Hoe lang (seconden) de publieke data gecachet wordt.
  CACHE_SECONDS: 60,
  // Maximale fotogrootte (bytes, na verkleinen in de browser).
  MAX_PHOTO_BYTES: 4 * 1024 * 1024
};

var SHEET_PETITIE = 'Petitie';
var SHEET_AMBASSADEURS = 'Ambassadeurs';

var PETITIE_KOLOMMEN = [
  'Tijdstip', 'Voornaam', 'Achternaam', 'E-mail', 'Woonplaats', 'Ik ben',
  'Waarom ik teken', 'Naam tonen', 'Nieuwsbrief', 'Goedgekeurd'
];
var AMBASSADEUR_KOLOMMEN = [
  'Tijdstip', 'Voornaam', 'Achternaam', 'Wie ben je', 'Wat betekent de Ceuvel voor jou',
  'E-mail', 'Foto', 'Instagram / website', 'Telefoon',
  'Toestemming website', 'Toestemming social & campagne', 'Updates', 'Goedgekeurd', 'Uitgelicht'
];

// ====== EENMALIG: sheet inrichten ========================================
/** Draai deze functie één keer vanuit de editor (▶ Uitvoeren). */
function setup() {
  var ss = SpreadsheetApp.getActive();
  inrichten_(ss, SHEET_PETITIE, PETITIE_KOLOMMEN, ['Naam tonen', 'Nieuwsbrief', 'Goedgekeurd']);
  inrichten_(ss, SHEET_AMBASSADEURS, AMBASSADEUR_KOLOMMEN,
    ['Toestemming website', 'Toestemming social & campagne', 'Updates', 'Goedgekeurd', 'Uitgelicht']);
  fotoMap_();
  // Vraag meteen de mail-autorisatie aan.
  MailApp.getRemainingDailyQuota();
}

function inrichten_(ss, naam, kolommen, checkboxKolommen) {
  var sh = ss.getSheetByName(naam) || ss.insertSheet(naam);
  sh.getRange(1, 1, 1, kolommen.length).setValues([kolommen])
    .setFontWeight('bold').setBackground('#152326').setFontColor('#e4bd4f');
  sh.setFrozenRows(1);
  checkboxKolommen.forEach(function (k) {
    var c = kolommen.indexOf(k) + 1;
    sh.getRange(2, c, sh.getMaxRows() - 1, 1).insertCheckboxes();
  });
  // Goedgekeurd-kolom groen markeren
  var g = kolommen.indexOf('Goedgekeurd') + 1;
  sh.getRange(1, g).setBackground('#3f6a1c').setFontColor('#ffffff');
}

// ====== HTTP ==============================================================
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'data';
  if (action === 'data') return json_(publiekeData_());
  return json_({ ok: false, error: 'onbekende actie' });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    // Honeypot tegen spambots: dit veld is onzichtbaar voor mensen.
    if (body.website_hp) return json_({ ok: true });
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      if (body.type === 'petitie') return json_(petitie_(body));
      if (body.type === 'ambassadeur') return json_(ambassadeur_(body));
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: false, error: 'onbekend type' });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Er ging iets mis. Probeer het later opnieuw.' });
  }
}

// ====== PETITIE ===========================================================
function petitie_(b) {
  var voornaam = schoon_(b.voornaam, 60), achternaam = schoon_(b.achternaam, 80);
  var email = schoon_(b.email, 120).toLowerCase();
  if (!voornaam || !achternaam || !geldigEmail_(email)) {
    return { ok: false, error: 'Vul je naam en een geldig e-mailadres in.' };
  }
  var sh = SpreadsheetApp.getActive().getSheetByName(SHEET_PETITIE);
  var emailCol = PETITIE_KOLOMMEN.indexOf('E-mail') + 1;
  var last = sh.getLastRow();
  if (last > 1) {
    var bestaand = sh.getRange(2, emailCol, last - 1, 1).getValues();
    for (var i = 0; i < bestaand.length; i++) {
      if (String(bestaand[i][0]).toLowerCase() === email) {
        return { ok: true, dubbel: true };
      }
    }
  }
  sh.appendRow([
    new Date(), voornaam, achternaam, email, schoon_(b.woonplaats, 80), schoon_(b.rol, 60),
    schoon_(b.bericht, 280), !!b.naamTonen, !!b.nieuwsbrief, false
  ]);
  CacheService.getScriptCache().remove('publiek');
  return { ok: true };
}

// ====== AMBASSADEUR =======================================================
function ambassadeur_(b) {
  var voornaam = schoon_(b.voornaam, 60), achternaam = schoon_(b.achternaam, 80);
  var email = schoon_(b.email, 120).toLowerCase();
  var wie = schoon_(b.wie, 120), verhaal = schoon_(b.verhaal, 500);
  if (!voornaam || !achternaam || !wie || !verhaal || !geldigEmail_(email)) {
    return { ok: false, error: 'Vul alle verplichte velden in.' };
  }
  if (!b.toestemmingWebsite) {
    return { ok: false, error: 'We hebben je toestemming nodig om je verhaal te publiceren.' };
  }

  var fotoUrl = '';
  if (b.foto && /^data:image\/(jpeg|png|webp);base64,/.test(b.foto)) {
    fotoUrl = bewaarFoto_(b.foto, voornaam + ' ' + achternaam);
  } else if (b.fotoLink) {
    fotoUrl = schoon_(b.fotoLink, 400);
  }

  var sh = SpreadsheetApp.getActive().getSheetByName(SHEET_AMBASSADEURS);
  sh.appendRow([
    new Date(), voornaam, achternaam, wie, verhaal, email, fotoUrl,
    schoon_(b.link, 200), schoon_(b.telefoon, 30),
    true, !!b.toestemmingSocial, !!b.updates, false, false
  ]);

  try { mailNieuweAmbassadeur_(voornaam, achternaam, wie, verhaal, email, fotoUrl, b); }
  catch (err) { console.error('Mail mislukt', err); }

  CacheService.getScriptCache().remove('publiek');
  return { ok: true };
}

function bewaarFoto_(dataUrl, naam) {
  var m = dataUrl.match(/^data:(image\/[a-z]+);base64,(.*)$/);
  var bytes = Utilities.base64Decode(m[2]);
  if (bytes.length > CONFIG.MAX_PHOTO_BYTES) throw new Error('Foto te groot');
  var ext = m[1].split('/')[1].replace('jpeg', 'jpg');
  var blob = Utilities.newBlob(bytes, m[1], naam + ' — ' + Utilities.formatDate(new Date(), 'Europe/Amsterdam', 'yyyy-MM-dd HHmm') + '.' + ext);
  var file = fotoMap_().createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1000';
}

function fotoMap_() {
  var it = DriveApp.getFoldersByName(CONFIG.PHOTO_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CONFIG.PHOTO_FOLDER_NAME);
}

function mailNieuweAmbassadeur_(voornaam, achternaam, wie, verhaal, email, fotoUrl, b) {
  var sheetUrl = SpreadsheetApp.getActive().getUrl();
  var html =
    '<div style="font-family:Arial,sans-serif;max-width:560px">' +
    '<h2 style="background:#152326;color:#e4bd4f;padding:16px;margin:0">Nieuwe ambassadeur voor Red de Ceuvel</h2>' +
    '<div style="border:3px solid #152326;border-top:0;padding:16px">' +
    (fotoUrl ? '<img src="' + fotoUrl + '" style="width:160px;height:160px;object-fit:cover;border-radius:50%;border:6px solid #d9d2b2">' : '') +
    '<p><b>' + esc_(voornaam + ' ' + achternaam) + '</b><br>' + esc_(wie) + '</p>' +
    '<p style="font-size:17px;border-left:6px solid #e4bd4f;padding-left:12px">"' + esc_(verhaal) + '"</p>' +
    '<p style="color:#4a5856;font-size:13px">E-mail: ' + esc_(email) +
    (b.telefoon ? '<br>Telefoon: ' + esc_(b.telefoon) : '') +
    (b.link ? '<br>Instagram/website: ' + esc_(b.link) : '') +
    '<br>Social & campagne: ' + (b.toestemmingSocial ? 'ja' : 'nee') + '</p>' +
    '<p><a href="' + sheetUrl + '" style="background:#e4bd4f;color:#152326;padding:10px 16px;text-decoration:none;font-weight:bold">' +
    'Open de sheet en vink "Goedgekeurd" aan →</a></p>' +
    '<p style="font-size:12px;color:#4a5856">Pas na het aanvinken van "Goedgekeurd" verschijnt deze ambassadeur op reddeceuvel.nl (binnen ± 1 minuut).</p>' +
    '</div></div>';
  MailApp.sendEmail({
    to: CONFIG.NOTIFY_EMAIL,
    subject: 'Nieuwe ambassadeur: ' + voornaam + ' ' + achternaam,
    htmlBody: html,
    replyTo: email
  });
}

// ====== PUBLIEKE DATA (alleen goedgekeurd) ================================
function publiekeData_() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get('publiek');
  if (hit) return JSON.parse(hit);

  var ss = SpreadsheetApp.getActive();
  var p = rijen_(ss.getSheetByName(SHEET_PETITIE), PETITIE_KOLOMMEN);
  var a = rijen_(ss.getSheetByName(SHEET_AMBASSADEURS), AMBASSADEUR_KOLOMMEN);

  var getekend = p.filter(function (r) { return r['E-mail']; });
  var ondertekenaars = getekend
    .filter(function (r) { return r['Goedgekeurd'] === true && r['Naam tonen'] === true; })
    .reverse().slice(0, 200)
    .map(function (r) {
      return {
        naam: r['Voornaam'] + ' ' + String(r['Achternaam']).charAt(0) + '.',
        woonplaats: r['Woonplaats'] || '',
        rol: r['Ik ben'] || '',
        bericht: r['Waarom ik teken'] || '',
        datum: r['Tijdstip'] instanceof Date ? r['Tijdstip'].toISOString() : ''
      };
    });

  var ambassadeurs = a
    .filter(function (r) { return r['Goedgekeurd'] === true && r['Toestemming website'] === true; })
    .reverse()
    .map(function (r) {
      return {
        naam: r['Voornaam'] + ' ' + r['Achternaam'],
        wie: r['Wie ben je'],
        verhaal: r['Wat betekent de Ceuvel voor jou'],
        foto: r['Foto'] || '',
        link: r['Instagram / website'] || '',
        uitgelicht: r['Uitgelicht'] === true
      };
    });

  var data = {
    ok: true,
    handtekeningen: getekend.length,
    ondertekenaars: ondertekenaars,
    ambassadeurs: ambassadeurs,
    bijgewerkt: new Date().toISOString()
  };
  cache.put('publiek', JSON.stringify(data), CONFIG.CACHE_SECONDS);
  return data;
}

/** Wis de cache zodra iemand iets aanvinkt in de sheet, zodat het direct zichtbaar wordt. */
function onEdit() {
  CacheService.getScriptCache().remove('publiek');
}

// ====== HULPJES ===========================================================
function rijen_(sh, kolommen) {
  var last = sh.getLastRow();
  if (last < 2) return [];
  var waarden = sh.getRange(2, 1, last - 1, kolommen.length).getValues();
  return waarden.map(function (rij) {
    var o = {};
    kolommen.forEach(function (k, i) { o[k] = rij[i]; });
    return o;
  });
}
function schoon_(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max); }
function geldigEmail_(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); }
function esc_(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
