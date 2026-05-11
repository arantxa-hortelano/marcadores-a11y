/* Genera window.__a11yResults y utilidades para crear hallazgos */

function createFinding(estado, criterioId, selector, htmlSnippet, mensaje, sugerencia) {
  var criterio = WCAG[criterioId] || { titulo: criterioId, nivel: '?', descripcion: '' };
  return {
    estado: estado,
    criterio: criterioId,
    titulo: criterio.titulo,
    nivel: criterio.nivel,
    selector: selector || '',
    html: htmlSnippet || '',
    mensaje: mensaje || '',
    sugerencia: sugerencia || ''
  };
}

function getSelector(el) {
  if (!el) return '';
  if (el.id) return '#' + el.id;
  var tag = el.tagName ? el.tagName.toLowerCase() : '';
  var classes = Array.prototype.slice.call(el.classList || []).slice(0, 2).map(function(c) { return '.' + c; }).join('');
  return tag + classes || tag;
}

function getSnippet(el) {
  if (!el) return '';
  var outer = el.outerHTML || '';
  if (outer.length > 140) outer = outer.substring(0, 140) + '…';
  return outer;
}

function reportResults(bookmarkletName, findings) {
  window.__a11yResults = {
    bookmarklet: bookmarkletName,
    timestamp: new Date().toISOString(),
    url: location.href,
    resumen: {
      total: findings.length,
      errores: findings.filter(function(f) { return f.estado === 'error'; }).length,
      avisos: findings.filter(function(f) { return f.estado === 'aviso'; }).length,
      correctos: findings.filter(function(f) { return f.estado === 'correcto'; }).length
    },
    hallazgos: findings
  };
  console.log('[a11y Auditor] Resultados en window.__a11yResults (' + bookmarkletName + ')');
  console.table(window.__a11yResults.resumen);
}
