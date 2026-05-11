/* Bookmarklet: Analizar encabezados */
/* Criterios: 1.3.1, 2.4.6 */

var _headings = document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="heading"]');
var _headingList = [];
var _findings = [];
var _elementMap = [];

/* Recoge todos los encabezados con nivel y texto */
for (var _hi = 0; _hi < _headings.length; _hi++) {
  var _hel = _headings[_hi];
  var _hlevel;
  if (_hel.getAttribute('role') === 'heading') {
    _hlevel = parseInt(_hel.getAttribute('aria-level')) || 2;
  } else {
    _hlevel = parseInt(_hel.tagName.charAt(1));
  }
  _headingList.push({ el: _hel, level: _hlevel, text: _hel.textContent.trim() });
}

/* Comprobar: exactamente un H1 */
var _h1s = _headingList.filter(function(h) { return h.level === 1; });

if (_h1s.length === 0) {
  _findings.push(createFinding('error', '2.4.6', 'documento', '', 'No hay ningún encabezado H1. Toda página debe tener un título principal.', 'Añade un <h1> con el título principal de la página.'));
  _elementMap.push(null);
} else if (_h1s.length === 1) {
  _findings.push(createFinding('correcto', '2.4.6', getSelector(_h1s[0].el), 'H1: "' + _h1s[0].text.substring(0, 60) + '"', 'Un único H1 — correcto.', ''));
  _elementMap.push(_h1s[0].el);
} else {
  _h1s.forEach(function(h, idx) {
    if (idx === 0) return;
    _findings.push(createFinding('error', '2.4.6', getSelector(h.el), getSnippet(h.el), 'H1 duplicado: "' + h.text.substring(0, 60) + '". Solo debe haber un H1 por página.', 'Convierte los H1 adicionales en H2 o un nivel inferior.'));
    _elementMap.push(h.el);
  });
}

/* Comprobar: jerarquía sin saltos */
var _prevLevel = 0;
_headingList.forEach(function(h) {
  if (h.text === '') {
    _findings.push(createFinding('error', '2.4.6', getSelector(h.el), getSnippet(h.el), 'H' + h.level + ' vacío. Los encabezados deben tener contenido descriptivo.', 'Añade texto descriptivo o elimina el encabezado.'));
    _elementMap.push(h.el);
    return;
  }
  if (_prevLevel > 0 && h.level > _prevLevel + 1) {
    _findings.push(createFinding('error', '1.3.1', getSelector(h.el), getSnippet(h.el), 'Salto de nivel de H' + _prevLevel + ' a H' + h.level + ' (falta H' + (_prevLevel + 1) + '). Rompe la jerarquía.', 'Cambia H' + h.level + ' por H' + (_prevLevel + 1) + ' o añade los niveles intermedios.'));
    _elementMap.push(h.el);
  } else if (!(h.level === 1 && _h1s.length === 1)) {
    _findings.push(createFinding('correcto', '1.3.1', getSelector(h.el), 'H' + h.level + ': "' + h.text.substring(0, 60) + '"', 'Encabezado con nivel correcto.', ''));
    _elementMap.push(h.el);
  }
  _prevLevel = h.level;
});

/* Sin encabezados en la página */
if (_headingList.length === 0) {
  _findings.push(createFinding('aviso', '2.4.6', 'documento', '', 'No se encontraron encabezados en la página.', 'Usa <h1>–<h6> para estructurar el contenido semánticamente.'));
  _elementMap.push(null);
}

/* Construir panel y mostrar resultados */
var _panel = createOverlay('Encabezados');
for (var _fi = 0; _fi < _findings.length; _fi++) {
  addFinding(_panel, _findings[_fi], _elementMap[_fi]);
}
updateStats(_panel, _findings);
reportResults('headings', _findings);
