/* Bookmarklet: Analizar contraste de color */
/* Criterios: 1.4.3, 1.4.11 */

var _findings = [];
var _elementMap = [];
var _analyzed = 0;
var _MAX = 200;

function _isVisible(el) {
  var s = getComputedStyle(el);
  return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0' && el.offsetWidth > 0 && el.offsetHeight > 0;
}

function _hasDirectText(el) {
  for (var i = 0; i < el.childNodes.length; i++) {
    if (el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim().length > 0) return true;
  }
  return false;
}

/* Analiza texto */
var _allEls = document.body.querySelectorAll('*');
for (var _i = 0; _i < _allEls.length && _analyzed < _MAX; _i++) {
  var _el = _allEls[_i];
  if (!_hasDirectText(_el) || !_isVisible(_el)) continue;

  var _style = getComputedStyle(_el);
  var _fgRaw = _style.color;
  var _fg    = parseColorToRgb(_fgRaw);
  if (!_fg) continue;

  var _bg = getEffectiveBackground(_el);
  if (!_bg) _bg = { r: 255, g: 255, b: 255, a: 1 };

  var _blended = blendWithBackground(_fg, _bg);
  var _ratio   = contrastRatio(_blended, _bg);
  var _ratio2  = Math.round(_ratio * 100) / 100;
  var _large   = isLargeText(_el);
  var _min     = _large ? 3 : 4.5;
  var _text    = _el.textContent.trim().substring(0, 40);

  _analyzed++;

  if (_ratio < _min) {
    _findings.push(createFinding('error', '1.4.3', getSelector(_el), '"' + _text + '"', 'Contraste insuficiente: ' + _ratio2 + ':1 (mínimo ' + _min + ':1' + (_large ? ' para texto grande' : '') + '). El texto puede ser difícil de leer.', 'Aumenta el contraste cambiando el color del texto o el fondo.'));
    _elementMap.push(_el);
  } else if (_ratio < _min + 0.5) {
    _findings.push(createFinding('aviso', '1.4.3', getSelector(_el), '"' + _text + '"', 'Contraste justo: ' + _ratio2 + ':1 (mínimo ' + _min + ':1). Muy cerca del límite.', 'Considera aumentar ligeramente el contraste para mayor robustez.'));
    _elementMap.push(_el);
  }
}

/* Analiza componentes UI: inputs y botones (criterio 1.4.11) */
var _uiEls = document.querySelectorAll('input:not([type="hidden"]), button, select, textarea, [role="button"], [role="checkbox"], [role="radio"], [role="switch"]');
for (var _ui = 0; _ui < _uiEls.length; _ui++) {
  var _uiel = _uiEls[_ui];
  if (!_isVisible(_uiel)) continue;
  var _uistyle  = getComputedStyle(_uiel);
  var _border   = _uistyle.borderColor || _uistyle.outlineColor;
  var _uibg     = getEffectiveBackground(_uiel.parentElement || _uiel);
  var _borderRgb = parseColorToRgb(_border);
  if (!_borderRgb || !_uibg) continue;
  var _uiratio = contrastRatio(_borderRgb, _uibg);
  var _uiratio2 = Math.round(_uiratio * 100) / 100;
  if (_uiratio < 3) {
    _findings.push(createFinding('aviso', '1.4.11', getSelector(_uiel), getSnippet(_uiel), 'Borde del componente con contraste ' + _uiratio2 + ':1 (mínimo 3:1). Puede ser difícil de ver.', 'Aumenta el contraste del borde del input/botón respecto a su fondo.'));
    _elementMap.push(_uiel);
  }
}

if (_analyzed === 0 && _uiEls.length === 0) {
  _findings.push(createFinding('aviso', '1.4.3', 'documento', '', 'No se encontraron elementos de texto visibles para analizar.', ''));
  _elementMap.push(null);
}

if (_findings.length === 0 && _analyzed > 0) {
  _findings.push(createFinding('correcto', '1.4.3', 'documento', '', 'No se detectaron problemas de contraste en los ' + _analyzed + ' elementos analizados.', ''));
  _elementMap.push(null);
}

var _panel = createOverlay('Contraste');
for (var _fi = 0; _fi < _findings.length; _fi++) {
  addFinding(_panel, _findings[_fi], _elementMap[_fi]);
}
updateStats(_panel, _findings);

if (_analyzed >= _MAX) {
  __a11yPanelObj.footer.textContent += ' (análisis limitado a ' + _MAX + ' elementos)';
}

reportResults('contrast', _findings);
