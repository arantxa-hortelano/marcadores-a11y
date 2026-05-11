/* Bookmarklet: Analizar enlaces */
/* Criterios: 2.4.4, 4.1.2 */

var _links = document.querySelectorAll('a[href]');
var _findings = [];
var _elementMap = [];

var _genericTexts = [
  'clic aquí', 'click aquí', 'clic aqui', 'click aqui',
  'aquí', 'aqui', 'here', 'click here', 'clic here',
  'leer más', 'leer mas', 'read more',
  'más información', 'mas informacion', 'more info', 'more information',
  'ver más', 'ver mas', 'see more',
  'enlace', 'link', 'ir', 'go', 'continuar', 'continue',
  'siguiente', 'next', 'anterior', 'prev', 'previous',
  'descargar', 'download', 'abrir', 'open'
];

function _getLinkName(a) {
  var ariaLbl = a.getAttribute('aria-label');
  if (ariaLbl && ariaLbl.trim()) return ariaLbl.trim();
  var lby = a.getAttribute('aria-labelledby');
  if (lby) {
    var ref = document.getElementById(lby);
    if (ref) return ref.textContent.trim();
  }
  /* Texto de nodos hijos, ignorando elementos ocultos y aria-hidden */
  var text = '';
  a.childNodes.forEach(function(node) {
    if (node.nodeType === 3) {
      text += node.textContent;
    } else if (node.nodeType === 1) {
      var hidden = node.getAttribute && (
        node.getAttribute('aria-hidden') === 'true' ||
        node.getAttribute('hidden') !== null
      );
      if (!hidden) text += node.textContent || node.getAttribute('alt') || '';
    }
  });
  return text.trim();
}

/* Grupos de enlaces por texto visible para detectar duplicados con distinto destino */
var _textToHrefs = {};
for (var _li = 0; _li < _links.length; _li++) {
  var _lnk = _links[_li];
  var _lname = _getLinkName(_lnk);
  var _lhref = _lnk.getAttribute('href') || '';
  var _key = _lname.toLowerCase();
  if (!_textToHrefs[_key]) _textToHrefs[_key] = [];
  _textToHrefs[_key].push(_lhref);
}

for (var _li2 = 0; _li2 < _links.length; _li2++) {
  var _a = _links[_li2];
  var _href = _a.getAttribute('href') || '';
  var _name = _getLinkName(_a);
  var _nameLower = _name.toLowerCase();

  /* Sin nombre accesible */
  if (!_name) {
    _findings.push(createFinding('error', '4.1.2', getSelector(_a), getSnippet(_a), 'Enlace sin texto accesible. Los lectores de pantalla no pueden describirlo.', 'Añade texto visible, aria-label, o un alt a la imagen dentro del enlace.'));
    _elementMap.push(_a);
    continue;
  }

  /* Texto genérico */
  var _isGeneric = _genericTexts.indexOf(_nameLower) !== -1;
  if (_isGeneric) {
    _findings.push(createFinding('aviso', '2.4.4', getSelector(_a), getSnippet(_a), 'Texto del enlace genérico: "' + _name + '". Sin contexto no se sabe a dónde lleva.', 'Usa un texto descriptivo como "Leer más sobre accesibilidad web" en lugar de solo "Leer más".'));
    _elementMap.push(_a);
    continue;
  }

  /* href vacío o "#" o javascript:void */
  if (_href === '#' || _href === '' || _href.indexOf('javascript:void') === 0) {
    _findings.push(createFinding('aviso', '2.4.4', getSelector(_a), getSnippet(_a), 'Enlace con href="' + _href + '". Si es una acción, usa <button> en su lugar.', 'Los enlaces deberían navegar; usa <button type="button"> para acciones sin navegación.'));
    _elementMap.push(_a);
    continue;
  }

  /* target="_blank" sin rel="noopener" */
  if (_a.getAttribute('target') === '_blank') {
    var _rel = _a.getAttribute('rel') || '';
    if (_rel.indexOf('noopener') === -1) {
      _findings.push(createFinding('aviso', '2.4.4', getSelector(_a), getSnippet(_a), 'Enlace que abre en nueva pestaña sin rel="noopener". Puede generar confusión y riesgo de seguridad.', 'Añade rel="noopener noreferrer" y avisa al usuario que abre una nueva pestaña (aria-label o icono).'));
      _elementMap.push(_a);
      continue;
    }
  }

  /* Mismo texto, destinos distintos */
  var _hrefs = _textToHrefs[_nameLower];
  var _uniqueHrefs = _hrefs.filter(function(h, idx) { return _hrefs.indexOf(h) === idx; });
  if (_uniqueHrefs.length > 1 && _findings.filter(function(f) { return f.mensaje && f.mensaje.indexOf('"' + _name + '"') !== -1 && f.estado === 'aviso'; }).length === 0) {
    _findings.push(createFinding('aviso', '2.4.4', getSelector(_a), getSnippet(_a), 'Varios enlaces con el mismo texto "' + _name + '" apuntan a destinos distintos. Puede confundir a usuarios de lectores de pantalla.', 'Diferencia los textos o añade aria-label con el destino completo.'));
    _elementMap.push(_a);
    continue;
  }

  _findings.push(createFinding('correcto', '2.4.4', getSelector(_a), '"' + _name.substring(0, 80) + '"', 'Enlace con texto descriptivo — correcto.', ''));
  _elementMap.push(_a);
}

if (_links.length === 0) {
  _findings.push(createFinding('correcto', '2.4.4', 'documento', '', 'No se encontraron enlaces en la página.', ''));
  _elementMap.push(null);
}

var _panel = createOverlay('Enlaces');
for (var _fi = 0; _fi < _findings.length; _fi++) {
  addFinding(_panel, _findings[_fi], _elementMap[_fi]);
}
updateStats(_panel, _findings);
reportResults('links', _findings);
