/* Bookmarklet: Analizar foco visible y orden de tabulación */
/* Criterios: 2.4.7, 2.4.3, 2.4.11 */

var _findings = [];
var _elementMap = [];

var _FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"], details > summary, audio[controls], video[controls]';

var _focusables = Array.prototype.slice.call(document.querySelectorAll(_FOCUSABLE));

/* Filtrar visibles */
_focusables = _focusables.filter(function(el) {
  var s = getComputedStyle(el);
  return s.display !== 'none' && s.visibility !== 'hidden' && el.offsetParent !== null;
});

/* Comprobar CSS global que elimine outline */
var _sheets = Array.prototype.slice.call(document.styleSheets);
var _outlineRemoved = false;
try {
  _sheets.forEach(function(sheet) {
    var rules;
    try { rules = sheet.cssRules || sheet.rules; } catch(e) { return; }
    if (!rules) return;
    Array.prototype.slice.call(rules).forEach(function(rule) {
      if (!rule.selectorText || !rule.style) return;
      var sel = rule.selectorText;
      var outlineVal = rule.style.outline || rule.style.outlineStyle || '';
      var isFocusRule = sel.indexOf(':focus') !== -1;
      var isGlobal = sel === ':focus' || sel === '*:focus' || sel === '*' || sel === ':focus-visible';
      if (isFocusRule && isGlobal && (outlineVal === 'none' || outlineVal === '0' || outlineVal === 'none !important')) {
        _outlineRemoved = true;
      }
    });
  });
} catch(e) {}

if (_outlineRemoved) {
  _findings.push(createFinding('error', '2.4.7', 'CSS global', '', 'Se detectó outline:none en :focus sin :focus-visible que lo restituya. Todos los elementos interactivos pierden el indicador de foco.', 'Usa :focus-visible en lugar de :focus para ocultar el outline solo en clics, manteniéndolo para teclado.'));
  _elementMap.push(null);
}

/* Comprobar tabindex positivo (anti-patrón) */
var _posTabindex = document.querySelectorAll('[tabindex]');
for (var _ti = 0; _ti < _posTabindex.length; _ti++) {
  var _tiel = _posTabindex[_ti];
  var _tival = parseInt(_tiel.getAttribute('tabindex'));
  if (_tival > 0) {
    _findings.push(createFinding('aviso', '2.4.3', getSelector(_tiel), getSnippet(_tiel), 'tabindex=' + _tival + ' positivo. Esto altera el orden natural del teclado y es difícil de mantener.', 'Usa tabindex="0" o reordena los elementos en el DOM para un orden lógico.'));
    _elementMap.push(_tiel);
  }
}

/* Comprobar foco visible — prueba rápida de outline */
var _noFocusCount = 0;
var _MAX_FOCUS = 30;
var _testBatch = _focusables.slice(0, _MAX_FOCUS);

for (var _fi2 = 0; _fi2 < _testBatch.length; _fi2++) {
  var _fel = _testBatch[_fi2];

  /* Captura estilos antes y después de :focus */
  var _before = getComputedStyle(_fel);
  var _outBefore = _before.outlineStyle + _before.outlineWidth + _before.outlineColor;
  var _boxBefore = _before.boxShadow;

  _fel.focus({ preventScroll: true });
  var _after = getComputedStyle(_fel);
  var _outAfter = _after.outlineStyle + _after.outlineWidth + _after.outlineColor;
  var _boxAfter = _after.boxShadow;
  _fel.blur();

  var _changed = (_outBefore !== _outAfter) || (_boxBefore !== _boxAfter);

  /* outline:none visible tras focus */
  var _outlineNoneAfter = _after.outlineStyle === 'none' && _after.outlineWidth === '0px';
  var _noBoxChange      = _boxBefore === _boxAfter || _boxAfter === 'none';

  if (_outlineNoneAfter && _noBoxChange) {
    _noFocusCount++;
    if (_noFocusCount <= 5) {
      _findings.push(createFinding('error', '2.4.7', getSelector(_fel), getSnippet(_fel), 'Elemento sin indicador de foco visible. Los usuarios de teclado no sabrán dónde están.', 'Añade un :focus-visible con outline o box-shadow visible para este elemento.'));
      _elementMap.push(_fel);
    }
  }
}

if (_noFocusCount > 5) {
  _findings.push(createFinding('error', '2.4.7', 'múltiples elementos', '', _noFocusCount + ' elementos más sin foco visible (se muestran solo los primeros 5).', 'Revisa el CSS global de :focus y :focus-visible.'));
  _elementMap.push(null);
}

/* Comprobar orden de tabulación vs orden visual */
var _orderProblems = 0;
for (var _oi = 1; _oi < Math.min(_focusables.length, 20); _oi++) {
  var _prev = _focusables[_oi - 1].getBoundingClientRect();
  var _curr = _focusables[_oi].getBoundingClientRect();
  /* Si el siguiente elemento está significativamente más arriba en la página */
  if (_curr.top < _prev.top - 100 && _curr.left < _prev.left - 200) {
    _orderProblems++;
    if (_orderProblems <= 2) {
      _findings.push(createFinding('aviso', '2.4.3', getSelector(_focusables[_oi]), getSnippet(_focusables[_oi]), 'Posible orden de tabulación no lógico: este elemento aparece visualmente antes que el anterior en el DOM.', 'Verifica que el orden de los elementos en el HTML refleje el orden visual lógico.'));
      _elementMap.push(_focusables[_oi]);
    }
  }
}

/* Resumen de elementos focusables */
if (_focusables.length === 0) {
  _findings.push(createFinding('aviso', '2.4.7', 'documento', '', 'No se encontraron elementos interactivos en la página.', ''));
  _elementMap.push(null);
} else if (_findings.length === 0) {
  _findings.push(createFinding('correcto', '2.4.7', 'documento', '', 'No se detectaron problemas de foco en los ' + Math.min(_focusables.length, _MAX_FOCUS) + ' elementos analizados.', ''));
  _elementMap.push(null);
}

var _panel = createOverlay('Foco y tabulación');
for (var _fi = 0; _fi < _findings.length; _fi++) {
  addFinding(_panel, _findings[_fi], _elementMap[_fi]);
}
updateStats(_panel, _findings);

if (_focusables.length > _MAX_FOCUS) {
  __a11yPanelObj.footer.textContent += ' (prueba de foco limitada a ' + _MAX_FOCUS + ' elementos)';
}

reportResults('focus', _findings);
