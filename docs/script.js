/* Carga los bookmarklets de src/, los empaqueta y genera los enlaces arrastrables */

/* SVG icons (Lucide-style, 18px viewport) */
var ICONS = {
  headings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h7"/></svg>',
  images:   '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>',
  contrast: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18" opacity=".35"/><path d="M12 3a9 9 0 0 1 0 18V3z" fill="currentColor" stroke="none"/></svg>',
  links:    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  landmarks:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="10" width="5" height="11" rx="1"/><rect x="10" y="10" width="11" height="11" rx="1"/></svg>',
  forms:    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>',
  focus:    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/></svg>',
  axe:      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>'
};

var BOOKMARKLETS = [
  {
    id: 'headings',
    name: 'Encabezados',
    action: 'Analizar encabezados',
    desc: 'Analiza la jerarquía de títulos (H1–H6): comprueba que haya un único H1, que no haya saltos de nivel y que ningún encabezado esté vacío.',
    wcag: ['1.3.1', '2.4.6'],
    shared: ['wcag.js', 'reporter.js', 'overlay.js'],
    src: 'headings.js',
    needsColor: false
  },
  {
    id: 'images',
    name: 'Imágenes',
    action: 'Analizar imágenes',
    desc: 'Verifica que todas las imágenes tengan texto alternativo descriptivo o estén marcadas como decorativas.',
    wcag: ['1.1.1', '4.1.2'],
    shared: ['wcag.js', 'reporter.js', 'overlay.js'],
    src: 'images.js',
    needsColor: false
  },
  {
    id: 'contrast',
    name: 'Contraste',
    action: 'Analizar contraste',
    desc: 'Calcula la relación de contraste del texto y componentes UI. Detecta ratios inferiores a 4,5:1 (texto normal) o 3:1 (texto grande / UI).',
    wcag: ['1.4.3', '1.4.11'],
    shared: ['wcag.js', 'color.js', 'reporter.js', 'overlay.js'],
    src: 'contrast.js',
    needsColor: true
  },
  {
    id: 'links',
    name: 'Enlaces',
    action: 'Analizar enlaces',
    desc: 'Detecta enlaces sin texto accesible, textos genéricos ("clic aquí"), enlaces con destinos ambiguos o que deberían ser botones.',
    wcag: ['2.4.4', '4.1.2'],
    shared: ['wcag.js', 'reporter.js', 'overlay.js'],
    src: 'links.js',
    needsColor: false
  },
  {
    id: 'landmarks',
    name: 'Landmarks',
    action: 'Analizar landmarks',
    desc: 'Comprueba la estructura semántica: elemento main único, header y footer, navegaciones etiquetadas, skip link y atributo lang.',
    wcag: ['1.3.1', '2.4.1', '3.1.1'],
    shared: ['wcag.js', 'reporter.js', 'overlay.js'],
    src: 'landmarks.js',
    needsColor: false
  },
  {
    id: 'forms',
    name: 'Formularios',
    action: 'Analizar formularios',
    desc: 'Verifica que los campos tengan etiquetas visibles, los grupos de opciones usen fieldset/legend y los campos personales tengan autocomplete.',
    wcag: ['1.3.5', '3.3.2', '4.1.2'],
    shared: ['wcag.js', 'reporter.js', 'overlay.js'],
    src: 'forms.js',
    needsColor: false
  },
  {
    id: 'focus',
    name: 'Foco visible',
    action: 'Analizar foco visible',
    desc: 'Detecta elementos interactivos sin indicador de foco visible, tabindex positivos y posibles problemas en el orden de tabulación.',
    wcag: ['2.4.3', '2.4.7', '2.4.11'],
    shared: ['wcag.js', 'reporter.js', 'overlay.js'],
    src: 'focus.js',
    needsColor: false
  },
  {
    id: 'axe',
    name: 'axe-core',
    action: 'Analizar con axe-core',
    desc: 'Ejecuta axe-core (biblioteca profesional de Deque) sobre la página. Carga desde CDN; puede fallar en páginas con CSP estricta.',
    wcag: ['WCAG 2.2 AA completo'],
    shared: ['wcag.js', 'reporter.js', 'overlay.js'],
    src: 'axe.js',
    needsColor: false,
    note: 'Requiere acceso a cdn.jsdelivr.net'
  }
];

var BASE = './src/';

function fetchText(url) {
  return fetch(url).then(function(r) {
    if (!r.ok) throw new Error('No se pudo cargar: ' + url + ' (' + r.status + ')');
    return r.text();
  });
}

