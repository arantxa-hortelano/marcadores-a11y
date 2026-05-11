/* Bookmarklet: Analizar formularios */
/* Criterios: 1.3.5, 3.3.2, 4.1.2 */

var _findings = [];
var _elementMap = [];

var _AUTOCOMPLETE_MAP = {
  'name': 'name', 'given-name': 'given-name', 'family-name': 'family-name',
  'email': 'email', 'tel': 'tel', 'url': 'url',
  'current-password': 'current-password', 'new-password': 'new-password',
  'username': 'username', 'organization': 'organization',
  'street-address': 'street-address', 'postal-code': 'postal-code',
  'country': 'country', 'bday': 'bday', 'sex': 'sex',
  'cc-number': 'cc-number', 'cc-name': 'cc-name', 'cc-exp': 'cc-exp'
};

var _TYPE_TO_AUTOCOMPLETE = {
  'email': 'email',
  'tel': 'tel',
  'url': 'url',
  'password': 'current-password'
};

function _getLabelForInput(input) {
  /* label[for] */
  if (input.id) {
    var lbl = document.querySelector('label[for="' + input.id + '"]');
    if (lbl) return lbl.textContent.trim();
  }
  /* Etiqueta envolvente */
  var parent = input.closest('label');
  if (parent) return parent.textContent.replace(input.value || '', '').trim();
  /* ARIA */
  var ariaLbl = input.getAttribute('aria-label');
  if (ariaLbl) return ariaLbl.trim();
  var lby = input.getAttribute('aria-labelledby');
  if (lby) {
    var ref = document.getElementById(lby);
    if (ref) return ref.textContent.trim();
  }
  /* title o placeholder como último recurso (no válido como label accesible formal) */
  if (input.getAttribute('title')) return null;
  return null;
}

var _controls = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), select, textarea');

for (var _ci = 0; _ci < _controls.length; _ci++) {
  var _ctrl = _controls[_ci];
  if (getComputedStyle(_ctrl).display === 'none') continue;

  var _type = (_ctrl.getAttribute('type') || 'text').toLowerCase();
  var _label = _getLabelForInput(_ctrl);

  /* Sin label */
  if (_label === null) {
    var _titleFallback = _ctrl.getAttribute('title');
    var _placeholderFallback = _ctrl.getAttribute('placeholder');
    if (_titleFallback || _placeholderFallback) {
      _findings.push(createFinding('aviso', '3.3.2', getSelector(_ctrl), getSnippet(_ctrl), 'El campo usa title/placeholder como única etiqueta visible: "' + (_titleFallback || _placeholderFallback) + '". El placeholder desaparece al escribir.', 'Añade un <label> o aria-label permanente y visualmente visible.'));
      _elementMap.push(_ctrl);
    } else {
      _findings.push(createFinding('error', '3.3.2', getSelector(_ctrl), getSnippet(_ctrl), 'Campo sin etiqueta accesible. Los lectores de pantalla no pueden identificar qué se pide.', 'Añade un <label for="idDelCampo"> o un atributo aria-label.'));
      _elementMap.push(_ctrl);
    }
    continue;
  }

  /* Label correcto */
  _findings.push(createFinding('correcto', '3.3.2', getSelector(_ctrl), 'Label: "' + _label.substring(0, 60) + '"', 'Campo con etiqueta accesible — correcto.', ''));
  _elementMap.push(_ctrl);

  /* Autocomplete para campos de datos personales */
  var _expectedAC = _TYPE_TO_AUTOCOMPLETE[_type];
  if (_expectedAC) {
    var _ac = _ctrl.getAttribute('autocomplete');
    if (!_ac || _ac === 'off') {
      _findings.push(createFinding('aviso', '1.3.5', getSelector(_ctrl), getSnippet(_ctrl), 'Campo de tipo "' + _type + '" sin autocomplete. Los gestores de contraseñas y autorrelleno no pueden ayudar al usuario.', 'Añade autocomplete="' + _expectedAC + '" para facilitar el relleno automático.'));
      _elementMap.push(_ctrl);
    }
  }

  /* required sin aria-required cuando no tiene required HTML */
  if (_ctrl.getAttribute('aria-required') === 'true' && !_ctrl.hasAttribute('required')) {
    _findings.push(createFinding('aviso', '4.1.2', getSelector(_ctrl), getSnippet(_ctrl), 'Campo con aria-required="true" pero sin el atributo HTML required. Mejor usar el atributo HTML nativo.', 'Reemplaza aria-required="true" por el atributo required.'));
    _elementMap.push(_ctrl);
  }
}

/* Grupos de radio/checkbox sin fieldset+legend */
var _radioGroups = {};
var _radios = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
for (var _ri = 0; _ri < _radios.length; _ri++) {
  var _r = _radios[_ri];
  var _rname = _r.getAttribute('name') || ('__noname_' + _ri);
  if (!_radioGroups[_rname]) _radioGroups[_rname] = [];
  _radioGroups[_rname].push(_r);
}

for (var _gname in _radioGroups) {
  var _group = _radioGroups[_gname];
  if (_group.length < 2) continue;
  var _inFieldset = _group[0].closest('fieldset');
  if (!_inFieldset) {
    var _grpType = _group[0].getAttribute('type');
    _findings.push(createFinding('aviso', '1.3.1', getSelector(_group[0]), getSnippet(_group[0]), 'Grupo de ' + _group.length + ' ' + _grpType + 's sin <fieldset><legend>. Los lectores de pantalla no relacionan las opciones entre sí.', 'Envuelve el grupo en <fieldset><legend>Título del grupo</legend>...opciones...</fieldset>.'));
    _elementMap.push(_group[0]);
  } else {
    var _legend = _inFieldset.querySelector('legend');
    if (_legend && _legend.textContent.trim()) {
      _findings.push(createFinding('correcto', '1.3.1', getSelector(_group[0]), '<fieldset><legend>' + _legend.textContent.trim().substring(0, 40) + '</legend>', 'Grupo con fieldset y legend — correcto.', ''));
      _elementMap.push(_group[0]);
    } else {
      _findings.push(createFinding('aviso', '1.3.1', getSelector(_inFieldset), getSnippet(_inFieldset), 'Fieldset sin <legend> o con legend vacío. El grupo de opciones no tiene título accesible.', 'Añade un <legend> descriptivo dentro del fieldset.'));
      _elementMap.push(_inFieldset);
    }
  }
}

/* Botones de envío */
var _submitBtns = document.querySelectorAll('button[type="submit"], input[type="submit"], button:not([type])');
for (var _si = 0; _si < _submitBtns.length; _si++) {
  var _sb = _submitBtns[_si];
  var _sbText = (_sb.textContent || _sb.getAttribute('value') || _sb.getAttribute('aria-label') || '').trim();
  if (!_sbText) {
    _findings.push(createFinding('error', '4.1.2', getSelector(_sb), getSnippet(_sb), 'Botón de envío sin texto accesible.', 'Añade texto descriptivo al botón o un aria-label.'));
    _elementMap.push(_sb);
  }
}

if (_controls.length === 0) {
  _findings.push(createFinding('correcto', '3.3.2', 'documento', '', 'No se encontraron campos de formulario en la página.', ''));
  _elementMap.push(null);
}

var _panel = createOverlay('Formularios');
for (var _fi = 0; _fi < _findings.length; _fi++) {
  addFinding(_panel, _findings[_fi], _elementMap[_fi]);
}
updateStats(_panel, _findings);
reportResults('forms', _findings);
