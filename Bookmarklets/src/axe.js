/* Bookmarklet: Ejecutar axe-core */
/* Criterios: todos los incluidos en axe WCAG 2.2 AA */

var _AXE_CDN = 'https://cdn.jsdelivr.net/npm/axe-core@4/axe.min.js';

function _runAxe() {
  var _panel = createOverlay('axe-core');
  var _loadingItem = { estado: 'aviso', criterio: '', titulo: '', nivel: '', selector: '', html: '', mensaje: 'Ejecutando axe-core…', sugerencia: '' };
  addFinding(_panel, _loadingItem, null);

  axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }
  }, function(err, results) {
    /* Vaciar panel */
    _panel.findingsList.innerHTML = '';

    if (err) {
      var _errFinding = createFinding('error', '4.1.2', 'axe-core', '', 'Error al ejecutar axe-core: ' + err.message, '');
      addFinding(_panel, _errFinding, null);
      updateStats(_panel, [_errFinding]);
      reportResults('axe', [_errFinding]);
      return;
    }

    var _findings = [];
    var _elementMap = [];

    /* Violations (errores) */
    results.violations.forEach(function(v) {
      v.nodes.forEach(function(node) {
        var _criterioId = null;
        var _tags = v.tags || [];
        _tags.forEach(function(tag) {
          var m = tag.match(/^wcag(\d)(\d+)(\w)?$/);
          if (m && !_criterioId) {
            _criterioId = m[1] + '.' + m[2] + (m[3] ? '.' + m[3].charCodeAt(0) - 96 : '');
          }
        });
        _criterioId = _criterioId || v.id;

        var _el = null;
        try { _el = document.querySelector(node.target[0]); } catch(e) {}

        var _finding = {
          estado: 'error',
          criterio: _criterioId,
          titulo: v.help,
          nivel: 'AA',
          selector: node.target[0] || '',
          html: (node.html || '').substring(0, 140),
          mensaje: v.description,
          sugerencia: node.failureSummary || ''
        };
        _findings.push(_finding);
        _elementMap.push(_el);
      });
    });

    /* Incomplete (avisos — necesitan revisión manual) */
    results.incomplete.forEach(function(v) {
      v.nodes.forEach(function(node) {
        var _el = null;
        try { _el = document.querySelector(node.target[0]); } catch(e) {}
        var _finding = {
          estado: 'aviso',
          criterio: v.id,
          titulo: v.help,
          nivel: 'AA',
          selector: node.target[0] || '',
          html: (node.html || '').substring(0, 140),
          mensaje: v.description + ' (requiere revisión manual)',
          sugerencia: node.failureSummary || ''
        };
        _findings.push(_finding);
        _elementMap.push(_el);
      });
    });

    /* Passes (correctos — solo resumen, no listamos todos) */
    var _passCount = 0;
    results.passes.forEach(function(v) { _passCount += v.nodes.length; });
    if (_passCount > 0) {
      _findings.push(createFinding('correcto', '4.1.2', 'resumen', '', _passCount + ' comprobaciones superadas por axe-core.', ''));
      _elementMap.push(null);
    }

    if (_findings.length === 0) {
      _findings.push(createFinding('correcto', '4.1.2', 'documento', '', 'axe-core no encontró problemas de accesibilidad.', ''));
      _elementMap.push(null);
    }

    for (var _fi = 0; _fi < _findings.length; _fi++) {
      addFinding(_panel, _findings[_fi], _elementMap[_fi]);
    }
    updateStats(_panel, _findings);

    /* Guardar también el resultado crudo de axe para el LLM */
    reportResults('axe', _findings);
    window.__a11yResults.axeRaw = {
      violations: results.violations.length,
      incomplete: results.incomplete.length,
      passes: results.passes.length,
      inapplicable: results.inapplicable.length
    };
  });
}

/* Carga axe-core si no está ya en la página */
if (typeof axe !== 'undefined') {
  _runAxe();
} else {
  var _panel = createOverlay('axe-core');
  var _loadMsg = createFinding('aviso', '', '', '', 'Cargando axe-core desde CDN…', '');
  addFinding(_panel, _loadMsg, null);

  var _script = document.createElement('script');
  _script.src = _AXE_CDN;
  _script.crossOrigin = 'anonymous';

  _script.onload = function() {
    _panel.findingsList.innerHTML = '';
    _runAxe();
  };

  _script.onerror = function() {
    _panel.findingsList.innerHTML = '';
    var _cspError = createFinding('error', '', '', '', 'No se pudo cargar axe-core desde ' + _AXE_CDN + '.', 'La página puede tener una política de seguridad (CSP) que bloquea scripts externos. Puedes usar los otros bookmarklets que no necesitan carga externa.');
    addFinding(_panel, _cspError, null);
    updateStats(_panel, [_cspError]);
  };

  document.head.appendChild(_script);
}