function minify(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*[\r\n]/gm, '')
    .replace(/^[ \t]+/gm, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function buildBookmarklet(config) {
  var fetches = [];

  /* CSS siempre primero */
  fetches.push(fetchText(BASE + 'shared/overlay.css'));

  /* Módulos compartidos */
  config.shared.forEach(function(file) {
    fetches.push(fetchText(BASE + 'shared/' + file));
  });

  /* Código del bookmarklet */
  fetches.push(fetchText(BASE + config.src));

  return Promise.all(fetches).then(function(parts) {
    var css    = parts[0];
    var jsParts = parts.slice(1);

    var cssConst = 'var __a11yCSS=' + JSON.stringify(css) + ';';
    var code     = [cssConst].concat(jsParts).join('\n');
    var minified = minify(code);
    var iife     = '(function(){' + minified + '})();';

    return 'javascript:' + encodeURIComponent(iife);
  });
}

function renderCard(config, uri) {
  var card = document.createElement('div');
  card.className = 'bookmarklet-card';
  card.setAttribute('role', 'listitem');

  /* Cabecera */
  var header = document.createElement('div');
  header.className = 'card-header';

  var iconEl = document.createElement('div');
  iconEl.className = 'card-icon';
  iconEl.innerHTML = ICONS[config.id] || ICONS['headings'];

  var nameEl = document.createElement('span');
  nameEl.className = 'card-name';
  nameEl.textContent = config.name;

  header.appendChild(iconEl);
  header.appendChild(nameEl);

  /* Descripción */
  var descEl = document.createElement('p');
  descEl.className = 'card-desc';
  descEl.textContent = config.desc;

  /* Tags WCAG */
  var tagsEl = document.createElement('div');
  tagsEl.className = 'card-tags';
  config.wcag.forEach(function(tag) {
    var t = document.createElement('span');
    t.className = 'tag';
    t.textContent = tag;
    tagsEl.appendChild(t);
  });

  /* Enlace arrastrable */
  var link = document.createElement('a');

  if (uri) {
    link.className = 'drag-link';
    link.href = uri;
    link.title = 'Arrastra ' + config.name + ' a la barra de marcadores';
    link.setAttribute('aria-label', config.action + ' — arrastrar a la barra de marcadores');
    link.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>' + config.action;
  } else {
    link.className = 'drag-link error-state';
    link.href = '#';
    link.setAttribute('aria-label', 'Error al generar bookmarklet ' + config.name);
    link.textContent = 'Error al cargar';
    link.addEventListener('click', function(e) { e.preventDefault(); });
  }

  card.appendChild(header);
  card.appendChild(descEl);
  card.appendChild(tagsEl);
  card.appendChild(link);

  /* Nota especial (axe-core) */
  if (config.note) {
    var noteEl = document.createElement('p');
    noteEl.className = 'card-note';
    noteEl.textContent = config.note;
    card.appendChild(noteEl);
  }

  return card;
}

function skeletonCard(config) {
  var card = document.createElement('div');
  card.className = 'bookmarklet-card loading-skeleton';
  card.setAttribute('role', 'listitem');
  card.setAttribute('aria-label', 'Cargando ' + config.name);
  card.id = 'card-' + config.id;
  card.innerHTML = [
    '<div class="card-header">',
    '  <div class="skel skel-icon"></div>',
    '  <div class="skel skel-name"></div>',
    '</div>',
    '<div class="skel skel-line" style="width:90%"></div>',
    '<div class="skel skel-line" style="width:80%"></div>',
    '<div class="skel skel-line" style="width:65%"></div>',
    '<div class="skel skel-btn"></div>'
  ].join('');
  return card;
}

function init() {
  var grid = document.getElementById('bookmarklets-grid');
  if (!grid) return;

  var total    = BOOKMARKLETS.length;
  var resolved = 0;

  /* Mostrar skeletons mientras cargan */
  BOOKMARKLETS.forEach(function(config) {
    grid.appendChild(skeletonCard(config));
  });

  /* Construir cada bookmarklet */
  BOOKMARKLETS.forEach(function(config) {
    buildBookmarklet(config).then(function(uri) {
      var placeholder = document.getElementById('card-' + config.id);
      if (!placeholder) return;
      var newCard = renderCard(config, uri);
      placeholder.replaceWith(newCard);

      /* Affordance: pulso verde una vez que el botón está listo */
      var link = newCard.querySelector('.drag-link:not(.error-state)');
      if (link) {
        link.classList.add('drag-hint');
        link.addEventListener('animationend', function() {
          link.classList.remove('drag-hint');
        }, { once: true });
      }
    }).catch(function(err) {
      console.error('[a11y Auditor] Error generando ' + config.id + ':', err);
      var placeholder = document.getElementById('card-' + config.id);
      if (!placeholder) return;
      placeholder.replaceWith(renderCard(config, null));
    }).finally(function() {
      resolved++;
      if (resolved === total) {
        /* Anunciar al lector de pantalla que ya están listas */
        grid.setAttribute('aria-busy', 'false');
        grid.setAttribute('aria-label', total + ' bookmarklets de accesibilidad listos para instalar');
      }
    });
  });
}

/* Detectar si se abre como file:// */
if (location.protocol === 'file:') {
  var notice = document.getElementById('file-protocol-notice');
  if (notice) notice.classList.add('visible');
}

document.addEventListener('DOMContentLoaded', init);
