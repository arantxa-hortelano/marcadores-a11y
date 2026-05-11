/* Bookmarklet: Analizar landmarks y estructura semántica */
/* Criterios: 1.3.1, 2.4.1 */

var _findings = [];
var _elementMap = [];

function _getRole(el) {
  var explicit = el.getAttribute('role');
  if (explicit) return explicit;
  var tag = el.tagName.toLowerCase();
  var map = {
    'main':    'main',
    'nav':     'navigation',
    'header':  el.closest('main, article, section, aside') ? 'generic' : 'banner',
    'footer':  el.closest('main, article, section, aside') ? 'generic' : 'contentinfo',
    'aside':   'complementary',
    'form':    el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') ? 'form' : 'generic',
    'section': el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') ? 'region' : 'generic',
    'search':  'search'
  };
  return map[tag] || null;
}

/* Comprobar: exactamente un <main> */
var _mains = Array.prototype.slice.call(document.querySelectorAll('[role="main"], main'));
_mains = _mains.filter(function(el) {
  return getComputedStyle(el).display !== 'none';
});

if (_mains.length === 0) {
  _findings.push(createFinding('error', '1.3.1', 'documento', '', 'No hay elemento <main> ni role="main". Los lectores de pantalla no pueden saltar directamente al contenido principal.', 'Envuelve el contenido principal en un <main>.'));
  _elementMap.push(null);
} else if (_mains.length > 1) {
  _findings.push(createFinding('error', '1.3.1', getSelector(_mains[1]), getSnippet(_mains[1]), 'Hay ' + _mains.length + ' elementos <main>. Solo debe existir uno.', 'Conserva solo un <main> y convierte los demás en <section> u otro elemento apropiado.'));
  _elementMap.push(_mains[1]);
} else {
  _findings.push(createFinding('correcto', '1.3.1', getSelector(_mains[0]), '<main>', 'Un único elemento <main> — correcto.', ''));
  _elementMap.push(_mains[0]);
}

/* Comprobar: skip link */
var _firstLink = document.querySelector('a[href]');
var _hasSkip = false;
if (_firstLink) {
  var _fhref = _firstLink.getAttribute('href') || '';
  if (_fhref.charAt(0) === '#' && _fhref.length > 1) {
    _hasSkip = true;
    _findings.push(createFinding('correcto', '2.4.1', getSelector(_firstLink), getSnippet(_firstLink), 'Primer enlace de la página apunta a un ancla — posible "saltar al contenido" correcto.', ''));
    _elementMap.push(_firstLink);
  }
}
if (!_hasSkip) {
  _findings.push(createFinding('aviso', '2.4.1', 'documento', '', 'No se detectó un enlace "Ir al contenido principal". Los usuarios de teclado deben tabular por toda la navegación en cada página.', 'Añade un <a href="#main" class="skip-link">Ir al contenido</a> al inicio del body.'));
  _elementMap.push(null);
}

/* Comprobar: <header> y <footer> a nivel de página */
var _header = document.querySelector('body > header, body > div > header, [role="banner"]');
var _footer = document.querySelector('body > footer, body > div > footer, [role="contentinfo"]');

if (!_header) {
  _findings.push(createFinding('aviso', '1.3.1', 'documento', '', 'No se detectó un <header> a nivel de página (role="banner"). Ayuda a los lectores de pantalla a identificar la cabecera.', 'Envuelve la cabecera de la página en un <header>.'));
  _elementMap.push(null);
} else {
  _findings.push(createFinding('correcto', '1.3.1', getSelector(_header), '<header>', 'Cabecera de página detectada — correcto.', ''));
  _elementMap.push(_header);
}

if (!_footer) {
  _findings.push(createFinding('aviso', '1.3.1', 'documento', '', 'No se detectó un <footer> a nivel de página (role="contentinfo").', 'Envuelve el pie de página en un <footer>.'));
  _elementMap.push(null);
} else {
  _findings.push(createFinding('correcto', '1.3.1', getSelector(_footer), '<footer>', 'Pie de página detectado — correcto.', ''));
  _elementMap.push(_footer);
}

/* Comprobar: múltiples <nav> etiquetados */
var _navs = document.querySelectorAll('nav, [role="navigation"]');
if (_navs.length > 1) {
  for (var _ni = 0; _ni < _navs.length; _ni++) {
    var _nav = _navs[_ni];
    var _navLabel = _nav.getAttribute('aria-label') || (_nav.getAttribute('aria-labelledby') ? 'sí (aria-labelledby)' : '');
    if (!_navLabel) {
      _findings.push(createFinding('aviso', '1.3.1', getSelector(_nav), getSnippet(_nav), 'Hay ' + _navs.length + ' elementos de navegación y este no tiene aria-label. Los lectores de pantalla los llamarán a todos "navegación".', 'Añade aria-label="Menú principal", aria-label="Menú secundario", etc.'));
      _elementMap.push(_nav);
    } else {
      _findings.push(createFinding('correcto', '1.3.1', getSelector(_nav), '<nav aria-label="' + _navLabel + '">', 'Navegación etiquetada correctamente.', ''));
      _elementMap.push(_nav);
    }
  }
} else if (_navs.length === 1) {
  _findings.push(createFinding('correcto', '1.3.1', getSelector(_navs[0]), '<nav>', 'Un único elemento de navegación — correcto.', ''));
  _elementMap.push(_navs[0]);
} else {
  _findings.push(createFinding('aviso', '1.3.1', 'documento', '', 'No se detectó ningún elemento <nav>. Si hay menús de navegación, envuélvelos en <nav>.', ''));
  _elementMap.push(null);
}

/* Comprobar: <html lang> */
var _htmlLang = document.documentElement.getAttribute('lang');
if (!_htmlLang) {
  _findings.push(createFinding('error', '3.1.1', '<html>', '<html>', 'El elemento <html> no tiene atributo lang. Los lectores de pantalla no saben en qué idioma está la página.', 'Añade lang="es" (o el idioma correspondiente) al elemento <html>.'));
  _elementMap.push(document.documentElement);
} else {
  _findings.push(createFinding('correcto', '3.1.1', '<html>', '<html lang="' + _htmlLang + '">', 'Idioma de página declarado: "' + _htmlLang + '"', ''));
  _elementMap.push(document.documentElement);
}

var _panel = createOverlay('Landmarks');
for (var _fi = 0; _fi < _findings.length; _fi++) {
  addFinding(_panel, _findings[_fi], _elementMap[_fi]);
}
updateStats(_panel, _findings);
reportResults('landmarks', _findings);
