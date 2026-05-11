/* Bookmarklet: Analizar imágenes */
/* Criterios: 1.1.1, 4.1.2 */

var _imgs = document.querySelectorAll('img, [role="img"], svg:not([aria-hidden="true"])');
var _findings = [];
var _elementMap = [];

var _genericAlts = ['imagen', 'image', 'foto', 'photo', 'picture', 'img', 'photo.jpg', 'image.jpg', 'pic'];

function _isDecorative(el) {
  return el.getAttribute('role') === 'presentation' ||
         el.getAttribute('role') === 'none' ||
         el.getAttribute('aria-hidden') === 'true';
}

function _getAccessibleName(el) {
  var alt  = el.getAttribute('alt');
  var aria = el.getAttribute('aria-label');
  var lby  = el.getAttribute('aria-labelledby');
  if (lby) {
    var ref = document.getElementById(lby);
    return ref ? ref.textContent.trim() : '';
  }
  if (aria) return aria.trim();
  if (alt !== null) return alt.trim();
  return null;
}

function _isInsideLink(el) {
  var p = el.parentElement;
  while (p) {
    if (p.tagName === 'A') return p;
    p = p.parentElement;
  }
  return null;
}

for (var _ii = 0; _ii < _imgs.length; _ii++) {
  var _el = _imgs[_ii];
  var _tag = _el.tagName.toLowerCase();

  /* SVG con aria-hidden ya filtrado en el querySelectorAll */
  if (_tag === 'svg') {
    var _svgName = _el.getAttribute('aria-label') || (_el.querySelector('title') ? _el.querySelector('title').textContent.trim() : null);
    var _svgRole = _el.getAttribute('role');
    if (_isDecorative(_el)) {
      _findings.push(createFinding('correcto', '1.1.1', getSelector(_el), getSnippet(_el), 'SVG marcado como decorativo — correcto.', ''));
      _elementMap.push(_el);
    } else if (!_svgName && _svgRole !== 'presentation') {
      _findings.push(createFinding('aviso', '1.1.1', getSelector(_el), getSnippet(_el), 'SVG sin nombre accesible. Si es decorativo añade aria-hidden="true"; si transmite información añade aria-label o un <title>.', ''));
      _elementMap.push(_el);
    } else {
      _findings.push(createFinding('correcto', '1.1.1', getSelector(_el), getSnippet(_el), 'SVG con nombre accesible: "' + _svgName + '"', ''));
      _elementMap.push(_el);
    }
    continue;
  }

  /* IMG y role="img" */
  if (_isDecorative(_el)) {
    var _altAttr = _el.getAttribute('alt');
    if (_altAttr === '') {
      _findings.push(createFinding('correcto', '1.1.1', getSelector(_el), getSnippet(_el), 'Imagen decorativa con alt="" — correcto.', ''));
    } else {
      _findings.push(createFinding('aviso', '1.1.1', getSelector(_el), getSnippet(_el), 'Imagen con role="presentation" pero sin alt="". Añade alt="" para que los lectores de pantalla la ignoren completamente.', ''));
    }
    _elementMap.push(_el);
    continue;
  }

  var _name = _getAccessibleName(_el);

  if (_name === null) {
    _findings.push(createFinding('error', '1.1.1', getSelector(_el), getSnippet(_el), 'Imagen sin atributo alt. Los lectores de pantalla no pueden describir esta imagen.', 'Añade alt="descripción de la imagen" o alt="" si es decorativa.'));
    _elementMap.push(_el);
    continue;
  }

  if (_name === '') {
    var _parentLink = _isInsideLink(_el);
    if (_parentLink) {
      var _linkText = _parentLink.textContent.replace(_el.alt || '', '').trim();
      if (!_linkText) {
        _findings.push(createFinding('error', '4.1.2', getSelector(_el), getSnippet(_parentLink), 'Enlace formado solo por una imagen con alt vacío. El enlace no tiene nombre accesible.', 'Añade un alt descriptivo a la imagen o un aria-label al enlace.'));
        _elementMap.push(_el);
        continue;
      }
    }
    _findings.push(createFinding('correcto', '1.1.1', getSelector(_el), getSnippet(_el), 'Imagen marcada como decorativa con alt="" — correcto.', ''));
    _elementMap.push(_el);
    continue;
  }

  /* Alt genérico o igual al nombre de archivo */
  var _nameLower = _name.toLowerCase();
  var _srcName   = (_el.getAttribute('src') || '').split('/').pop().split('?')[0].split('.')[0].toLowerCase();
  var _isGeneric = _genericAlts.indexOf(_nameLower) !== -1;
  var _isSameAsSrc = _srcName && _nameLower === _srcName;

  if (_isGeneric || _isSameAsSrc) {
    _findings.push(createFinding('aviso', '1.1.1', getSelector(_el), getSnippet(_el), 'Alt poco descriptivo: "' + _name + '". Debería describir qué muestra la imagen, no su nombre de archivo.', 'Escribe un alt que describa el contenido o función de la imagen.'));
    _elementMap.push(_el);
  } else {
    _findings.push(createFinding('correcto', '1.1.1', getSelector(_el), getSnippet(_el), 'Alt: "' + _name.substring(0, 80) + '"', ''));
    _elementMap.push(_el);
  }
}

if (_imgs.length === 0) {
  _findings.push(createFinding('correcto', '1.1.1', 'documento', '', 'No se encontraron imágenes en la página.', ''));
  _elementMap.push(null);
}

var _panel = createOverlay('Imágenes');
for (var _fi = 0; _fi < _findings.length; _fi++) {
  addFinding(_panel, _findings[_fi], _elementMap[_fi]);
}
updateStats(_panel, _findings);
reportResults('images', _findings);
