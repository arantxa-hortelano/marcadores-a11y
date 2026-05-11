/* UI: panel lateral, highlights y limpieza */

var __a11yPanelObj = null;

function cleanupA11yAudit() {
  var host = document.getElementById('__a11y_audit_host');
  if (host) host.remove();
  var highlights = document.querySelectorAll('.__a11y_hl');
  for (var i = 0; i < highlights.length; i++) highlights[i].remove();
}

function createOverlay(title) {
  cleanupA11yAudit();

  var host = document.createElement('div');
  host.id = '__a11y_audit_host';
  host.style.cssText = 'all:unset;position:fixed;top:0;right:0;width:380px;max-width:90vw;height:100vh;z-index:2147483647;';

  var shadow = host.attachShadow({ mode: 'open' });

  var styleEl = document.createElement('style');
  styleEl.textContent = __a11yCSS;
  shadow.appendChild(styleEl);

  var panel = document.createElement('div');
  panel.className = 'panel';

  /* --- Cabecera --- */
  var header = document.createElement('div');
  header.className = 'header';

  var titleSpan = document.createElement('span');
  titleSpan.className = 'header-title';
  titleSpan.textContent = title;

  var statsSpan = document.createElement('span');
  statsSpan.className = 'header-stats';

  var closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Cerrar panel de auditoría');
  closeBtn.addEventListener('click', cleanupA11yAudit);

  header.appendChild(titleSpan);
  header.appendChild(statsSpan);
  header.appendChild(closeBtn);

  /* --- Barra de herramientas --- */
  var toolbar = document.createElement('div');
  toolbar.className = 'toolbar';

  var copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.textContent = 'Copiar JSON';
  copyBtn.setAttribute('aria-label', 'Copiar resultados como JSON');
  copyBtn.addEventListener('click', function() {
    if (window.__a11yResults) {
      try {
        navigator.clipboard.writeText(JSON.stringify(window.__a11yResults, null, 2)).then(function() {
          copyBtn.textContent = '✓ Copiado';
          setTimeout(function() { copyBtn.textContent = 'Copiar JSON'; }, 2000);
        });
      } catch(e) {
        var ta = document.createElement('textarea');
        ta.value = JSON.stringify(window.__a11yResults, null, 2);
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyBtn.textContent = '✓ Copiado';
        setTimeout(function() { copyBtn.textContent = 'Copiar JSON'; }, 2000);
      }
    }
  });
  toolbar.appendChild(copyBtn);

  /* --- Lista de hallazgos --- */
  var findingsList = document.createElement('div');
  findingsList.className = 'findings-list';
  findingsList.setAttribute('role', 'list');

  /* --- Pie --- */
  var footer = document.createElement('div');
  footer.className = 'footer';

  panel.appendChild(header);
  panel.appendChild(toolbar);
  panel.appendChild(findingsList);
  panel.appendChild(footer);
  shadow.appendChild(panel);
  document.body.appendChild(host);

  __a11yPanelObj = {
    host: host,
    shadow: shadow,
    panel: panel,
    findingsList: findingsList,
    statsSpan: statsSpan,
    footer: footer
  };

  return __a11yPanelObj;
}

function addFinding(panelObj, finding, element) {
  var list = panelObj.findingsList;
  var statusClass = finding.estado === 'error' ? 'error' : finding.estado === 'aviso' ? 'warning' : 'ok';
  var icon = finding.estado === 'error' ? '❌' : finding.estado === 'aviso' ? '⚠️' : '✅';

  var item = document.createElement('div');
  item.className = 'finding ' + statusClass;
  item.setAttribute('role', 'listitem');

  if (finding.criterio && WCAG[finding.criterio]) {
    var criterionDiv = document.createElement('div');
    criterionDiv.className = 'finding-criterion';
    criterionDiv.textContent = 'WCAG ' + finding.criterio + ' — ' + finding.titulo;
    item.appendChild(criterionDiv);
  }

  var row = document.createElement('div');
  row.className = 'finding-row';

  var iconSpan = document.createElement('span');
  iconSpan.className = 'finding-icon';
  iconSpan.setAttribute('aria-hidden', 'true');
  iconSpan.textContent = icon;

  var msgSpan = document.createElement('span');
  msgSpan.className = 'finding-message';
  msgSpan.textContent = finding.mensaje;

  row.appendChild(iconSpan);
  row.appendChild(msgSpan);
  item.appendChild(row);

  if (finding.html) {
    var codeDiv = document.createElement('div');
    codeDiv.className = 'finding-element';
    codeDiv.textContent = finding.html;
    item.appendChild(codeDiv);
  }

  if (element) {
    item.title = 'Clic para resaltar en la página';
    item.addEventListener('click', function() {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlightElement(element, finding.estado);
    });
  }

  list.appendChild(item);
}

function updateStats(panelObj, findings) {
  var errors   = findings.filter(function(f) { return f.estado === 'error'; }).length;
  var warnings = findings.filter(function(f) { return f.estado === 'aviso'; }).length;
  var ok       = findings.filter(function(f) { return f.estado === 'correcto'; }).length;

  var s = panelObj.statsSpan;
  s.innerHTML = '';

  function mkStat(cls, text) {
    var sp = document.createElement('span');
    sp.className = cls;
    sp.textContent = text;
    s.appendChild(sp);
  }

  if (errors)   mkStat('stat-error',   '❌ ' + errors);
  if (warnings) mkStat('stat-warning', '⚠️ ' + warnings);
  if (ok)       mkStat('stat-ok',      '✅ ' + ok);

  panelObj.footer.textContent = findings.length + ' elemento' + (findings.length !== 1 ? 's' : '') + ' analizados';
}

function highlightElement(el, status) {
  var prev = document.querySelectorAll('.__a11y_hl');
  for (var i = 0; i < prev.length; i++) prev[i].remove();

  if (!el) return;
  var rect = el.getBoundingClientRect();
  var scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  var scrollY = window.pageYOffset || document.documentElement.scrollTop;
  var color = status === 'error' ? '#ff4757' : status === 'aviso' ? '#ffa502' : '#2ed573';

  var hl = document.createElement('div');
  hl.className = '__a11y_hl';
  hl.style.cssText = [
    'position:absolute',
    'top:' + (rect.top + scrollY - 3) + 'px',
    'left:' + (rect.left + scrollX - 3) + 'px',
    'width:' + (rect.width + 6) + 'px',
    'height:' + (rect.height + 6) + 'px',
    'outline:3px solid ' + color,
    'outline-offset:0',
    'background:' + color + '22',
    'pointer-events:none',
    'z-index:2147483646',
    'border-radius:3px',
    'transition:opacity 0.5s'
  ].join(';');

  document.body.appendChild(hl);
  setTimeout(function() { hl.style.opacity = '0'; }, 2500);
  setTimeout(function() { hl.remove(); }, 3000);
}
